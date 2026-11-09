// backend/src/app.js
// Solo configura Express y monta las rutas. Flujo: routes → controllers → services → models.
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

const errorHandler = require('../middleware/error-handler');
const routes = require('./routes');

const app = express();

// Detrás del proxy del hosting (Render, etc.) para que el rate limit vea la IP real
app.set('trust proxy', 1);

// Documentación interactiva de la API. Va antes de helmet() porque Swagger UI necesita scripts en línea:
// solo /docs relaja la política CSP; el resto de la API la mantiene completa.
app.use('/docs', helmet({ contentSecurityPolicy: false }), swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Nexora API Docs',
  customCss: '.swagger-ui .topbar { background-color: #0f766e; }',
  swaggerOptions: { persistAuthorization: true }
}));

app.use(helmet());
app.use(
  cors({
    // CORS_ORIGIN admite varios orígenes separados por coma; sin valor acepta cualquiera (solo desarrollo)
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
      : true,
    exposedHeaders: ['X-Total-Count']
  })
);
app.use(express.json({ limit: '1mb' }));

// Ruta de prueba: confirma que el servidor está arriba
app.get('/', (req, res) => {
  res.json({ message: 'API de Nexora funcionando', docs: '/docs' });
});

app.use(routes);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Debe ir después de todas las rutas
app.use(errorHandler);

module.exports = app;
