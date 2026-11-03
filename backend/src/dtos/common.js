const { z } = require('zod');

// Piezas reutilizables. Los campos opcionales aceptan null o '' para poder vaciarlos al editar.
const emptyToNull = (schema) => z.preprocess((value) => (value === '' ? null : value), schema);

const optionalText = (max) => emptyToNull(z.string().trim().max(max).nullish());
const optionalLongText = () => emptyToNull(z.string().trim().max(5000).nullish());
const optionalEmail = () => emptyToNull(z.string().trim().email().max(150).nullish());
const optionalDate = () => emptyToNull(z.coerce.date().nullish());
const requiredText = (max) => z.string().trim().min(1).max(max);
const id = () => z.string().uuid();

// Los topes coinciden con los Decimal(p, s) del schema
const money = () => z.coerce.number().nonnegative().max(999999999999.99);
const quantity = () => z.coerce.number().positive().max(99999999999.999);
const rate = () => z.coerce.number().min(0).max(100);

module.exports = { emptyToNull, optionalText, optionalLongText, optionalEmail, optionalDate, requiredText, id, money, quantity, rate };
