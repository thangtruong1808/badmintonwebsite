import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import {
  getUserRegistrations as getUserRegistrationsService,
  registerForEvents as registerForEventsService,
  cancelRegistration as cancelRegistrationService,
  getEventRegistrations as getEventRegistrationsService,
} from '../services/registrationService.js';
import { createError } from '../middleware/errorHandler.js';
import type { RegistrationFormData } from '../types/index.js';

export const getUserRegistrations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw createError('User ID not found', 401);
    }

    const registrations = await getUserRegistrationsService(req.userId);
    res.json(registrations);
  } catch (error) {
    next(error);
  }
};

export const getEventRegistrations = async (
  req: AuthRequest<{ eventId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      throw createError('Invalid event ID', 400);
    }

    const registrations = await getEventRegistrationsService(eventId);
    res.json(registrations);
  } catch (error) {
    next(error);
  }
};

export const registerForEvents = async (
  req: AuthRequest<{}, {}, { eventIds: number[]; formData: RegistrationFormData }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw createError('User ID not found', 401);
    }

    const { eventIds, formData } = req.body;

    if (!eventIds || !Array.isArray(eventIds) || eventIds.length === 0) {
      throw createError('Event IDs are required', 400);
    }

    const result = await registerForEventsService(req.userId, eventIds, formData);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const cancelRegistration = async (
  req: AuthRequest<{ registrationId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw createError('User ID not found', 401);
    }

    const { registrationId } = req.params;
    const success = await cancelRegistrationService(req.userId, registrationId);

    if (!success) {
      throw createError('Registration not found or unauthorized', 404);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
