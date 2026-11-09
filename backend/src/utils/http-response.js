// Respuestas HTTP como objetos simples: { status, body, headers }.
// Los controladores las devuelven sin conocer Express; routes/http-adapter.js las envía.

/** 200 OK: consulta o actualización exitosa */
const ok = (body) => ({ status: 200, body });

/** 201 Created: recurso creado correctamente */
const created = (body) => ({ status: 201, body });

/** 204 No Content: operación exitosa sin cuerpo (por ejemplo, eliminar) */
const noContent = () => ({ status: 204 });

/** 200 OK de un listado paginado: el total va en la cabecera X-Total-Count */
const okPage = ({ data, total }) => ({ status: 200, body: data, headers: { 'X-Total-Count': String(total) } });

module.exports = { ok, created, noContent, okPage };
