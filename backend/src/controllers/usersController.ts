import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import {
  getUserById as getUserByIdService,
  updateUser as updateUserService,
} from '../services/userService.js';
import { createError } from '../middleware/errorHandler.js';

export const getCurrentUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw createError('User ID not found', 401);
    }

    const user = await getUserByIdService(req.userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    // Remove password from response
    const { password: _, ...userResponse } = user;
    res.json(userResponse);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: AuthRequest<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    const user = await getUserByIdService(userId);

    if (!user) {
      throw createError('User not found', 404);
    }

    // Remove password from response
    const { password: _, ...userResponse } = user;
    res.json(userResponse);
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (
  req: AuthRequest<{}, {}, { firstName?: string; lastName?: string; phone?: string; avatar?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw createError('User ID not found', 401);
    }

    const updatedUser = await updateUserService(req.userId, req.body);
    if (!updatedUser) {
      throw createError('User not found', 404);
    }

    // Remove password from response
    const { password: _, ...userResponse } = updatedUser;
    res.json(userResponse);
  } catch (error) {
    next(error);
  }
};
