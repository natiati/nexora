// backend/server.js
// Punto de entrada: carga el entorno y arranca el servidor HTTP.
require('./src/lib/env').loadEnv();

// Sin estas variables el servidor no debe arrancar
for (const name of ['DATABASE_URL', 'JWT_SECRET']) {
  if (!process.env[name]) {
    console.error(`Falta la variable de entorno ${name} (revisa backend/.env)`);
    process.exit(1);
  }
}

const app = require('./src/app');

if (!process.env.SMTP_HOST) {
  console.warn('Correo sin configurar (SMTP_HOST): las solicitudes de demo se guardan, pero no se envían correos');
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
