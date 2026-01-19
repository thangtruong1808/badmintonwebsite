import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import { getUserByEmail, createUser } from '../services/userService.js';
import type { LoginRequest, RegisterRequest } from '../types/index.js';

export const login = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await getUserByEmail(email);
    if (!user) {
      throw createError('Invalid email or password', 401);
    }

    // Verify password
    if (!user.password) {
      throw createError('Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createError('Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken(user.id, user.email);

    // Return user without password
    const { password: _, ...userResponse } = user;

    res.json({
      token,
      user: userResponse,
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

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw createError('User with this email already exists', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      phone,
      rewardPoints: 0,
      totalPointsEarned: 0,
      totalPointsSpent: 0,
      memberSince: new Date().toISOString(),
    });

    // Generate token
    const token = generateToken(user.id, user.email);

    // Return user without password
    const { password: _, ...userResponse } = user;

    res.status(201).json({
      token,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};
