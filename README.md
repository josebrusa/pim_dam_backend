# Lumify PIM — Backend API

API SaaS multitenant para Lumify PIM. NestJS + PostgreSQL + Prisma + JWT.

## Requisitos

- Node.js 20+
- pnpm
- PostgreSQL 15+ (opcional en bootstrap — auth demo funciona sin BD)

## Inicio rápido

```bash
cp .env.example .env
pnpm install --dangerously-allow-all-builds   # primera vez con Prisma/bcrypt
pnpm prisma:generate
pnpm start:dev
```

- API: http://localhost:3000/api/v1
- Swagger: http://localhost:3000/api/docs
- Health: http://localhost:3000/api/v1/health

## Auth demo (sin PostgreSQL)

| Email | Password |
|-------|----------|
| admin@lumify.io | lumify2025 |
| m.garcia@empresa.com | lumify2025 |
| p.serra@empresa.com | lumify2025 |

## Base de datos

```bash
# Configura DATABASE_URL en .env
pnpm prisma:migrate
pnpm prisma:seed
```

## Scripts

| Script | Descripción |
|--------|-------------|
| `pnpm start:dev` | Desarrollo con hot reload |
| `pnpm build` | Compilar |
| `pnpm test` | Tests unitarios |
| `pnpm test:e2e` | Tests e2e |
| `pnpm prisma:generate` | Generar cliente Prisma |
| `pnpm prisma:migrate` | Migraciones |
| `pnpm prisma:seed` | Seed datos demo |

## Arquitectura

Estructura hexagonal por módulo en `src/modules/<dominio>/`:

- `domain/` — entidades y puertos
- `application/` — use cases y DTOs
- `infrastructure/` — Prisma, guards, repositorios
- `presentation/` — controllers

Contratos API compartidos con frontend: `../docs/api-contract.md`
