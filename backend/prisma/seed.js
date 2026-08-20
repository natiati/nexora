// backend/prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // --- Core ---
  const company = await prisma.company.upsert({
    where: { id: 'seed-company-id' },
    update: {},
    create: { id: 'seed-company-id', name: 'Empresa Demo' },
  });

  const passwordHash = await bcrypt.hash('123456', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@nexora.com' },
    update: {},
    create: {
      email: 'admin@nexora.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'Demo',
    },
  });

  const unit = await prisma.unit.create({
    data: {
      companyId: company.id,
      name: 'Unidad',
      abbreviation: 'und',
    },
  });

  const category = await prisma.category.create({
    data: {
      companyId: company.id,
      name: 'General',
      slug: 'general',
    },
  });

  const warehouse = await prisma.warehouse.create({
    data: {
      companyId: company.id,
      name: 'Bodega Principal',
      isDefault: true,
    },
  });

  // --- Productos ---
  const productsData = [
    {
      sku: 'CEM-001',
      name: 'Cemento gris 50kg',
      costPrice: 28000,
      salePrice: 35000,
      minStock: 20,
    },
    {
      sku: 'VAR-3-8',
      name: 'Varilla 3/8"',
      costPrice: 15000,
      salePrice: 19500,
      minStock: 30,
    },
    {
      sku: 'PIN-BLA',
      name: 'Pintura blanca 1gal',
      costPrice: 42000,
      salePrice: 58000,
      minStock: 10,
    },
    {
      sku: 'LAD-COM',
      name: 'Ladrillo común (millar)',
      costPrice: 380000,
      salePrice: 450000,
      minStock: 5,
    },
    {
      sku: 'TUB-PVC2',
      name: 'Tubo PVC 2"',
      costPrice: 12000,
      salePrice: 16500,
      minStock: 15,
    },
  ];

  const products = [];

  for (const p of productsData) {
    const product = await prisma.product.create({
      data: {
        companyId: company.id,
        categoryId: category.id,
        unitId: unit.id,
        ...p,
      },
    });

    products.push(product);
  }

  // --- Clientes ---
  const customersData = [
    {
      name: 'Constructora Andina S.A.S',
      email: 'compras@andina.com',
      phone: '3001234567',
    },
    {
      name: 'Ferretería El Progreso',
      email: 'contacto@elprogreso.com',
      phone: '3007654321',
    },
    {
      name: 'Inversiones López',
      email: 'lopez@inversiones.com',
      phone: '3009876543',
    },
  ];

  const customers = [];

  for (const c of customersData) {
    const customer = await prisma.customer.create({
      data: {
        companyId: company.id,
        ...c,
      },
    });

    customers.push(customer);
  }

  // --- Proveedores ---
  const suppliersData = [
    {
      name: 'Cementos del Tolima',
      email: 'ventas@cetol.com',
      phone: '3101112222',
    },
    {
      name: 'Distribuidora Acero SAS',
      email: 'ventas@acero.com',
      phone: '3103334444',
    },
  ];

  const suppliers = [];

  for (const s of suppliersData) {
    const supplier = await prisma.supplier.create({
      data: {
        companyId: company.id,
        ...s,
      },
    });

    suppliers.push(supplier);
  }

  // --- Orden de compra RECIBIDA ---
  const poItemsInput = [
    { product: products[0], quantity: 100 },
    { product: products[1], quantity: 50 },
    { product: products[2], quantity: 25 },
    { product: products[3], quantity: 8 },
  ];

  const po = await prisma.purchaseOrder.create({
    data: {
      companyId: company.id,
      supplierId: suppliers[0].id,
      warehouseId: warehouse.id,
      orderNumber: 'PO-DEMO-001',
      status: 'ordered',
      orderDate: new Date(),
      subtotal: poItemsInput.reduce(
        (s, it) => s + it.quantity * Number(it.product.costPrice),
        0
      ),
      total: poItemsInput.reduce(
        (s, it) => s + it.quantity * Number(it.product.costPrice),
        0
      ),
      createdBy: adminUser.id,
      items: {
        create: poItemsInput.map((it) => ({
          productId: it.product.id,
          quantity: it.quantity,
          unitCost: it.product.costPrice,
          subtotal: it.quantity * Number(it.product.costPrice),
          total: it.quantity * Number(it.product.costPrice),
        })),
      },
    },
    include: {
      items: true,
    },
  });

  for (const item of po.items) {
    await prisma.stockLevel.upsert({
      where: {
        productId_warehouseId: {
          productId: item.productId,
          warehouseId: warehouse.id,
        },
      },
      update: {
        quantity: {
          increment: item.quantity,
        },
      },
      create: {
        companyId: company.id,
        productId: item.productId,
        warehouseId: warehouse.id,
        quantity: item.quantity,
      },
    });

    await prisma.stockMovement.create({
      data: {
        companyId: company.id,
        productId: item.productId,
        warehouseId: warehouse.id,
        type: 'purchase_in',
        quantity: item.quantity,
        unitCost: item.unitCost,
        referenceType: 'purchase_order',
        referenceId: po.id,
        createdBy: adminUser.id,
      },
    });
  }

  await prisma.purchaseOrder.update({
    where: { id: po.id },
    data: { status: 'received' },
  });

  // --- Orden de venta CONFIRMADA + FACTURA ---
  const soItemsInput = [
    {
      product: products[0],
      quantity: 10,
      unitPrice: products[0].salePrice,
    },
    {
      product: products[1],
      quantity: 5,
      unitPrice: products[1].salePrice,
    },
  ];

  const soTotal = soItemsInput.reduce(
    (s, it) => s + it.quantity * Number(it.unitPrice),
    0
  );

  const so = await prisma.salesOrder.create({
    data: {
      companyId: company.id,
      customerId: customers[0].id,
      warehouseId: warehouse.id,
      orderNumber: 'SO-DEMO-001',
      status: 'quote',
      orderDate: new Date(),
      subtotal: soTotal,
      total: soTotal,
      createdBy: adminUser.id,
      items: {
        create: soItemsInput.map((it) => ({
          productId: it.product.id,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          subtotal: it.quantity * Number(it.unitPrice),
          total: it.quantity * Number(it.unitPrice),
        })),
      },
    },
    include: {
      items: true,
    },
  });

  for (const item of so.items) {
    await prisma.stockLevel.update({
      where: {
        productId_warehouseId: {
          productId: item.productId,
          warehouseId: warehouse.id,
        },
      },
      data: {
        quantity: {
          decrement: item.quantity,
        },
      },
    });

    await prisma.stockMovement.create({
      data: {
        companyId: company.id,
        productId: item.productId,
        warehouseId: warehouse.id,
        type: 'sale_out',
        quantity: -item.quantity,
        referenceType: 'sales_order',
        referenceId: so.id,
        createdBy: adminUser.id,
      },
    });
  }

  await prisma.salesOrder.update({
    where: { id: so.id },
    data: { status: 'confirmed' },
  });

  const invoice = await prisma.invoice.create({
    data: {
      companyId: company.id,
      customerId: customers[0].id,
      salesOrderId: so.id,
      invoiceNumber: 'INV-DEMO-001',
      status: 'partial',
      issueDate: new Date(),
      subtotal: soTotal,
      total: soTotal,
      paidAmount: Math.round(soTotal * 0.4),
      createdBy: adminUser.id,
      items: {
        create: so.items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          subtotal: it.subtotal,
          total: it.total,
        })),
      },
    },
  });

  await prisma.payment.create({
    data: {
      companyId: company.id,
      invoiceId: invoice.id,
      amount: invoice.paidAmount,
      paymentDate: new Date(),
      paymentMethod: 'transfer',
      createdBy: adminUser.id,
    },
  });

  // --- Segunda cotización SIN confirmar ---
  await prisma.salesOrder.create({
    data: {
      companyId: company.id,
      customerId: customers[1].id,
      warehouseId: warehouse.id,
      orderNumber: 'SO-DEMO-002',
      status: 'quote',
      orderDate: new Date(),
      subtotal: 58000,
      total: 58000,
      createdBy: adminUser.id,
      items: {
        create: [
          {
            productId: products[2].id,
            quantity: 1,
            unitPrice: 58000,
            subtotal: 58000,
            total: 58000,
          },
        ],
      },
    },
  });

  console.log('Seed completo:', {
    companyId: company.id,
    unitId: unit.id,
    categoryId: category.id,
    warehouseId: warehouse.id,
    productos: products.length,
    clientes: customers.length,
    proveedores: suppliers.length,
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());