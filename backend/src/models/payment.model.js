const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');
class PaymentModel extends BaseModel {
  static prismaModel = prisma.payment;
  static async findByInvoice(invoiceId) {
    return prisma.payment.findMany({ where: { invoiceId } });
  }
}
module.exports = PaymentModel;
