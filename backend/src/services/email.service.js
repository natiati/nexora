const mailer = require('../lib/mailer');

const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Un salto de línea no debe colarse en el asunto
const singleLine = (text) => text.replace(/\s+/g, ' ').trim();

function layout(title, bodyHtml) {
  return `<div style="font-family:Arial,sans-serif;color:#0f172a;max-width:520px;margin:0 auto;padding:24px">
  <div style="font-size:20px;font-weight:700;margin-bottom:16px">Nexora</div>
  <h1 style="font-size:18px;margin:0 0 12px">${title}</h1>
  ${bodyHtml}
</div>`;
}

class EmailService {
  // Avisa al equipo. Responder el correo le escribe directamente a quien pidió la demo.
  static async notifyDemoRequest({ name, company, email }) {
    const to = process.env.MAIL_NOTIFY_TO || process.env.SMTP_USER;
    if (!to) {
      console.warn('Correo: define MAIL_NOTIFY_TO para recibir las solicitudes de demo');
      return;
    }

    await mailer.sendMail({
      to,
      replyTo: email,
      subject: singleLine(`Nueva solicitud de demo: ${company}`),
      text: `Nombre: ${name}\nEmpresa: ${company}\nCorreo: ${email}\n\nTambién quedó registrada en Solicitudes de demo.`,
      html: layout('Nueva solicitud de demo', `<p><b>Nombre:</b> ${escapeHtml(name)}<br>
  <b>Empresa:</b> ${escapeHtml(company)}<br>
  <b>Correo:</b> ${escapeHtml(email)}</p>
  <p>También quedó registrada en Solicitudes de demo.</p>`)
    });
  }

  static async sendPasswordReset(email, link) {
    await mailer.sendMail({
      to: email,
      subject: 'Restablece tu contraseña de Nexora',
      text: `Recibimos una solicitud para cambiar tu contraseña. Abre este enlace, válido por 1 hora:\n\n${link}\n\nSi no fuiste tú, ignora este mensaje: tu contraseña no cambiará.`,
      html: layout('Restablece tu contraseña', `<p>Recibimos una solicitud para cambiar tu contraseña. El enlace es válido por 1 hora.</p>
  <p><a href="${escapeHtml(link)}" style="display:inline-block;background:#0f766e;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">Cambiar contraseña</a></p>
  <p style="color:#64748b;font-size:13px">Si no fuiste tú, ignora este mensaje: tu contraseña no cambiará.</p>`)
    });
  }

  // Aviso de seguridad: si no fue el usuario, se entera de inmediato
  static async sendPasswordChanged(email) {
    const text = 'La contraseña de tu cuenta de Nexora acaba de cambiar. Si no fuiste tú, avísale de inmediato al administrador de tu empresa.';

    await mailer.sendMail({
      to: email,
      subject: 'Tu contraseña de Nexora cambió',
      text,
      html: layout('Tu contraseña cambió', `<p>${text}</p>`)
    });
  }

  // Confirmación al visitante. El correo todavía no está verificado, así que el texto es fijo:
  // nadie puede usar el formulario público para enviarle su propio mensaje a un tercero.
  static async confirmDemoRequest(email) {
    const text = 'Recibimos tu solicitud de demo de Nexora. Te escribiremos pronto para agendarla.';

    await mailer.sendMail({
      to: email,
      subject: 'Recibimos tu solicitud de demo de Nexora',
      text: `${text}\n\nSi no fuiste tú, puedes ignorar este mensaje.`,
      html: layout('Recibimos tu solicitud', `<p>${text}</p>
  <p style="color:#64748b;font-size:13px">Si no fuiste tú, puedes ignorar este mensaje.</p>`)
    });
  }
}

module.exports = EmailService;
