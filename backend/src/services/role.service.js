const AppError = require('../utils/app-error');
const { slugify } = require('../utils/slug');
const RoleModel = require('../models/role.model');
const UserCompanyRoleModel = require('../models/user-company-role.model');
const BaseCrudService = require('./base-crud.service');

class RoleService extends BaseCrudService {
  static model = RoleModel;
  static entityName = 'Rol';
  static hasSoftDelete = false;
  static include = { _count: { select: { userCompanyRoles: true } } };

  static async validate(companyId, data, id) {
    if (!data.name) return;
    await this.assertUnique(companyId, 'slug', slugify(data.name), id, 'Ya existe un rol con ese nombre');
  }

  static toCreateData(companyId, data) {
    return { ...data, companyId, slug: slugify(data.name) };
  }

  // Los roles de sistema (como admin) son la base de los permisos: no se modifican
  static async assertEditable(companyId, id) {
    const role = await this.getById(companyId, id);
    if (role.isSystem) throw new AppError('Los roles de sistema no se pueden modificar', 409);
  }

  static async update(companyId, id, data) {
    await this.assertEditable(companyId, id);
    return super.update(companyId, id, data.name ? { ...data, slug: slugify(data.name) } : data);
  }

  static async remove(companyId, id) {
    await this.assertEditable(companyId, id);

    const assigned = await UserCompanyRoleModel.count({ roleId: id });
    if (assigned > 0) throw new AppError('El rol está asignado a usuarios', 409);

    await RoleModel.remove(id);
  }
}

module.exports = RoleService;
