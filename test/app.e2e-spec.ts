import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import * as bcrypt from 'bcrypt';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';

describe('API (e2e)', () => {
  let app: INestApplication<App>;
  let passwordHash: string;

  const mockUser = {
    id: 'user-admin',
    email: 'admin@lumify.io',
    passwordHash: '',
    name: 'Admin',
    initials: 'AD',
    memberships: [
      {
        tenantId: 'tenant-demo',
        status: 'active',
        tenant: { id: 'tenant-demo', name: 'Empresa Demo' },
        role: { code: 'PIM_MANAGER', rolePermissions: [] },
      },
    ],
  };

  const mockMarketingUser = {
    id: 'user-marketing',
    email: 'm.garcia@empresa.com',
    passwordHash: '',
    name: 'Maria Garcia',
    initials: 'MG',
    memberships: [
      {
        tenantId: 'tenant-demo',
        status: 'active',
        tenant: { id: 'tenant-demo', name: 'Empresa Demo' },
        role: { code: 'MARKETING', rolePermissions: [{ permission: { code: 'products:read' } }] },
      },
    ],
  };

  beforeAll(async () => {
    passwordHash = await bcrypt.hash('lumify2025', 10);
    mockUser.passwordHash = passwordHash;
    mockMarketingUser.passwordHash = passwordHash;

    const prismaMock = {
      user: {
        findUnique: jest.fn().mockImplementation(({ where }: { where: { email?: string; id?: string } }) => {
          if (where.email === mockUser.email) return mockUser;
          if (where.email === mockMarketingUser.email) return mockMarketingUser;
          if (where.id === mockUser.id) return mockUser;
          if (where.id === mockMarketingUser.id) return mockMarketingUser;
          return null;
        }),
      },
      membership: {
        findMany: jest.fn().mockResolvedValue([
          {
            tenantId: 'tenant-demo',
            status: 'active',
            updatedAt: new Date(),
            user: { id: 'user-admin', name: 'Admin', email: 'admin@lumify.io' },
            role: { code: 'PIM_MANAGER' },
          },
        ]),
        count: jest.fn().mockResolvedValue(1),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  it('/api/v1/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
        .expect({ status: 'ok', service: 'lumify-pim-api' });
  });

  it('/api/v1/auth/login (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@lumify.io', password: 'lumify2025' })
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe('admin@lumify.io');
  });

  it('/api/v1/auth/me (GET) returns authenticated tenant user', async () => {
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@lumify.io', password: 'lumify2025' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
      .expect(200);

    expect(res.body.user.email).toBe('admin@lumify.io');
    expect(res.body.user.tenantId).toBe('tenant-demo');
    expect(res.body.user.permissions).toContain('*');
  });

  it('/api/v1/users (GET) rejects unauthenticated', () => {
    return request(app.getHttpServer())
      .get('/api/v1/users')
      .expect(401);
  });

  it('/api/v1/users (GET) allows authenticated admin with wildcard permission', async () => {
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@lumify.io', password: 'lumify2025' })
      .expect(201);

    await request(app.getHttpServer())
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
      .expect(200);
  });

  it('/api/v1/users (GET) rejects authenticated user without permission', async () => {
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'm.garcia@empresa.com', password: 'lumify2025' })
      .expect(201);

    await request(app.getHttpServer())
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
      .expect(403);
  });

  afterAll(async () => {
    await app.close();
  });
});
