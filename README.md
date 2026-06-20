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
# Si usas Neon, configura tambien DIRECT_URL con la conexion directa
pnpm prisma:migrate
pnpm prisma:seed
```

## Deploy en Vercel + Neon

- `DATABASE_URL`: usa la URL pooled de Neon para la aplicacion.
- `DIRECT_URL`: usa la URL directa de Neon para Prisma CLI y migraciones.
- `CORS_ORIGIN`: dominio del frontend, por ejemplo `https://pim-dam-lumify.vercel.app`.
- `JWT_SECRET`: obligatorio en produccion.
- `AUTH_COOKIE_SAME_SITE`: por defecto `lax`.
- `AUTH_COOKIE_SECURE`: por defecto `true` en produccion.
- `RUN_DB_SEED=true`: opcional, ejecuta el seed durante el deploy.

En Vercel el script `vercel-build` ejecuta:

```bash
prisma generate
prisma migrate deploy
# prisma db seed solo si RUN_DB_SEED=true
npm run build
```

Recomendado para produccion:

- correr migraciones automaticamente en cada deploy
- dejar `RUN_DB_SEED=false` y usar seed solo cuando realmente necesites cargar datos iniciales/demo

## Scripts

| Script | Descripción |
|--------|-------------|
| `pnpm start:dev` | Desarrollo con hot reload |
| `pnpm build` | Compilar |
| `pnpm test` | Tests unitarios |
| `pnpm test:e2e` | Tests e2e |
| `pnpm prisma:generate` | Generar cliente Prisma |
| `pnpm prisma:migrate` | Migraciones |
| `pnpm prisma:migrate:deploy` | Aplicar migraciones pendientes |
| `pnpm prisma:seed` | Seed datos demo |

## Arquitectura

Estructura hexagonal por módulo en `src/modules/<dominio>/`:

- `domain/` — entidades y puertos
- `application/` — use cases y DTOs
- `infrastructure/` — Prisma, guards, repositorios
- `presentation/` — controllers

Contratos API compartidos con frontend: `../docs/api-contract.md`
