// Puente entre Express y los controladores.
// La ruta saca de la petición los datos que el controlador necesita y se los pasa como valores simples;
// el controlador devuelve { status, body, headers } y aquí se envía la respuesta.
// Así req y res solo existen en la capa de rutas. Express 5 envía los errores al error-handler.
function http(action) {
  return async (req, res) => {
    const { status, body, headers } = await action(req);
    if (headers) res.set(headers);
    if (body === undefined) return res.status(status).end();
    res.status(status).json(body);
  };
}

module.exports = http;
