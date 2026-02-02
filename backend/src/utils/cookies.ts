import { Response } from 'express';

const ACCESS_TOKEN_COOKIE = process.env.ACCESS_TOKEN_COOKIE || 'accessToken';
const REFRESH_TOKEN_COOKIE = process.env.REFRESH_TOKEN_COOKIE || 'refreshToken';

const isProduction = process.env.NODE_ENV === 'production';

// In production, frontend and API are often on different domains (e.g. app.com vs api.vercel.app).
// SameSite=None; Secure is required for cross-origin cookies to be sent.
const sameSiteValue = isProduction ? ('none' as const) : ('lax' as const);

/** Get access token cookie maxAge in seconds from ACCESS_TOKEN_EXPIRY env (e.g. "15m" -> 900) */
function getAccessTokenMaxAge(): number {
  const expiry = process.env.ACCESS_TOKEN_EXPIRY || '15m';
  const match = expiry.match(/^(\d+)([smh])$/);
  if (!match) return 15 * 60;
  const [, num, unit] = match;
  const n = parseInt(num!, 10);
  if (unit === 's') return n;
  if (unit === 'm') return n * 60;
  if (unit === 'h') return n * 3600;
  return 15 * 60;
}

/** Get refresh token cookie maxAge in seconds from REFRESH_TOKEN_EXPIRY_DAYS env (e.g. "7d" or "7") */
function getRefreshTokenMaxAge(): number {
  const envValue = process.env.REFRESH_TOKEN_EXPIRY_DAYS || '7';
  const match = envValue.match(/^(\d+)([mhd]?)$/);
  if (!match) return 7 * 24 * 3600;
  const value = parseInt(match[1], 10);
  const unit = match[2] || 'd';
  if (unit === 'm') return value * 60;
  if (unit === 'h') return value * 3600;
  return value * 24 * 3600;
}

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: sameSiteValue,
  path: '/',
};

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
): void {
  const accessMaxAge = getAccessTokenMaxAge();
  const refreshMaxAge = getRefreshTokenMaxAge();

  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...cookieOptions,
    maxAge: accessMaxAge * 1000,
  });
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...cookieOptions,
    maxAge: refreshMaxAge * 1000,
  });
}

export function clearAuthCookies(res: Response): void {
  res.cookie(ACCESS_TOKEN_COOKIE, '', { ...cookieOptions, maxAge: 0 });
  res.cookie(REFRESH_TOKEN_COOKIE, '', { ...cookieOptions, maxAge: 0 });
}

export function getAccessTokenCookieName(): string {
  return ACCESS_TOKEN_COOKIE;
}

export function getRefreshTokenCookieName(): string {
  return REFRESH_TOKEN_COOKIE;
}
