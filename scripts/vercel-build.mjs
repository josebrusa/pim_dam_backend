import { spawnSync } from 'node:child_process';

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: process.platform === 'win32' });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run('pnpm', ['exec', 'prisma', 'generate']);
run('pnpm', ['exec', 'prisma', 'migrate', 'deploy']);

if (process.env.RUN_DB_SEED === 'true') {
  run('pnpm', ['exec', 'prisma', 'db', 'seed']);
}

run('pnpm', ['run', 'build']);
