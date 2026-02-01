import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { generateAccessToken, getAccessTokenExpiresInSeconds } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import { getUserByEmail, createUser, getUserById } from '../services/userService.js';
import { createRefreshToken as createRefreshTokenRecord, findRefreshToken, deleteRefreshToken, extendRefreshTokenExpiry } from '../services/refreshTokenService.js';
import { setAuthCookies, clearAuthCookies, getRefreshTokenCookieName } from '../utils/cookies.js';
import type { LoginRequest, RegisterRequest, User, UserResponse } from '../types/index.js';
import type { AuthRequest } from '../middleware/auth.js';

function userToResponse(user: User): UserResponse {
  const { password: _, ...rest } = user;
  return rest as UserResponse;
}

export const login = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await getUserByEmail(email);
    if (!user) {
      throw createError('Invalid email or password', 401);
    }

    if (!user.password) {
      throw createError('Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createError('Invalid email or password', 401);
    }

    const accessToken = generateAccessToken(user.id, user.email);
    const { token: refreshToken } = await createRefreshTokenRecord(user.id);
    const expiresIn = getAccessTokenExpiresInSeconds();

    setAuthCookies(res, accessToken, refreshToken);
    res.json({
      user: userToResponse(user),
      expiresIn,
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (
  req: Request<{}, {}, RegisterRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw createError('User with this email already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'user',
      rewardPoints: 0,
      totalPointsEarned: 0,
      totalPointsSpent: 0,
      memberSince: new Date().toISOString().slice(0, 10),
    });

    const accessToken = generateAccessToken(user.id, user.email);
    const { token: refreshToken } = await createRefreshTokenRecord(user.id);
    const expiresIn = getAccessTokenExpiresInSeconds();

    setAuthCookies(res, accessToken, refreshToken);
    res.status(201).json({
      user: userToResponse(user),
      expiresIn,
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cookieName = getRefreshTokenCookieName();
    const token = req.cookies?.[cookieName] ?? req.body?.refreshToken;
    if (!token) {
      clearAuthCookies(res);
      res.status(401).json({ status: 'fail', message: 'Refresh token required', forceLogout: true });
      return;
    }

    const found = await findRefreshToken(token);
    if (!found) {
      clearAuthCookies(res);
      res.status(401).json({ status: 'fail', message: 'Invalid or expired refresh token', forceLogout: true });
      return;
    }

    const user = await getUserById(found.userId);
    if (!user) {
      await deleteRefreshToken(token);
      clearAuthCookies(res);
      res.status(401).json({ status: 'fail', message: 'User not found', forceLogout: true });
      return;
    }

    // Reuse the same refresh token; extend its expiry on activity so active users stay logged in.
    await extendRefreshTokenExpiry(token);
    const accessToken = generateAccessToken(user.id, user.email);
    const expiresIn = getAccessTokenExpiresInSeconds();

    setAuthCookies(res, accessToken, token);
    res.json({
      user: userToResponse(user),
      expiresIn,
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(200).json({ user: null });
      return;
    }
    const user = await getUserById(userId);
    if (!user) {
      res.status(200).json({ user: null });
      return;
    }
    res.json({ user: userToResponse(user) });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    clearAuthCookies(res);
    res.status(200).json({ status: 'ok', message: 'Logged out' });
  } catch (error) {
    next(error);
  }
};
