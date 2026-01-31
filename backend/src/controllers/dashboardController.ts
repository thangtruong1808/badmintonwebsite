import type { Request, Response } from 'express';
import { getAllUsersCount } from '../services/userService.js';
import { getAllEvents } from '../services/eventService.js';
import { getRegistrationsCount } from '../services/registrationService.js';
import { getRewardTransactionsCount } from '../services/rewardService.js';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  const [usersCount, events, registrationsCount, rewardTransactionsCount] = await Promise.all([
    getAllUsersCount(),
    getAllEvents(),
    getRegistrationsCount(),
    getRewardTransactionsCount(),
  ]);

  res.json({
    usersCount,
    eventsCount: events.length,
    registrationsCount,
    rewardTransactionsCount,
  });
};
