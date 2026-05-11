import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);
  
  // Delete existing user if any to ensure correct role
  await prisma.user.deleteMany({
    where: { email: 'admin@dzmarket.com' },
  });
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@dzmarket.com',
      password,
      name: 'Admin',
      phone: '',
      role: 'ADMIN',
    },
  });
  console.log('Admin user created:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
