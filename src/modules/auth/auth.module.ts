import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { AuthController } from './presentation/auth.controller';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { getJwtSecret } from './infrastructure/auth-config';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: getJwtSecret(),
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN ?? '8h') as `${number}${'s' | 'm' | 'h' | 'd'}`,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [LoginUseCase, JwtStrategy],
  exports: [JwtModule],
})
export class AuthModule {}
