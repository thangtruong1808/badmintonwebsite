import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createError } from './errorHandler.js';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
});

const requestPasswordResetSchema = z.object({
  email: z.string().email('Invalid email format'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const newsletterSubscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

// Validation middleware
export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    loginSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((e) => e.message).join(', ');
      throw createError(errorMessage, 400);
    }
    next(error);
  }
};

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    registerSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((e) => e.message).join(', ');
      throw createError(errorMessage, 400);
    }
    next(error);
  }
};

export const validateRequestPasswordReset = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    requestPasswordResetSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((e) => e.message).join(', ');
      throw createError(errorMessage, 400);
    }
    next(error);
  }
};

export const validateResetPassword = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    resetPasswordSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((e) => e.message).join(', ');
      throw createError(errorMessage, 400);
    }
    next(error);
  }
};

export const validateNewsletterSubscribe = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    newsletterSubscribeSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((e) => e.message).join(', ');
      throw createError(errorMessage, 400);
    }
    next(error);
  }
};

export const validateContactForm = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    contactFormSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((e) => e.message).join(', ');
      throw createError(errorMessage, 400);
    }
    next(error);
  }
};
