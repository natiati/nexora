const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');

/**
 * Modelo de la tabla `users`.
 * Hereda de BaseModel el CRUD común (findAll, findById, create, update, remove, count).
 * Las columnas y relaciones coinciden con schema.prisma.
 */
class UserModel extends BaseModel {
  static prismaModel = prisma.user;

  static tableName = 'users';

  // Columnas de la tabla: nombre en la base de datos, nombre en Prisma, tipo, si es obligatoria y llave
  static columns = [
    { column: 'id', property: 'id', type: 'TEXT', required: true, key: 'PK', default: 'uuid()' },
    { column: 'email', property: 'email', type: 'VARCHAR(150)', required: true, unique: true },
    { column: 'password_hash', property: 'passwordHash', type: 'VARCHAR(255)', required: true },
    { column: 'first_name', property: 'firstName', type: 'VARCHAR(80)', required: true },
    { column: 'last_name', property: 'lastName', type: 'VARCHAR(80)', required: true },
    { column: 'phone', property: 'phone', type: 'VARCHAR(30)', required: false },
    { column: 'avatar_url', property: 'avatarUrl', type: 'VARCHAR(500)', required: false },
    { column: 'is_active', property: 'isActive', type: 'BOOLEAN', required: true, default: 'true' },
    { column: 'email_verified_at', property: 'emailVerifiedAt', type: 'TIMESTAMP(3)', required: false },
    { column: 'last_login_at', property: 'lastLoginAt', type: 'TIMESTAMP(3)', required: false },
    { column: 'created_at', property: 'createdAt', type: 'TIMESTAMP(3)', required: true, default: 'now()' },
    { column: 'updated_at', property: 'updatedAt', type: 'TIMESTAMP(3)', required: true },
    { column: 'deleted_at', property: 'deletedAt', type: 'TIMESTAMP(3)', required: false }
  ];

  // Relaciones con otras tablas
  static relations = {
    companyRoles: { model: 'UserCompanyRole', type: 'hasMany' }
  };

  // Busca por correo (es único); se usa en el inicio de sesión
  static async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }

  // Usuarios activos y no eliminados
  static async findActive() {
    return prisma.user.findMany({ where: { isActive: true, deletedAt: null }, orderBy: { createdAt: 'desc' } });
  }

  // Usuario con sus roles por empresa
  static async findWithRoles(id) {
    return prisma.user.findUnique({
      where: { id },
      include: { companyRoles: { include: { role: true } } }
    });
  }
}

module.exports = UserModel;