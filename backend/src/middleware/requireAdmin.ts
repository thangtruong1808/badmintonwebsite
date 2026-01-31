import { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.js';
import { getUserById } from '../services/userService.js';
import { createError } from './errorHandler.js';

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.userId;
  if (!userId) {
    throw createError('Unauthorized', 401);
  }

  const user = await getUserById(userId);
  if (!user) {
    throw createError('User not found', 403);
  }

  if (user.role !== 'admin' && user.role !== 'super_admin') {
    throw createError('Forbidden: admin or super_admin role required', 403);
  }

  next();
};
