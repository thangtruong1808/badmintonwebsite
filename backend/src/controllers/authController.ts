import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { generateAccessToken, getAccessTokenExpiresInSeconds } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import { getUserByEmail, createUser, getUserById, updatePassword } from '../services/userService.js';
import { createRefreshToken as createRefreshTokenRecord, findRefreshToken, deleteRefreshToken, extendRefreshTokenExpiry, getRefreshTokenExpiresAt, getRefreshTokenExpiryMs } from '../services/refreshTokenService.js';
import { createResetToken, findValidResetToken, consumeResetToken } from '../services/passwordResetService.js';
import { setAuthCookies, clearAuthCookies, getRefreshTokenCookieName } from '../utils/cookies.js';
import { sendPasswordResetEmail } from '../utils/email.js';
import { getFrontendBaseUrl } from '../utils/appUrl.js';
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
    const { token: refreshToken, expiresAt: refreshExpiresAt } = await createRefreshTokenRecord(user.id);
    const expiresIn = getAccessTokenExpiresInSeconds();

    setAuthCookies(res, accessToken, refreshToken);
    res.json({
      user: userToResponse(user),
      expiresIn,
      refreshTokenExpiresAt: refreshExpiresAt.getTime(),
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
    const { token: refreshToken, expiresAt: refreshExpiresAt } = await createRefreshTokenRecord(user.id);
    const expiresIn = getAccessTokenExpiresInSeconds();

    setAuthCookies(res, accessToken, refreshToken);
    res.status(201).json({
      user: userToResponse(user),
      expiresIn,
      refreshTokenExpiresAt: refreshExpiresAt.getTime(),
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

    const doExtend = req.body?.extend !== false;
    let refreshTokenExpiresAt: number;
    if (doExtend) {
      await extendRefreshTokenExpiry(token);
      refreshTokenExpiresAt = getRefreshTokenExpiresAt().getTime();
    } else {
      refreshTokenExpiresAt = found.expiresAt.getTime();
    }

    const accessToken = generateAccessToken(user.id, user.email);
    const expiresIn = getAccessTokenExpiresInSeconds();

    setAuthCookies(res, accessToken, token);
    res.json({
      user: userToResponse(user),
      expiresIn,
      refreshTokenExpiresAt,
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
    const cookieName = getRefreshTokenCookieName();
    const refreshToken = req.cookies?.[cookieName];
    const refreshTokenExpiresAt = refreshToken
      ? await getRefreshTokenExpiryMs(refreshToken)
      : null;
    const payload: { user: UserResponse; refreshTokenExpiresAt?: number } = { user: userToResponse(user) };
    if (refreshTokenExpiresAt != null) payload.refreshTokenExpiresAt = refreshTokenExpiresAt;
    res.json(payload);
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cookieName = getRefreshTokenCookieName();
    const token = req.cookies?.[cookieName];
    if (token) await deleteRefreshToken(token);
    clearAuthCookies(res);
    res.status(200).json({ status: 'ok', message: 'Logged out' });
  } catch (error) {
    next(error);
  }
};

/** Request password reset: create token in DB, always return same message (don't leak if email exists). */
export const requestPasswordReset = async (
  req: Request<{}, {}, { email: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await getUserByEmail(email);
    if (user) {
      const { token, expiresAt } = await createResetToken(user.id);
      if (process.env.SEND_PASSWORD_RESET_EMAIL === 'true') {
        const baseUrl = getFrontendBaseUrl();
        const resetLink = `${baseUrl}/reset-password?token=${token}`;
        await sendPasswordResetEmail(user.email, resetLink, expiresAt);
      }
    }
    res.status(200).json({
      message: 'If an account exists with this email, you will receive a password reset link.',
    });
  } catch (error) {
    next(error);
  }
};

/** Reset password using token from email link. */
export const resetPassword = async (
  req: Request<{}, {}, { token: string; newPassword: string; confirmPassword: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      throw createError('Passwords do not match', 400);
    }
    const userId = await findValidResetToken(token);
    if (!userId) {
      throw createError('Invalid or expired reset link. Please request a new password reset.', 400);
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updatePassword(userId, hashedPassword);
    await consumeResetToken(token);
    res.status(200).json({ message: 'Password has been reset. You can now sign in with your new password.' });
  } catch (error) {
    next(error);
  }
};
