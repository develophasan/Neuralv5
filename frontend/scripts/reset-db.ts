import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Empting database...');

  try {
    // Drop all tables in the public schema
    // This is specific to PostgreSQL
    const tablenames = await prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== '_prisma_migrations')
      .map((name) => `"public"."${name}"`)
      .join(', ');

    if (tables.length > 0) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
      console.log('✅ Database emptied successfully');
    } else {
      console.log('⚠️  No tables found to truncate');
    }
  } catch (error) {
    console.error('❌ Error emptying database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
