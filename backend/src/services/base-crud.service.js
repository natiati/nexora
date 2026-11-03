const AppError = require('../utils/app-error');

/**
 * Operaciones comunes de los catálogos de una empresa. Cada subclase indica su modelo y,
 * si lo necesita, cambia el alcance (`scope`) o agrega reglas en `validate`.
 * Toda consulta se filtra por empresa: un usuario nunca ve ni edita datos de otra.
 */
class BaseCrudService {
  static model;
  static entityName = 'Registro';
  static searchFields = ['name'];
  static hasSoftDelete = true;
  static include = undefined;

  static scope(companyId) {
    return { companyId, ...(this.hasSoftDelete ? { deletedAt: null } : {}) };
  }

  static searchWhere(q) {
    if (!q) return {};
    return { OR: this.searchFields.map((field) => ({ [field]: { contains: q, mode: 'insensitive' } })) };
  }

  static get options() {
    return this.include ? { include: this.include } : {};
  }

  static async list(companyId, { skip, take, q }) {
    const where = { ...this.scope(companyId), ...this.searchWhere(q) };
    const [data, total] = await Promise.all([
      this.model.findAll(where, { ...this.options, orderBy: { createdAt: 'desc' }, skip, take }),
      this.model.count(where)
    ]);
    return { data, total };
  }

  static async getById(companyId, id) {
    const record = await this.model.findOne({ id, ...this.scope(companyId) }, this.options);
    if (!record) throw new AppError(`${this.entityName} no encontrado`, 404);
    return record;
  }

  // Reglas de negocio antes de guardar; `id` solo llega al editar
  static async validate() {}

  // Datos finales que se insertan; por defecto agrega la empresa del usuario
  static toCreateData(companyId, data) {
    return { ...data, companyId };
  }

  static async create(companyId, data) {
    await this.validate(companyId, data);
    return this.model.create(this.toCreateData(companyId, data), this.options);
  }

  static async update(companyId, id, data) {
    await this.getById(companyId, id);
    await this.validate(companyId, data, id);
    return this.model.update(id, data, this.options);
  }

  static async remove(companyId, id) {
    await this.getById(companyId, id);
    await this.model.softDelete(id);
  }

  // Comprueba que no exista otro registro de la empresa con el mismo valor
  static async assertUnique(companyId, field, value, id, message) {
    if (!value) return;
    const other = await this.model.findOne({ ...this.scope(companyId), [field]: value, ...(id ? { NOT: { id } } : {}) });
    if (other) throw new AppError(message, 409);
  }
}

module.exports = BaseCrudService;
