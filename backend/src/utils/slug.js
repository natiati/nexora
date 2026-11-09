// "Herramientas eléctricas" → "herramientas-electricas"
function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')   // elimina todos los diacríticos (Unicode category M)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

module.exports = { slugify };
