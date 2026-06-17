import * as bcrypt from 'bcrypt';

/**
 * Seed idempotente — ejecutar tras `prisma migrate dev`.
 * TODO: conectar con Prisma Client cuando DATABASE_URL esté configurada.
 */
async function main() {
  const passwordHash = await bcrypt.hash('lumify2025', 10);
  console.log('Seed placeholder — implementar en BE-003');
  console.log('Demo password hash ready:', passwordHash.slice(0, 20) + '...');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
