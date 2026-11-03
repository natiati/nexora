// backend/prisma/seed.js
// Datos de demostración: llena las 19 tablas del schema con un caso coherente.
// Uso: npm run seed   (se puede ejecutar de nuevo sin duplicar datos)
require('dotenv').config();
const bcrypt = require('bcrypt');
const prisma = require('../src/lib/prisma');
const { calculateLine, sumLines } = require('../src/utils/order-totals');

const DEMO_COMPANY = 'Empresa Demo';
const IVA = 19;

const daysFromNow = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

// Unidades compartidas entre empresas: se reutilizan si ya existen
async function findOrCreateUnit(tx, name, abbreviation) {
  const existing = await tx.unit.findFirst({ where: { abbreviation } });
  return existing ?? tx.unit.create({ data: { name, abbreviation } });
}

async function main() {
  const existing = await prisma.company.findFirst({ where: { name: DEMO_COMPANY } });
  if (existing) {
    console.log('El seed ya fue ejecutado (existe "Empresa Demo"). No se hizo nada.');
    return;
  }

  const passwordHash = await bcrypt.hash('123456', 10);

  const result = await prisma.$transaction(
    async (tx) => {
      // --- Empresa, roles y usuarios ---
      const company = await tx.company.create({
        data: {
          name: DEMO_COMPANY,
          legalName: 'Empresa Demo S.A.S.',
          taxId: '900123456-7',
          email: 'contacto@empresademo.com',
          phone: '6015550100',
          address: 'Calle 10 # 20-30',
          city: 'Bogotá',
          country: 'Colombia'
        }
      });

      const adminRole = await tx.role.create({
        data: {
          companyId: company.id,
          name: 'Administrador',
          slug: 'admin',
          description: 'Acceso completo, incluida la configuración de la empresa',
          isSystem: true
        }
      });

      const salesRole = await tx.role.create({
        data: {
          companyId: company.id,
          name: 'Vendedor',
          slug: 'vendedor',
          description: 'Opera inventario, ventas, compras, clientes y facturas'
        }
      });

      const adminUser = await tx.user.upsert({
        where: { email: 'admin@nexora.com' },
        update: {},
        create: {
          email: 'admin@nexora.com',
          passwordHash,
          firstName: 'Admin',
          lastName: 'Demo',
          emailVerifiedAt: new Date()
        }
      });

      const salesUser = await tx.user.upsert({
        where: { email: 'vendedor@nexora.com' },
        update: {},
        create: {
          email: 'vendedor@nexora.com',
          passwordHash,
          firstName: 'Valentina',
          lastName: 'Ríos',
          phone: '3015550101',
          emailVerifiedAt: new Date()
        }
      });

      // Vincula a cada usuario con su empresa: de aquí sale el companyId de la sesión
      await tx.userCompanyRole.create({ data: { userId: adminUser.id, roleId: adminRole.id, isDefault: true } });
      await tx.userCompanyRole.create({ data: { userId: salesUser.id, roleId: salesRole.id, isDefault: true } });

      // --- Catálogo base ---
      const unitUnd = await findOrCreateUnit(tx, 'Unidad', 'und');
      const unitBulto = await findOrCreateUnit(tx, 'Bulto', 'bto');
      const unitGal = await findOrCreateUnit(tx, 'Galón', 'gal');
      const unitMil = await findOrCreateUnit(tx, 'Millar', 'mil');

      const categories = {};
      for (const [key, name, slug] of [
        ['materiales', 'Materiales de obra', 'materiales-de-obra'],
        ['acero', 'Acero', 'acero'],
        ['pinturas', 'Pinturas', 'pinturas'],
        ['tuberia', 'Tubería', 'tuberia'],
        ['servicios', 'Servicios', 'servicios']
      ]) {
        categories[key] = await tx.category.create({ data: { companyId: company.id, name, slug } });
      }

      // Almacén predeterminado: las órdenes de compra y venta lo usan para mover stock
      const warehouse = await tx.warehouse.create({
        data: {
          companyId: company.id,
          name: 'Bodega Principal',
          code: 'BOD-01',
          address: 'Calle 10 # 20-30',
          isDefault: true
        }
      });

      const northWarehouse = await tx.warehouse.create({
        data: { companyId: company.id, name: 'Bodega Norte', code: 'BOD-02', address: 'Autopista Norte km 12' }
      });

      // --- Productos ---
      const productsData = [
        { sku: 'CEM-001', barcode: '7701234000011', name: 'Cemento gris 50kg', categoryId: categories.materiales.id, unitId: unitBulto.id, costPrice: 28000, salePrice: 35000, minStock: 20 },
        { sku: 'VAR-3-8', barcode: '7701234000028', name: 'Varilla 3/8"', categoryId: categories.acero.id, unitId: unitUnd.id, costPrice: 15000, salePrice: 19500, minStock: 30 },
        { sku: 'PIN-BLA', barcode: '7701234000035', name: 'Pintura blanca 1gal', categoryId: categories.pinturas.id, unitId: unitGal.id, costPrice: 42000, salePrice: 58000, minStock: 10 },
        { sku: 'LAD-COM', name: 'Ladrillo común (millar)', categoryId: categories.materiales.id, unitId: unitMil.id, costPrice: 380000, salePrice: 450000, minStock: 5 },
        { sku: 'TUB-PVC2', barcode: '7701234000042', name: 'Tubo PVC 2"', categoryId: categories.tuberia.id, unitId: unitUnd.id, costPrice: 12000, salePrice: 16500, minStock: 15 },
        { sku: 'SRV-ENT', name: 'Servicio de entrega en obra', description: 'No maneja inventario', categoryId: categories.servicios.id, unitId: unitUnd.id, costPrice: 0, salePrice: 80000, minStock: 0, trackStock: false }
      ];

      const products = [];
      for (const data of productsData) {
        products.push(await tx.product.create({ data }));
      }
      const [cement, rebar, paint, brick, pipe, delivery] = products;

      // --- Clientes y su historial ---
      const customersData = [
        { code: 'CLI-001', name: 'Constructora Andina S.A.S', taxId: '900555111-1', email: 'compras@andina.com', phone: '3001234567', address: 'Carrera 7 # 80-10', city: 'Bogotá', creditLimit: 20000000, paymentTerms: '30 días' },
        { code: 'CLI-002', name: 'Ferretería El Progreso', taxId: '800222333-2', email: 'contacto@elprogreso.com', phone: '3007654321', address: 'Calle 45 # 12-08', city: 'Medellín', creditLimit: 5000000, paymentTerms: '15 días' },
        { code: 'CLI-003', name: 'Inversiones López', taxId: '901444777-3', email: 'lopez@inversiones.com', phone: '3009876543', city: 'Cali', notes: 'Prefiere pago de contado' }
      ];

      const customers = [];
      for (const data of customersData) {
        customers.push(await tx.customer.create({ data: { companyId: company.id, ...data } }));
      }

      await tx.customerInteraction.create({
        data: {
          companyId: company.id,
          customerId: customers[0].id,
          userId: salesUser.id,
          type: 'call',
          subject: 'Cotización para obra en Chapinero',
          content: 'Solicita precios de cemento y varilla para entrega en dos semanas.',
          interactionDate: daysFromNow(-5)
        }
      });

      await tx.customerInteraction.create({
        data: {
          companyId: company.id,
          customerId: customers[1].id,
          userId: adminUser.id,
          type: 'meeting',
          subject: 'Acuerdo de condiciones',
          content: 'Se acuerda un plazo de pago de 15 días.',
          interactionDate: daysFromNow(-2)
        }
      });

      // --- Proveedores ---
      const suppliersData = [
        { name: 'Cementos del Tolima', taxId: '860111222-1', email: 'ventas@cetol.com', phone: '3101112222', contactName: 'Jorge Patiño', address: 'Zona Industrial, Ibagué' },
        { name: 'Distribuidora Acero SAS', taxId: '830333444-2', email: 'ventas@acero.com', phone: '3103334444', contactName: 'Laura Mejía' }
      ];

      const suppliers = [];
      for (const data of suppliersData) {
        suppliers.push(await tx.supplier.create({ data: { companyId: company.id, ...data } }));
      }

      // --- Orden de compra RECIBIDA (deja stock inicial) ---
      // El ladrillo queda en 5 unidades (= su mínimo) para que el dashboard muestre una alerta de stock bajo
      const poLines = [
        { product: cement, quantity: 160 },
        { product: rebar, quantity: 80 },
        { product: paint, quantity: 40 },
        { product: brick, quantity: 5 }
      ].map(({ product, quantity }) => ({
        product,
        quantity,
        ...calculateLine({ quantity, unitAmount: product.costPrice, taxRate: IVA })
      }));
      const poTotals = sumLines(poLines);

      const po = await tx.purchaseOrder.create({
        data: {
          supplierId: suppliers[0].id,
          orderNumber: 'PO-DEMO-001',
          status: 'received',
          orderDate: daysFromNow(-200),
          expectedDate: daysFromNow(-195),
          subtotal: poTotals.subtotal,
          taxAmount: poTotals.taxAmount,
          total: poTotals.total,
          createdBy: adminUser.id,
          items: {
            create: poLines.map((line) => ({
              productId: line.product.id,
              quantity: line.quantity,
              receivedQuantity: line.quantity,
              unitCost: line.product.costPrice,
              taxRate: IVA,
              subtotal: line.subtotal,
              total: line.total
            }))
          }
        },
        include: { items: true }
      });

      const levels = new Map();

      for (const item of po.items) {
        const level = await tx.stockLevel.create({
          data: { productId: item.productId, warehouseId: warehouse.id, quantity: item.quantity }
        });
        levels.set(item.productId, level);

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            warehouseId: warehouse.id,
            type: 'purchase_in',
            quantity: item.quantity,
            unitCost: item.unitCost,
            referenceType: 'purchase_order',
            referenceId: po.id,
            createdBy: adminUser.id
          }
        });
      }

      // Stock en la segunda bodega, cargado con un ajuste manual
      await tx.stockLevel.create({ data: { productId: cement.id, warehouseId: northWarehouse.id, quantity: 15 } });
      await tx.stockMovement.create({
        data: {
          productId: cement.id,
          warehouseId: northWarehouse.id,
          type: 'adjustment',
          quantity: 15,
          notes: 'Inventario inicial de la bodega',
          createdBy: adminUser.id
        }
      });

      // --- Orden de compra PENDIENTE de recibir ---
      const openPoLine = {
        product: pipe,
        quantity: 40,
        ...calculateLine({ quantity: 40, unitAmount: pipe.costPrice, taxRate: IVA })
      };

      await tx.purchaseOrder.create({
        data: {
          supplierId: suppliers[1].id,
          orderNumber: 'PO-DEMO-002',
          status: 'ordered',
          orderDate: daysFromNow(-1),
          expectedDate: daysFromNow(7),
          subtotal: openPoLine.subtotal,
          taxAmount: openPoLine.tax,
          total: openPoLine.total,
          createdBy: adminUser.id,
          items: {
            create: {
              productId: pipe.id,
              quantity: openPoLine.quantity,
              unitCost: pipe.costPrice,
              taxRate: IVA,
              subtotal: openPoLine.subtotal,
              total: openPoLine.total
            }
          }
        }
      });

      // Arma los datos de una orden de venta con descuento e IVA
      const salesOrderData = (input) => {
        const lines = input.map(({ product, quantity, discountRate = 0 }) => ({
          product,
          quantity,
          discountRate,
          ...calculateLine({ quantity, unitAmount: product.salePrice, taxRate: IVA, discountRate })
        }));

        return {
          totals: sumLines(lines),
          items: lines.map((line) => ({
            productId: line.product.id,
            quantity: line.quantity,
            unitPrice: line.product.salePrice,
            taxRate: IVA,
            discountRate: line.discountRate,
            subtotal: line.subtotal,
            total: line.total
          }))
        };
      };

      // --- Historia de los últimos 5 meses: alimenta los reportes del dashboard ---
      // Facturas pagadas, salvo una con pago parcial y otra vencida sin pagar
      const history = [
        { monthsAgo: 5, cement: 8, rebar: 4, paint: 1, paidShare: 1 },
        { monthsAgo: 4, cement: 10, rebar: 5, paint: 2, paidShare: 1 },
        { monthsAgo: 3, cement: 12, rebar: 6, paint: 3, paidShare: 0.5 },
        { monthsAgo: 2, cement: 14, rebar: 7, paint: 4, paidShare: 0 },
        { monthsAgo: 1, cement: 16, rebar: 8, paint: 5, paidShare: 1 }
      ];

      for (const entry of history) {
        const date = daysFromNow(-30 * entry.monthsAgo);
        const orders = [
          { customer: customers[0], lines: [{ product: cement, quantity: entry.cement }, { product: rebar, quantity: entry.rebar }] },
          { customer: customers[1], lines: [{ product: paint, quantity: entry.paint }, { product: delivery, quantity: 1 }] }
        ];

        for (const [index, { customer, lines }] of orders.entries()) {
          const number = `${entry.monthsAgo}${index + 1}`;
          const data = salesOrderData(lines);

          const order = await tx.salesOrder.create({
            data: {
              customerId: customer.id,
              orderNumber: `SO-HIST-${number}`,
              status: 'delivered',
              orderDate: date,
              ...data.totals,
              createdBy: salesUser.id,
              items: { create: data.items.map((item) => ({ ...item, deliveredQuantity: item.quantity })) }
            },
            include: { items: true }
          });

          for (const item of order.items) {
            if (item.productId === delivery.id) continue;

            await tx.stockLevel.update({
              where: { id: levels.get(item.productId).id },
              data: { quantity: { decrement: item.quantity } }
            });

            await tx.stockMovement.create({
              data: {
                productId: item.productId,
                warehouseId: warehouse.id,
                type: 'sale_out',
                quantity: item.quantity.negated(),
                referenceType: 'sales_order',
                referenceId: order.id,
                createdBy: salesUser.id,
                createdAt: date
              }
            });
          }

          const paidAmount = data.totals.total.times(entry.paidShare).toDecimalPlaces(2);
          const dueDate = new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000);

          const invoice = await tx.invoice.create({
            data: {
              salesOrderId: order.id,
              invoiceNumber: `INV-HIST-${number}`,
              status: entry.paidShare === 1 ? 'paid' : entry.paidShare > 0 ? 'partial' : 'issued',
              issueDate: date,
              dueDate,
              ...data.totals,
              paidAmount,
              createdBy: salesUser.id
            }
          });

          if (entry.paidShare > 0) {
            await tx.payment.create({
              data: {
                invoiceId: invoice.id,
                amount: paidAmount,
                paymentDate: new Date(date.getTime() + 10 * 24 * 60 * 60 * 1000),
                paymentMethod: index === 0 ? 'transfer' : 'cash',
                createdBy: salesUser.id
              }
            });
          }
        }
      }

      // --- Orden de venta ENTREGADA + factura con pago parcial ---
      const delivered = salesOrderData([
        { product: cement, quantity: 10, discountRate: 5 },
        { product: rebar, quantity: 5 },
        { product: delivery, quantity: 1 }
      ]);

      const so = await tx.salesOrder.create({
        data: {
          customerId: customers[0].id,
          orderNumber: 'SO-DEMO-001',
          status: 'delivered',
          orderDate: daysFromNow(-10),
          ...delivered.totals,
          createdBy: salesUser.id,
          items: {
            create: delivered.items.map((item) => ({ ...item, deliveredQuantity: item.quantity }))
          }
        },
        include: { items: true }
      });

      for (const item of so.items) {
        // El servicio de entrega no maneja inventario
        if (item.productId === delivery.id) continue;

        await tx.stockLevel.update({
          where: { id: levels.get(item.productId).id },
          data: { quantity: { decrement: item.quantity } }
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            warehouseId: warehouse.id,
            type: 'sale_out',
            quantity: item.quantity.negated(),
            referenceType: 'sales_order',
            referenceId: so.id,
            createdBy: salesUser.id
          }
        });
      }

      const paid = delivered.totals.total.times(0.4).toDecimalPlaces(2);

      const invoice = await tx.invoice.create({
        data: {
          salesOrderId: so.id,
          invoiceNumber: 'INV-DEMO-001',
          status: 'partial',
          issueDate: daysFromNow(-9),
          dueDate: daysFromNow(21),
          ...delivered.totals,
          paidAmount: paid,
          createdBy: salesUser.id
        }
      });

      await tx.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: paid,
          paymentDate: daysFromNow(-3),
          paymentMethod: 'transfer',
          reference: 'TRF-20481',
          createdBy: salesUser.id
        }
      });

      // --- Orden de venta CONFIRMADA: tiene stock reservado, falta entregarla y facturarla ---
      const confirmed = salesOrderData([{ product: paint, quantity: 4 }]);

      await tx.salesOrder.create({
        data: {
          customerId: customers[2].id,
          orderNumber: 'SO-DEMO-003',
          status: 'confirmed',
          orderDate: daysFromNow(-1),
          ...confirmed.totals,
          createdBy: salesUser.id,
          items: { create: confirmed.items }
        }
      });

      await tx.stockLevel.update({
        where: { id: levels.get(paint.id).id },
        data: { reservedQuantity: { increment: 4 } }
      });

      // --- Cotización SIN confirmar ---
      const quote = salesOrderData([{ product: paint, quantity: 1 }]);

      await tx.salesOrder.create({
        data: {
          customerId: customers[1].id,
          orderNumber: 'SO-DEMO-002',
          status: 'quote',
          orderDate: new Date(),
          validUntil: daysFromNow(15),
          ...quote.totals,
          notes: 'Cotización válida por 15 días',
          createdBy: adminUser.id,
          items: { create: quote.items }
        }
      });

      return {
        companyId: company.id,
        warehouseId: warehouse.id,
        productos: products.length,
        clientes: customers.length,
        proveedores: suppliers.length
      };
    },
    { timeout: 60000 }
  );

  console.log('Seed completo:', result);
  console.log('Usuarios de prueba (clave 123456): admin@nexora.com · vendedor@nexora.com');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
