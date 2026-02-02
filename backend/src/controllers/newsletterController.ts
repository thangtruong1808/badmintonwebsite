import type { Request, Response, NextFunction } from 'express';
import { subscribe as subscribeService, createWithDetails, findAll, update, remove } from '../services/newsletterSubscriptionService.js';
import { createError } from '../middleware/errorHandler.js';

/** Public: subscribe to newsletter. Returns friendly message if email already exists. */
export const subscribe = async (
  req: Request<{}, {}, { email: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      throw createError('Please provide a valid email address.', 400);
    }
    const result = await subscribeService(email);
    if ('existing' in result && result.existing) {
      res.status(200).json({
        message: 'This email is already subscribed to our newsletter. Thank you for your continued interest!',
        alreadySubscribed: true,
      });
      return;
    }
    res.status(201).json({
      message: 'Thank you for subscribing to our newsletter!',
      subscription: result.subscription,
    });
  } catch (error) {
    next(error);
  }
};

/** Admin: list all newsletter subscriptions */
export const getNewsletterSubscriptions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const list = await findAll();
    res.json(list);
  } catch (error) {
    next(error);
  }
};

/** Admin: create a newsletter subscription */
export const createNewsletterSubscription = async (
  req: Request<{}, {}, { email: string; subscribed_at?: string; status?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, subscribed_at, status } = req.body;
    if (!email || typeof email !== 'string') {
      throw createError('Email is required.', 400);
    }
    const result = await createWithDetails(
      email,
      subscribed_at,
      (status as 'active' | 'unsubscribed') || 'active'
    );
    if ('existing' in result && result.existing) {
      res.status(409).json({
        message: 'This email is already subscribed to our newsletter.',
        alreadySubscribed: true,
      });
      return;
    }
    res.status(201).json(result.subscription);
  } catch (error) {
    next(error);
  }
};

/** Admin: update a newsletter subscription */
export const updateNewsletterSubscription = async (
  req: Request<{ id: string }, {}, { email?: string; subscribed_at?: string; status?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      throw createError('Invalid subscription ID.', 400);
    }
    const updated = await update(id, {
      email: req.body.email,
      subscribed_at: req.body.subscribed_at,
      status: req.body.status as 'active' | 'unsubscribed' | undefined,
    });
    if (!updated) {
      throw createError('Newsletter subscription not found.', 404);
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

/** Admin: delete a newsletter subscription */
export const deleteNewsletterSubscription = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      throw createError('Invalid subscription ID.', 400);
    }
    const deleted = await remove(id);
    if (!deleted) {
      throw createError('Newsletter subscription not found.', 404);
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
