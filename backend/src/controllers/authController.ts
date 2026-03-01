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
      res.status(200).json({ message: 'Invalid email or password. Please try again.' });
      return;
    }

    if (!user.password) {
      res.status(200).json({ message: 'Invalid email or password. Please try again.' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(200).json({ message: 'Invalid email or password. Please try again.' });
      return;
    }

    if (user.isBlocked) {
      res.status(200).json({ message: 'The account has been blocked. Please contact us for support.' });
      return;
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
    const { firstName, lastName, email, password, phone } = req.body;

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      res.status(200).json({ message: 'User with this email already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser({
      firstName,
      lastName,
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
    if (user.isBlocked) {
      await deleteRefreshToken(token);
      clearAuthCookies(res);
      res.status(401).json({ status: 'fail', message: 'Account is disabled', forceLogout: true });
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
    let userId = req.userId;
    let user = userId ? await getUserById(userId) : null;
    let refreshToken = req.cookies?.[getRefreshTokenCookieName()];
    let refreshTokenExpiresAt: number | null = null;

    // Access token invalid/missing but refresh token present: try refresh (avoids frontend /refresh call and 401 when not logged in)
    if (!user && refreshToken) {
      const found = await findRefreshToken(refreshToken);
      if (found) {
        user = await getUserById(found.userId);
        if (user && !user.isBlocked) {
          await extendRefreshTokenExpiry(refreshToken);
          refreshTokenExpiresAt = getRefreshTokenExpiresAt().getTime();
          const accessToken = generateAccessToken(user.id, user.email);
          setAuthCookies(res, accessToken, refreshToken);
        } else {
          if (user?.isBlocked) {
            await deleteRefreshToken(refreshToken);
            clearAuthCookies(res);
          }
          user = null;
        }
      }
    } else if (user && refreshToken) {
      refreshTokenExpiresAt = await getRefreshTokenExpiryMs(refreshToken);
    }

    if (!user || user.isBlocked) {
      if (user?.isBlocked && refreshToken) {
        await deleteRefreshToken(refreshToken);
        clearAuthCookies(res);
      }
      res.status(200).json({ user: null });
      return;
    }
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
        // Send email asynchronously (fire-and-forget) to avoid blocking the response
        // This significantly improves response time on production servers
        sendPasswordResetEmail(user.email, resetLink, expiresAt, user.firstName)
          .catch((err) => console.error('Failed to send password reset email:', err));
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
      res.status(200).json({ success: false, message: 'Passwords do not match.' });
      return;
    }
    const userId = await findValidResetToken(token);
    if (!userId) {
      res.status(200).json({ success: false, message: 'Invalid or expired reset link. Please request a new password reset.' });
      return;
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updatePassword(userId, hashedPassword);
    await consumeResetToken(token);
    res.status(200).json({ message: 'Password has been reset. You can now sign in with your new password.' });
  } catch (error) {
    next(error);
  }
};
