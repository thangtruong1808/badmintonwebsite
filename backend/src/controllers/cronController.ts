import { Request, Response, NextFunction } from 'express';
import {
  expirePendingPromotions,
  processWaitlistsForAvailableSpots,
} from '../services/registrationService.js';
import { createError } from '../middleware/errorHandler.js';

/**
 * Cron endpoint to expire pending_payment registrations, promote next from waitlist,
 * and process waitlists for events with available spots (e.g. after capacity increase).
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

    const expireResult = await expirePendingPromotions();
    const processResult = await processWaitlistsForAvailableSpots();
    res.json({
      success: true,
      ...expireResult,
      waitlistProcessed: processResult.processed,
      waitlistPromoted: processResult.promoted,
    });
  } catch (error) {
    next(error);
  }
};
