import { Request, Response, NextFunction } from 'express';
import { expirePendingPromotions } from '../services/registrationService.js';
import { createError } from '../middleware/errorHandler.js';

/**
 * Cron endpoint to expire pending_payment registrations and promote next from waitlist.
 * Protected by CRON_SECRET in Authorization header or X-Cron-Secret.
 */
export const expirePendingPromotionsCron = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const secret = process.env.CRON_SECRET;
    const authHeader = req.headers.authorization;
    const cronSecret = req.headers['x-cron-secret'] as string | undefined;

    const provided = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : cronSecret;

    if (!secret || provided !== secret) {
      throw createError('Unauthorized', 401);
    }

    const result = await expirePendingPromotions();
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
