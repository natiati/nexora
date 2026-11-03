const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const mailer = require('../lib/mailer');
const AppError = require('../utils/app-error');
const UserModel = require('../models/user.model');
const EmailService = require('./email.service');

const SALT_ROUNDS = 10;
const RESET_PURPOSE = 'password_reset';
const INVALID_RESET_LINK = 'El enlace no es válido o ya venció. Solicita uno nuevo.';

// Huella de la contraseña dentro del JWT: al cambiarla, las sesiones abiertas dejan de servir
function passwordVersion(user) {
  return crypto.createHash('sha256').update(user.passwordHash).digest('hex').slice(0, 16);
}

// El schema no tiene tabla de tokens: el enlace es un JWT firmado también con la contraseña actual.
// Al cambiarla, la firma deja de coincidir, así que el enlace solo sirve una vez.
function resetSecret(user) {
  return process.env.JWT_SECRET + user.passwordHash;
}

function frontendUrl() {
  const origin = process.env.FRONTEND_URL || process.env.CORS_ORIGIN?.split(',')[0] || 'http://localhost:5173';
  return origin.trim().replace(/\/$/, '');
}

// Empresa del usuario: su rol predeterminado, o el primero que tenga
function getMembership(user) {
  return user.companyRoles.find((r) => r.isDefault) ?? user.companyRoles[0];
}

class AuthService {
  // POST /login: valida credenciales y entrega un JWT de 8 horas
  static async login({ email, password }) {
    const user = await UserModel.findByEmailWithRoles(email);

    // Mismo mensaje para "no existe", "inactivo" y "clave incorrecta": no revela qué falló
    if (!user || !user.isActive || user.deletedAt) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const membership = getMembership(user);
    if (!membership?.role.companyId) {
      throw new AppError('Tu usuario no tiene una empresa asignada', 403);
    }

    await UserModel.update(user.id, { lastLoginAt: new Date() });

    const token = jwt.sign(
      { userId: user.id, email: user.email, pv: passwordVersion(user) },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        companyId: membership.role.companyId,
        companyName: membership.role.company?.name ?? null,
        role: membership.role.slug,
        roleName: membership.role.name
      }
    };
  }

  // Lo usa el middleware de autenticación en cada petición protegida
  static async resolveSession(userId, version) {
    const user = await UserModel.findWithRoles(userId);

    if (!user || !user.isActive || user.deletedAt || version !== passwordVersion(user)) {
      throw new AppError('Sesión no válida', 401);
    }

    const membership = getMembership(user);
    if (!membership?.role.companyId) {
      throw new AppError('Tu usuario no tiene una empresa asignada', 403);
    }

    return {
      id: user.id,
      email: user.email,
      companyId: membership.role.companyId,
      role: membership.role.slug
    };
  }

  // POST /password/forgot. Siempre responde igual y el trabajo sigue en segundo plano:
  // ni el mensaje ni el tiempo de respuesta revelan si el correo está registrado.
  static async requestPasswordReset({ email }) {
    AuthService.sendResetLink(email).catch((error) => {
      console.error(`No se pudo enviar el correo de recuperación: ${error.message || error.code}`);
    });

    return { message: 'Si el correo está registrado, te enviamos un enlace para restablecer la contraseña' };
  }

  static async sendResetLink(email) {
    const user = await UserModel.findByEmail(email);
    if (!user || !user.isActive || user.deletedAt) return;

    const token = jwt.sign({ userId: user.id, purpose: RESET_PURPOSE }, resetSecret(user), { expiresIn: '1h' });
    // Va después del #: esa parte de la URL no viaja al servidor ni queda en sus registros
    const link = `${frontendUrl()}/restablecer-contrasena#token=${token}`;

    if (!mailer.isConfigured()) {
      console.warn('Correo sin configurar: no se envió el enlace de recuperación');
      if (process.env.NODE_ENV !== 'production') console.warn(`Enlace (solo en desarrollo): ${link}`);
      return;
    }

    await EmailService.sendPasswordReset(user.email, link);
  }

  // POST /password/reset
  static async resetPassword({ token, password }) {
    const user = await AuthService.findUserByResetToken(token);

    await UserModel.update(user.id, { passwordHash: await bcrypt.hash(password, SALT_ROUNDS) });

    if (mailer.isConfigured()) {
      EmailService.sendPasswordChanged(user.email).catch((error) => {
        console.error(`No se pudo enviar el aviso de contraseña: ${error.message || error.code}`);
      });
    }

    return { message: 'Contraseña actualizada' };
  }

  static async findUserByResetToken(token) {
    // Primero se lee sin verificar, solo para saber con qué contraseña se firmó; abajo se verifica
    const userId = jwt.decode(token)?.userId;
    const user = typeof userId === 'string' ? await UserModel.findById(userId) : null;

    if (!user || !user.isActive || user.deletedAt) {
      throw new AppError(INVALID_RESET_LINK, 400);
    }

    try {
      const payload = jwt.verify(token, resetSecret(user), { algorithms: ['HS256'] });
      if (payload.purpose !== RESET_PURPOSE) throw new Error('Propósito incorrecto');
    } catch {
      throw new AppError(INVALID_RESET_LINK, 400);
    }

    return user;
  }
}

module.exports = AuthService;
