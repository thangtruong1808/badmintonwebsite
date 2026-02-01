import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { createError } from "./errorHandler.js";
import { getAccessTokenCookieName } from "../utils/cookies.js";

export interface AuthRequest<
  P = import("express-serve-static-core").ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any,
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  userId?: string;
  user?: {
    id: string;
    email: string;
  };
}

/** Get JWT secret at runtime (after dotenv loads) */
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET must be defined in environment variables");
  }
  return secret;
};

/** Get access token expiry at runtime */
const getAccessTokenExpiry = (): string => {
  return process.env.ACCESS_TOKEN_EXPIRY || "1m";
};

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const cookieName = getAccessTokenCookieName();
  const tokenFromCookie = req.cookies?.[cookieName];
  const authHeader = req.headers["authorization"];
  const tokenFromHeader = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
  const token = tokenFromCookie || tokenFromHeader;

  if (!token) {
    throw createError("Access token required", 401);
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as {
      userId: string;
      email: string;
    };
    req.userId = decoded.userId;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
    };
    next();
  } catch (error) {
    throw createError("Invalid or expired access token", 401);
  }
};

/** Short-lived access token (e.g. 1 min) for API auth */
export const generateAccessToken = (userId: string, email: string): string => {
  return jwt.sign({ userId, email }, getJwtSecret(), { expiresIn: getAccessTokenExpiry() as any });
};

/** Legacy: single token (use generateAccessToken + refresh token instead) */
export const generateToken = (userId: string, email: string): string => {
  return jwt.sign({ userId, email }, getJwtSecret(), { expiresIn: "7d" });
};

export const getAccessTokenExpiresInSeconds = (): number => {
  const expiry = getAccessTokenExpiry();
  const match = expiry.match(/^(\d+)([smh])$/);
  // Set to 1 minute for testing
  if (!match) return 1 * 60;
  const [, num, unit] = match;
  const n = parseInt(num!, 10);
  if (unit === "s") return n;
  if (unit === "m") return n * 60;
  if (unit === "h") return n * 3600;
  // Set to 1 minute for testing
  return 1 * 60;
};
