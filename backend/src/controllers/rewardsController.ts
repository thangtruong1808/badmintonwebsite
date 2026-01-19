import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import {
  getUserRewardPoints as getUserRewardPointsService,
  getUserTransactions as getUserTransactionsService,
  getUserEventHistory as getUserEventHistoryService,
  claimPointsForEvent as claimPointsForEventService,
  usePointsForBooking as usePointsForBookingService,
  getUnclaimedPointsCount as getUnclaimedPointsCountService,
} from '../services/rewardService.js';
import { createError } from '../middleware/errorHandler.js';

export const getUserRewardPoints = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw createError('User ID not found', 401);
    }

    const points = await getUserRewardPointsService(req.userId);
    res.json({ points });
  } catch (error) {
    next(error);
  }
};

export const getUserTransactions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw createError('User ID not found', 401);
    }

    const transactions = await getUserTransactionsService(req.userId);
    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

export const getUserEventHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw createError('User ID not found', 401);
    }

    const history = await getUserEventHistoryService(req.userId);
    res.json(history);
  } catch (error) {
    next(error);
  }
};

export const getUnclaimedPointsCount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw createError('User ID not found', 401);
    }

    const count = await getUnclaimedPointsCountService(req.userId);
    res.json({ count });
  } catch (error) {
    next(error);
  }
};

export const claimPointsForEvent = async (
  req: AuthRequest<{ eventId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw createError('User ID not found', 401);
    }

    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      throw createError('Invalid event ID', 400);
    }

    const success = await claimPointsForEventService(req.userId, eventId);
    if (!success) {
      throw createError('Cannot claim points for this event', 400);
    }

    res.json({ success: true, message: 'Points claimed successfully' });
  } catch (error) {
    next(error);
  }
};

export const usePointsForBooking = async (
  req: AuthRequest<{}, {}, { eventId: number; points: number }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw createError('User ID not found', 401);
    }

    const { eventId, points } = req.body;

    if (!eventId || !points || points <= 0) {
      throw createError('Event ID and positive points amount are required', 400);
    }

    const success = await usePointsForBookingService(req.userId, eventId, points);
    if (!success) {
      throw createError('Insufficient points or invalid request', 400);
    }

    res.json({ success: true, message: 'Points used successfully' });
  } catch (error) {
    next(error);
  }
};
