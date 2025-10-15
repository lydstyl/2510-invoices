import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.USER_EMAIL || 'lydstyl@gmail.com';
  const password = process.env.USER_PASSWORD || 'password123';

  if (!process.env.USER_PASSWORD) {
    console.warn('⚠️  USER_PASSWORD not set in .env, using default password');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
    },
  });

  console.log('✅ User created:', user.email);

  // Create some default categories
  const categories = [
    'Comptabilité',
    'Réparation',
    'Entretien',
    'Assurance',
    'Impôts',
    'Charges',
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('✅ Categories created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
