const prisma = require('../lib/prisma');

/**
 * Clase base de todos los modelos (una subclase por tabla).
 * Los modelos son la única capa que habla con Prisma: los services nunca lo importan.
 * El último parámetro `tx` permite ejecutar la operación dentro de una transacción.
 */
class BaseModel {
  /** Nombre del delegado de Prisma de la tabla (prisma.<delegate>); cada subclase lo define. */
  static delegate;

  static db(tx) {
    return (tx ?? prisma)[this.delegate];
  }

  static async findAll(where = {}, options = {}, tx) {
    return this.db(tx).findMany({ where, ...options });
  }

  static async findOne(where, options = {}, tx) {
    return this.db(tx).findFirst({ where, ...options });
  }

  static async findById(id, options = {}, tx) {
    return this.db(tx).findUnique({ where: { id }, ...options });
  }

  static async count(where = {}, tx) {
    return this.db(tx).count({ where });
  }

  static async create(data, options = {}, tx) {
    return this.db(tx).create({ data, ...options });
  }

  static async update(id, data, options = {}, tx) {
    return this.db(tx).update({ where: { id }, data, ...options });
  }

  static async updateMany(where, data, tx) {
    return this.db(tx).updateMany({ where, data });
  }

  static async remove(id, tx) {
    return this.db(tx).delete({ where: { id } });
  }

  // Borrado lógico: solo para las tablas que tienen deleted_at
  static async softDelete(id, tx) {
    return this.db(tx).update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  }

  // Ejecuta varias operaciones como una sola unidad: o se guardan todas o ninguna
  static async transaction(work) {
    return prisma.$transaction(work, { timeout: 15000 });
  }
}

module.exports = BaseModel;
