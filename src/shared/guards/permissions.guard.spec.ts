import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';

function createContext(permissions: string[]): ExecutionContext {
  return {
    getHandler: () => 'handler',
    getClass: () => 'class',
    switchToHttp: () => ({ getRequest: () => ({ user: { permissions } }) }),
  } as unknown as ExecutionContext;
}

describe('PermissionsGuard', () => {
  it('permite wildcard', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(['products:write']) } as unknown as Reflector;
    const guard = new PermissionsGuard(reflector);
    expect(guard.canActivate(createContext(['*']))).toBe(true);
  });

  it('deniega cuando faltan permisos', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(['products:write']) } as unknown as Reflector;
    const guard = new PermissionsGuard(reflector);
    expect(guard.canActivate(createContext(['products:read']))).toBe(false);
  });
});
