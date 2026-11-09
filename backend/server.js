// backend/server.js
// Punto de entrada: carga el entorno y arranca el servidor HTTP.
require('./src/lib/env').loadEnv();

// Sin estas variables el servidor no debe arrancar
for (const name of ['DATABASE_URL', 'JWT_SECRET']) {
  if (!process.env[name]) {
    console.error(`[ERROR] Falta la variable de entorno requerida: ${name}`);
    console.error('Revisa backend/.env.example para ver las variables necesarias.');
    process.exit(1);
  }
}

const app = require('./src/app');

if (!process.env.SMTP_HOST) {
  console.warn('[ADVERTENCIA] Correo sin configurar (SMTP_HOST): las solicitudes de demo se guardan, pero no se envían correos');
}

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log(`[OK] Servidor corriendo en http://localhost:${PORT} (${process.env.NODE_ENV ?? 'development'})`);
});

// Cierre ordenado: espera a que las conexiones terminen antes de salir
function shutdown(signal) {
  console.log(`[INFO] ${signal} recibido, cerrando servidor...`);
  server.close(() => {
    console.log('[INFO] Servidor cerrado');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
