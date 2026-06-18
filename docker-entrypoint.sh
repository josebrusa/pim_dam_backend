#!/bin/sh
set -e

echo "Running Prisma migrations..."
pnpm exec prisma migrate deploy

echo "Running seed..."
pnpm exec prisma db seed || echo "Seed skipped or already applied"

echo "Starting API..."
exec node dist/src/main.js
