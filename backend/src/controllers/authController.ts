import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { generateAccessToken, getAccessTokenExpiresInSeconds } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import { getUserByEmail, createUser, getUserById } from '../services/userService.js';
import { createRefreshToken as createRefreshTokenRecord, findRefreshToken, deleteRefreshToken } from '../services/refreshTokenService.js';
import type { LoginRequest, RegisterRequest, User, UserResponse } from '../types/index.js';

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
    const { token: refreshToken, expiresAt } = await createRefreshTokenRecord(user.id);
    const expiresIn = getAccessTokenExpiresInSeconds();

    res.json({
      user: userToResponse(user),
      accessToken,
      refreshToken,
      expiresIn,
      refreshExpiresAt: expiresAt.toISOString(),
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
    const { token: refreshToken, expiresAt } = await createRefreshTokenRecord(user.id);
    const expiresIn = getAccessTokenExpiresInSeconds();

    res.status(201).json({
      user: userToResponse(user),
      accessToken,
      refreshToken,
      expiresIn,
      refreshExpiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request<{}, {}, { refreshToken?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(401).json({ status: 'fail', message: 'Refresh token required' });
    }

    const found = await findRefreshToken(token);
    if (!found) {
      return res.status(401).json({ status: 'fail', message: 'Invalid or expired refresh token' });
    }

    const user = await getUserById(found.userId);
    if (!user) {
      await deleteRefreshToken(token);
      return res.status(401).json({ status: 'fail', message: 'User not found' });
    }

    await deleteRefreshToken(token);
    const { token: newRefreshToken, expiresAt } = await createRefreshTokenRecord(user.id);
    const accessToken = generateAccessToken(user.id, user.email);
    const expiresIn = getAccessTokenExpiresInSeconds();

    res.json({
      user: userToResponse(user),
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn,
      refreshExpiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
