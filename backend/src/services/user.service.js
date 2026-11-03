const bcrypt = require('bcrypt');

const AppError = require('../utils/app-error');
const RoleModel = require('../models/role.model');
const UserCompanyRoleModel = require('../models/user-company-role.model');
const UserModel = require('../models/user.model');

const SALT_ROUNDS = 10;

// Nunca se devuelve el hash de la contraseña
function toPublicUser({ passwordHash, companyRoles, ...user }, companyId) {
  const membership = companyRoles?.find((m) => m.role.companyId === companyId);
  return { ...user, role: membership?.role ?? null };
}

class UserService {
  static scope(companyId) {
    return { deletedAt: null, companyRoles: { some: { role: { companyId } } } };
  }

  static get include() {
    return { companyRoles: { include: { role: true } } };
  }

  static async list(companyId, { skip, take, q }) {
    const where = { ...this.scope(companyId) };
    if (q) {
      where.OR = ['firstName', 'lastName', 'email'].map((field) => ({ [field]: { contains: q, mode: 'insensitive' } }));
    }

    const [users, total] = await Promise.all([
      UserModel.findAll(where, { include: this.include, orderBy: { createdAt: 'desc' }, skip, take }),
      UserModel.count(where)
    ]);

    return { data: users.map((user) => toPublicUser(user, companyId)), total };
  }

  static async getOwned(companyId, id) {
    const user = await UserModel.findOne({ id, ...this.scope(companyId) }, { include: this.include });
    if (!user) throw new AppError('Usuario no encontrado', 404);
    return user;
  }

  static async assertRole(companyId, roleId) {
    const role = await RoleModel.findOne({ id: roleId, companyId });
    if (!role) throw new AppError('Rol no encontrado', 404);
  }

  static async create(companyId, { password, roleId, ...data }) {
    await this.assertRole(companyId, roleId);

    // El correo es único en toda la plataforma
    if (await UserModel.findByEmail(data.email)) {
      throw new AppError('Ya existe un usuario con ese correo', 409);
    }

    const user = await UserModel.create(
      {
        ...data,
        passwordHash: await bcrypt.hash(password, SALT_ROUNDS),
        companyRoles: { create: { roleId, isDefault: true } }
      },
      { include: this.include }
    );

    return toPublicUser(user, companyId);
  }

  static async update(companyId, id, currentUserId, { password, roleId, ...data }) {
    const user = await this.getOwned(companyId, id);

    if (id === currentUserId && data.isActive === false) {
      throw new AppError('No puedes desactivar tu propio usuario', 409);
    }

    const membership = user.companyRoles.find((m) => m.role.companyId === companyId);
    const roleChanged = roleId && roleId !== membership.roleId;

    if (roleChanged) {
      await this.assertRole(companyId, roleId);
      if (id === currentUserId) throw new AppError('No puedes cambiar tu propio rol', 409);
    }

    if (password) data.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const updated = await UserModel.transaction(async (tx) => {
      if (roleChanged) await UserCompanyRoleModel.update(membership.id, { roleId }, {}, tx);
      return UserModel.update(id, data, { include: this.include }, tx);
    });

    return toPublicUser(updated, companyId);
  }

  static async remove(companyId, id, currentUserId) {
    await this.getOwned(companyId, id);

    if (id === currentUserId) {
      throw new AppError('No puedes eliminar tu propio usuario', 409);
    }

    await UserModel.softDelete(id);
  }
}

module.exports = UserService;
