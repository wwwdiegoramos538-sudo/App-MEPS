import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@meps.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log('Admin ya existe:', adminEmail);
    return;
  }

  const hashed = await bcrypt.hash(adminPassword, 12);
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashed,
      name: 'Administrador MEPS',
      role: 'ADMIN',
      emailVerified: true,
      subscription: {
        create: {
          plan: 'ENTERPRISE',
          status: 'ACTIVE',
          translationsLimit: 999999,
        },
      },
    },
  });

  console.log('Admin creado:', admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
