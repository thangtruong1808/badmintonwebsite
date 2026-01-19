import { Request, Response, NextFunction } from 'express';
import {
  getAllEvents as getAllEventsService,
  getEventById as getEventByIdService,
  createEvent as createEventService,
  updateEvent as updateEventService,
  deleteEvent as deleteEventService,
} from '../services/eventService.js';
import { createError } from '../middleware/errorHandler.js';
import type { SocialEvent } from '../types/index.js';

export const getAllEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const events = await getAllEventsService();
    res.json(events);
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const eventId = parseInt(req.params.id);
    if (isNaN(eventId)) {
      throw createError('Invalid event ID', 400);
    }

    const event = await getEventByIdService(eventId);
    if (!event) {
      throw createError('Event not found', 404);
    }

    res.json(event);
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (
  req: Request<{}, {}, SocialEvent>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const event = await createEventService(req.body);
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (
  req: Request<{ id: string }, {}, Partial<SocialEvent>>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const eventId = parseInt(req.params.id);
    if (isNaN(eventId)) {
      throw createError('Invalid event ID', 400);
    }

    const event = await updateEventService(eventId, req.body);
    if (!event) {
      throw createError('Event not found', 404);
    }

    res.json(event);
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const eventId = parseInt(req.params.id);
    if (isNaN(eventId)) {
      throw createError('Invalid event ID', 400);
    }

    const success = await deleteEventService(eventId);
    if (!success) {
      throw createError('Event not found', 404);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
