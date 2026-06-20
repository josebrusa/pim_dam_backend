const DEFAULT_JWT_SECRET = 'change-me-in-production';

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET ?? DEFAULT_JWT_SECRET;

  if (process.env.NODE_ENV === 'production' && secret === DEFAULT_JWT_SECRET) {
    throw new Error('JWT_SECRET must be configured in production');
  }

  return secret;
}
