import { Response } from 'express';

const ACCESS_TOKEN_COOKIE = process.env.ACCESS_TOKEN_COOKIE || 'accessToken';
const REFRESH_TOKEN_COOKIE = process.env.REFRESH_TOKEN_COOKIE || 'refreshToken';

const isProduction = process.env.NODE_ENV === 'production';

// COOKIE_DOMAIN: Set to ".yourdomain.com" (with leading dot) to share cookies across subdomains.
// This enables Safari compatibility when frontend (chibibadminton.com.au) and backend (api.chibibadminton.com.au) 
// are on the same root domain. When set, cookies become "first-party" and work in all browsers.
// Leave unset for cross-origin setup (requires SameSite=None which Safari blocks).
const cookieDomain = process.env.COOKIE_DOMAIN || undefined;

// When using same-domain (COOKIE_DOMAIN set), use SameSite=Lax for better security.
// When cross-origin (no COOKIE_DOMAIN), use SameSite=None (required but blocked by Safari ITP).
const getSameSiteValue = (): 'none' | 'lax' | 'strict' => {
  if (cookieDomain) {
    return 'lax';
  }
  return isProduction ? 'none' : 'lax';
};

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

/** Build cookie options dynamically to pick up COOKIE_DOMAIN at runtime */
function getCookieOptions() {
  const options: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'none' | 'lax' | 'strict';
    path: string;
    domain?: string;
  } = {
    httpOnly: true,
    secure: isProduction,
    sameSite: getSameSiteValue(),
    path: '/',
  };
  
  if (cookieDomain) {
    options.domain = cookieDomain;
  }
  
  return options;
}

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
): void {
  const accessMaxAge = getAccessTokenMaxAge();
  const refreshMaxAge = getRefreshTokenMaxAge();
  const cookieOptions = getCookieOptions();

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
  const cookieOptions = getCookieOptions();
  res.cookie(ACCESS_TOKEN_COOKIE, '', { ...cookieOptions, maxAge: 0 });
  res.cookie(REFRESH_TOKEN_COOKIE, '', { ...cookieOptions, maxAge: 0 });
}

export function getAccessTokenCookieName(): string {
  return ACCESS_TOKEN_COOKIE;
}

export function getRefreshTokenCookieName(): string {
  return REFRESH_TOKEN_COOKIE;
}
