const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    const email = 'admin@dzmarket.com';
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      console.log(`✓ Admin ${email} existe déjà`);
      console.log(`  - ID: ${existingAdmin.id}`);
      console.log(`  - Rôle: ${existingAdmin.role}`);
      console.log(`  - Bloqué: ${existingAdmin.isBlocked}`);
      return;
    }

    // Create admin with default password
    const password = 'admin123'; // Default password for testing
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Administrator',
        phone: '+213 555 000 000',
        role: 'ADMIN',
        emailVerifiedAt: new Date(),
        kycStatus: 'VERIFIED',
        trustScore: 100,
      },
    });

    console.log(`✓ Admin créé avec succès`);
    console.log(`  - Email: ${admin.email}`);
    console.log(`  - Mot de passe: ${password}`);
    console.log(`  - Rôle: ${admin.role}`);
    console.log(`\nUtilisez ces identifiants pour vous connecter sur http://localhost:3002/login`);
  } catch (error) {
    console.error('✗ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
