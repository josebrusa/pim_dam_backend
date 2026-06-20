import type { CookieOptions } from 'express';

export const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? 'lumify_access_token';

export function getAuthCookieOptions(): CookieOptions {
  const sameSite = (process.env.AUTH_COOKIE_SAME_SITE ?? 'lax') as 'lax' | 'strict' | 'none';
  const isSecure = process.env.AUTH_COOKIE_SECURE === 'false'
    ? false
    : process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isSecure,
    sameSite,
    path: '/',
    maxAge: 8 * 60 * 60 * 1000,
  };
}

export function extractAuthTokenFromCookie(cookieHeader?: string): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [rawName, ...valueParts] = cookie.trim().split('=');
    if (rawName === AUTH_COOKIE_NAME) {
      const value = valueParts.join('=');
      return value ? decodeURIComponent(value) : null;
    }
  }

  return null;
}
