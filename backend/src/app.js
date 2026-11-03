// backend/src/app.js
// Solo configura Express y monta las rutas. La lógica vive en api → controllers → services → models.
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const errorHandler = require('../middleware/error-handler');
const routes = require('./api');

const app = express();

// Detrás del proxy del hosting (Render, etc.) para que el rate limit vea la IP real
app.set('trust proxy', 1);

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
  res.json({ message: 'API de Nexora funcionando' });
});

app.use(routes);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Debe ir después de todas las rutas
app.use(errorHandler);

module.exports = app;
