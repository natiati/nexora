// Cómo se ve el estado de un producto en la hoja de cálculo del comparador de la landing
export function getProductStatus({ stock, minStock, trackStock }) {
  if (!trackStock) return { sheetLabel: 'N/A', sheetClass: '' };
  if (stock === 0) return { sheetLabel: 'AGOTADO', sheetClass: 'r hl' };
  if (stock <= minStock) return { sheetLabel: 'BAJO', sheetClass: 'hl' };
  return { sheetLabel: 'OK', sheetClass: 'g' };
}
