require('dotenv').config(); // Cargar variables de entorno desde el archivo .env

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const company = await prisma.company.upsert({
    where: { id: 'seed-company-id' },
    update: {},
    create: {
      id: 'seed-company-id',
      name: 'Empresa Demo',
    },
  });

  const passwordHash = await bcrypt.hash('123456', 10);

  await prisma.user.upsert({
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

  console.log('Seed listo:', {
    companyId: company.id,
    unitId: unit.id,
    categoryId: category.id,
    warehouseId: warehouse.id,
  });
}

main()
  .catch(console.error).finally(() => prisma.$disconnect());