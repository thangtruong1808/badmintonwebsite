import type { Request, Response } from 'express';
import { testConnection } from '../db/connection.js';
import { getAllUsersCount } from '../services/userService.js';
import { getAllEvents } from '../services/eventService.js';
import { getRegistrationsCount } from '../services/registrationService.js';
import { getRewardTransactionsCount } from '../services/rewardService.js';

export const testDbConnection = async (req: Request, res: Response): Promise<void> => {
  const result = await testConnection();
  if (result.ok) {
    res.json({ connected: true, message: 'Database connection OK' });
  } else {
    res.status(503).json({ connected: false, message: result.message });
  }
};

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
