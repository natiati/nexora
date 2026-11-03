// Número de documento legible y prácticamente irrepetible: SO-MHJ3K2A9
function generateDocumentNumber(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

module.exports = { generateDocumentNumber };
