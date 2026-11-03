// Comprueba la configuración de correo: npm run mail:test
// Envía un mensaje de prueba a MAIL_NOTIFY_TO (o a SMTP_USER).
require('../src/lib/env').loadEnv();
const mailer = require('../src/lib/mailer');

async function main() {
  if (!mailer.isConfigured()) {
    throw new Error('Faltan variables: define SMTP_HOST y SMTP_USER o MAIL_FROM en backend/.env');
  }

  const to = process.env.MAIL_NOTIFY_TO || process.env.SMTP_USER;
  if (!to) throw new Error('Falta el destinatario: define MAIL_NOTIFY_TO en backend/.env');

  await mailer.verifyConnection();
  console.log('Conexión y credenciales correctas');

  await mailer.sendMail({
    to,
    subject: 'Prueba de correo de Nexora',
    text: 'Si lees esto, el servicio de correo de Nexora funciona.'
  });
  console.log(`Correo de prueba enviado a ${to}`);
}

main().catch((error) => {
  console.error(`No se pudo enviar: ${error.message || error.code}`);
  process.exitCode = 1;
});
