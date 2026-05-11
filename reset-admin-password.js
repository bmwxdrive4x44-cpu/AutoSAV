const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    const email = 'admin@dzmarket.com';
    
    // Check admin account status
    const admin = await prisma.user.findUnique({
      where: { email }
    });

    if (!admin) {
      console.log(`✗ Compte admin ${email} n'existe pas`);
      return;
    }

    console.log('État actuel du compte admin:');
    console.log(`  - Email: ${admin.email}`);
    console.log(`  - Nom: ${admin.name}`);
    console.log(`  - Rôle: ${admin.role}`);
    console.log(`  - Bloqué: ${admin.isBlocked}`);
    console.log(`  - Email vérifié: ${admin.emailVerifiedAt ? 'Oui' : 'Non'}`);
    console.log(`  - KYC: ${admin.kycStatus}`);
    console.log(`  - Score confiance: ${admin.trustScore}`);

    // Reset password
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updated = await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        isBlocked: false, // Unblock if blocked
        emailVerifiedAt: new Date(),
        kycStatus: 'VERIFIED',
        trustScore: 100,
      },
    });

    console.log('\n✓ Mot de passe réinitialisé');
    console.log(`  - Email: ${updated.email}`);
    console.log(`  - Mot de passe: ${newPassword}`);
    console.log(`  - Compte débloqué: ${!updated.isBlocked}`);
    console.log(`\nConnexion sur http://localhost:3002/login`);
  } catch (error) {
    console.error('✗ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
