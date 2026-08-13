require('dotenv').config();


const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const company = await prisma.company.create({
    data: {
      name: 'Empresa Demo',
    },
  });

  const passwordHash = await bcrypt.hash('123456', 10);

  const user = await prisma.user.create({
    data: {
      email: 'admin@nexora.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'Demo',
    },
  });

  console.log('Seed creado:', {
    company: company.name,
    userEmail: user.email,
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());