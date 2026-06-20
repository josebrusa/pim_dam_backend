import { Body, Controller, Get, HttpCode, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { LoginDto } from '../application/dto/login.dto';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { JwtAuthGuard } from '../infrastructure/guards/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../../../shared/decorators/auth.decorator';
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from '../infrastructure/auth-cookie';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.loginUseCase.execute(dto.email, dto.password);
    res.cookie(AUTH_COOKIE_NAME, result.accessToken, getAuthCookieOptions());
    return { user: result.user };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(AUTH_COOKIE_NAME, { ...getAuthCookieOptions(), maxAge: undefined });
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  me(@CurrentUser() user: AuthUser) {
    return { user };
  }
}
