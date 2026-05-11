const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Créer un compte de test avec un mot de passe connu
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Vérifier si le compte existe déjà
    const existing = await prisma.user.findUnique({
      where: { email: 'agent@test.com' }
    });

    if (existing) {
      console.log('✓ Compte agent@test.com existe déjà');
    } else {
      const user = await prisma.user.create({
        data: {
          email: 'agent@test.com',
          password: hashedPassword,
          name: 'Test Agent',
          role: 'AGENT_BUYER',
          agentValidationStatus: 'VALIDATED',
          phone: '+213 555 123 456'
        }
      });
      console.log('✓ Compte créé: agent@test.com / password123');
      console.log('   User ID:', user.id);
    }

    // Aussi créer un compte CLIENT de test
    const clientExisting = await prisma.user.findUnique({
      where: { email: 'client@example.com' }
    });

    if (clientExisting) {
      console.log('✓ Compte client@example.com existe déjà');
    } else {
      const clientUser = await prisma.user.create({
        data: {
          email: 'client@example.com',
          password: hashedPassword,
          name: 'Test Client',
          role: 'CLIENT',
          agentValidationStatus: 'NOT_APPLICABLE',
          phone: '+213 555 654 321'
        }
      });
      console.log('✓ Compte client créé: client@example.com / password123');
      console.log('   User ID:', clientUser.id);
    }

    console.log('\n=== CREDENTIALS DE TEST ===');
    console.log('Agent Buyer: agent@test.com / password123');
    console.log('Client:      client@example.com / password123');
    console.log('Admin:       admin@test.com / (mot de passe inconnu)');

  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
