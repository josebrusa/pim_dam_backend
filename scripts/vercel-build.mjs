import { spawnSync } from 'node:child_process';

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: process.platform === 'win32' });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run('npx', ['prisma', 'generate']);
run('npx', ['prisma', 'migrate', 'deploy']);

if (process.env.RUN_DB_SEED === 'true') {
  run('npx', ['prisma', 'db', 'seed']);
}

run('npm', ['run', 'build']);
