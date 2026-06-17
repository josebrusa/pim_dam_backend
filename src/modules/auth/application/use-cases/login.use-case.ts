import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

type DemoUser = {
  email: string;
  passwordHash: string;
  name: string;
  initials: string;
  role: string;
  tenantId: string;
  permissions: string[];
};

const DEV_PASSWORD_HASH = bcrypt.hashSync('lumify2025', 10);

const DEMO_USERS: DemoUser[] = [
  {
    email: 'admin@lumify.io',
    passwordHash: DEV_PASSWORD_HASH,
    name: 'Admin',
    initials: 'AD',
    role: 'PIM_MANAGER',
    tenantId: 'tenant-demo',
    permissions: ['*'],
  },
  {
    email: 'm.garcia@empresa.com',
    passwordHash: DEV_PASSWORD_HASH,
    name: 'María García',
    initials: 'MG',
    role: 'MARKETING',
    tenantId: 'tenant-demo',
    permissions: ['products:read', 'products:write', 'dam:read', 'workflows:read'],
  },
  {
    email: 'p.serra@empresa.com',
    passwordHash: DEV_PASSWORD_HASH,
    name: 'Pau Serra',
    initials: 'PS',
    role: 'IT_ADMIN',
    tenantId: 'tenant-demo',
    permissions: ['*'],
  },
];

@Injectable()
export class LoginUseCase {
  constructor(private readonly jwtService: JwtService) {}

  async execute(email: string, password: string) {
    const user = DEMO_USERS.find((u) => u.email === email);
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Credenciales incorrectas',
      });
    }

    const payload = {
      sub: user.email,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        email: user.email,
        name: user.name,
        initials: user.initials,
        role: user.role,
        tenantId: user.tenantId,
        permissions: user.permissions,
      },
    };
  }
}
