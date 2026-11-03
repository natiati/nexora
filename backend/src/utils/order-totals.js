const { Prisma } = require('@prisma/client');

const { Decimal } = Prisma;

const money = (value) => value.toDecimalPlaces(2);

// Calcula una línea de orden con Decimal: los flotantes de JS acumulan errores en dinero.
//   subtotal = cantidad × precio · descuento y luego impuesto se aplican sobre lo que queda
function calculateLine({ quantity, unitAmount, taxRate = 0, discountRate = 0 }) {
  const subtotal = money(new Decimal(quantity).times(unitAmount));
  const discount = money(subtotal.times(discountRate).dividedBy(100));
  const tax = money(subtotal.minus(discount).times(taxRate).dividedBy(100));

  return { subtotal, discount, tax, total: subtotal.minus(discount).plus(tax) };
}

// Suma las líneas para obtener los totales de la orden
function sumLines(lines) {
  const zero = new Decimal(0);

  return {
    subtotal: lines.reduce((sum, line) => sum.plus(line.subtotal), zero),
    discountAmount: lines.reduce((sum, line) => sum.plus(line.discount), zero),
    taxAmount: lines.reduce((sum, line) => sum.plus(line.tax), zero),
    total: lines.reduce((sum, line) => sum.plus(line.total), zero)
  };
}

module.exports = { calculateLine, sumLines };
