import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const count = await prisma.user.count();
  const admin = await prisma.user.findUnique({ where: { email: 'admin@meps.com' } });
  console.log('Conexion OK');
  console.log('Usuarios en BD:', count);
  console.log('Admin:', admin ? admin.email : 'no encontrado');
} catch (err) {
  console.error('Error de conexion:', err.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
