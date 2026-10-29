class BaseModel {
  /** Delegado de Prisma correspondiente a la tabla; cada subclase lo define. */
  static prismaModel;

  static async findAll(where = {}, options = {}) {
    return this.prismaModel.findMany({ where, ...options });
  }

  static async findById(id) {
    return this.prismaModel.findUnique({ where: { id } });
  }

    static async create(data, options = {}) {
    return this.prismaModel.create({ data, ...options });
  }

  static async update(id, data) {
    return this.prismaModel.update({ where: { id }, data });
  }

  static async remove(id) {
    return this.prismaModel.delete({ where: { id } });
  }

    static async count(where = {}) {
    return this.prismaModel.count({ where });
  }
}

module.exports = BaseModel;
// esta clase es la base para todos los modelos, y define métodos genéricos para interactuar con la base de datos a través de Prisma. Cada subclase debe definir su propio `prismaModel` correspondiente a la tabla que representa.