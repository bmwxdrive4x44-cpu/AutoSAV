const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const MVP_CATEGORIES = [
  {
    name: 'Auto Parts',
    slug: 'auto-parts',
    icon: 'Wrench',
  },
  {
    name: 'Electronics',
    slug: 'electronics',
    icon: 'Zap',
  },
  {
    name: 'Gaming & IT',
    slug: 'gaming-it',
    icon: 'Gamepad2',
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    icon: 'Shirt',
  },
  {
    name: 'Beauty',
    slug: 'beauty',
    icon: 'Sparkles',
  },
  {
    name: 'Tools',
    slug: 'tools',
    icon: 'Hammer',
  },
  {
    name: 'Health',
    slug: 'health',
    icon: 'Heart',
  },
  {
    name: 'Other',
    slug: 'other',
    icon: 'Package',
  },
];

async function main() {
  console.log('Seeding categories...');
  
  for (const category of MVP_CATEGORIES) {
    const existing = await prisma.category.findUnique({
      where: { slug: category.slug },
    });

    if (existing) {
      console.log(`âœ“ Category "${category.name}" already exists`);
      continue;
    }

    const created = await prisma.category.create({
      data: category,
    });

    console.log(`âœ“ Created category: ${created.name}`);
  }

  console.log('\nCategories seeded successfully!');
  console.log(`Total categories: ${MVP_CATEGORIES.length}`);
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

