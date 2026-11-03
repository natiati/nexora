const AppError = require('../utils/app-error');
const mailer = require('../lib/mailer');
const CompanyModel = require('../models/company.model');
const CustomerInteractionModel = require('../models/customer-interaction.model');
const CustomerModel = require('../models/customer.model');
const UserModel = require('../models/user.model');
const EmailService = require('./email.service');

const INTERACTION_TYPE = 'demo_request';
const CONFIRMATION_INTERVAL_MS = 24 * 60 * 60 * 1000;

// Las solicitudes de la landing entran al CRM: el prospecto es un cliente (customers)
// y la solicitud es una interacción (customer_interactions). No hace falta otra tabla.
class DemoRequestService {
  // Empresa que atiende las solicitudes: LEADS_COMPANY_ID o, si no está definida, la primera creada
  static async getOwnerCompany() {
    const configured = process.env.LEADS_COMPANY_ID;
    const company = configured
      ? await CompanyModel.findOne({ id: configured, isActive: true })
      : await CompanyModel.findOne({ isActive: true }, { orderBy: { createdAt: 'asc' } });

    if (!company) throw new AppError('Las solicitudes no están disponibles en este momento', 503);
    return company;
  }

  // POST /demo-requests (pública). La respuesta es igual aunque el correo ya exista:
  // un visitante no puede averiguar quién es cliente.
  static async create({ name, company, email }) {
    const owner = await this.getOwnerCompany();
    const admin = await UserModel.findOne({
      deletedAt: null,
      isActive: true,
      companyRoles: { some: { role: { companyId: owner.id, slug: 'admin' } } }
    });

    if (!admin) throw new AppError('Las solicitudes no están disponibles en este momento', 503);

    const { isFirstToday } = await CustomerModel.transaction(async (tx) => {
      const existing = await CustomerModel.findOne({ companyId: owner.id, email, deletedAt: null }, {}, tx);
      const customer = existing ?? await CustomerModel.create(
        { companyId: owner.id, name: company, email, notes: 'Prospecto: solicitó una demo desde la landing' },
        {},
        tx
      );

      // Si ya pidió una demo hoy no se le vuelve a escribir: evita saturar un correo ajeno
      const recent = await CustomerInteractionModel.count({
        customerId: customer.id,
        type: INTERACTION_TYPE,
        interactionDate: { gte: new Date(Date.now() - CONFIRMATION_INTERVAL_MS) }
      }, tx);

      await CustomerInteractionModel.create(
        {
          companyId: owner.id,
          customerId: customer.id,
          userId: admin.id,
          type: INTERACTION_TYPE,
          subject: name,
          content: `${name}, de ${company}, solicitó una demo desde la landing. Correo: ${email}`,
          interactionDate: new Date()
        },
        {},
        tx
      );

      return { isFirstToday: recent === 0 };
    });

    // Fuera de la transacción y sin esperar: la solicitud ya está guardada aunque el correo falle,
    // y el visitante no se queda esperando al servidor SMTP.
    this.sendEmails({ name, company, email }, isFirstToday);

    return { message: 'Solicitud recibida' };
  }

  static async sendEmails(request, isFirstToday) {
    if (!mailer.isConfigured()) {
      console.warn('Correo sin configurar: la solicitud de demo se guardó, pero no se enviaron correos');
      return;
    }

    const results = await Promise.allSettled([
      EmailService.notifyDemoRequest(request),
      ...(isFirstToday ? [EmailService.confirmDemoRequest(request.email)] : [])
    ]);

    for (const result of results) {
      if (result.status === 'rejected') {
        console.error(`No se pudo enviar un correo de solicitud de demo: ${result.reason.message}`);
      }
    }
  }

  // GET /demo-requests: solicitudes de la empresa del usuario, de la más reciente a la más antigua
  static async list(companyId, { skip, take }) {
    const where = { companyId, type: INTERACTION_TYPE };
    const [data, total] = await Promise.all([
      CustomerInteractionModel.findAll(where, {
        include: { customer: true },
        orderBy: { interactionDate: 'desc' },
        skip,
        take
      }),
      CustomerInteractionModel.count(where)
    ]);
    return { data, total };
  }
}

module.exports = DemoRequestService;
