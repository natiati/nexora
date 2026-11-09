const path = require('path');
const dotenv = require('dotenv');

const MAIL_VARIABLES = /^(SMTP_|MAIL_)/;

// Carga backend/.env. Normalmente una variable del sistema le gana al archivo, pero para el correo
// manda el archivo: otros programas del equipo pueden definir SMTP_HOST o SMTP_PASS de forma global.
// En producción no hay .env, así que se usan las variables del hosting.
function loadEnv() {
  const { parsed = {} } = dotenv.config({ path: path.join(__dirname, '../../.env'), quiet: true });

  for (const [name, value] of Object.entries(parsed)) {
    // Las variables de correo del archivo siempre sobreescriben las del sistema (intencional)
    if (MAIL_VARIABLES.test(name)) process.env[name] = value;
  }
}

module.exports = { loadEnv };
