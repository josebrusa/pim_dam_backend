export function getCorsOrigins() {
  const corsOrigin = process.env.CORS_ORIGIN;

  if (process.env.NODE_ENV === 'production' && !corsOrigin) {
    throw new Error('CORS_ORIGIN must be configured in production');
  }

  return corsOrigin?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? ['http://localhost:5173'];
}
