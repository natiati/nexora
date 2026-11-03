const nodemailer = require('nodemailer');

// Único punto que habla con el servidor de correo (SMTP), igual que lib/prisma.js con la base de datos.
// La configuración se lee al enviar: sin SMTP_HOST la aplicación funciona, pero no envía correos.
function getSender() {
  return process.env.MAIL_FROM || process.env.SMTP_USER;
}

function isConfigured() {
  return Boolean(process.env.SMTP_HOST && getSender());
}

function createTransport() {
  const port = Number(process.env.SMTP_PORT) || 587;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // 465 cifra desde el inicio; 587 empieza sin cifrar y sube a TLS con STARTTLS
    secure: port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000
  });
}

async function sendMail(message) {
  return createTransport().sendMail({ from: getSender(), ...message });
}

// Comprueba la conexión y las credenciales sin enviar nada
async function verifyConnection() {
  return createTransport().verify();
}

module.exports = { isConfigured, sendMail, verifyConnection };
