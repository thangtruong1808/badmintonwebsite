import { Request, Response, NextFunction } from 'express';
import { createError } from '../middleware/errorHandler.js';
import {
  getAllVetsEvents,
  getVetsEventById,
  createVetsEvent,
  updateVetsEvent,
  deleteVetsEvent,
  createVetsInterest,
  getAllVetsInterests,
  getVetsInterestById,
  updateVetsInterestStatus,
  deleteVetsInterest,
  type CreateVetsEventData,
  type CreateVetsInterestData,
} from '../services/vetsService.js';

// ============ Public Endpoints ============

export const getActiveVetsEvents = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const events = await getAllVetsEvents(true);
    res.json(events);
  } catch (error) {
    next(error);
  }
};

export const submitVetsInterest = async (
  req: Request<{}, {}, CreateVetsInterestData>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { firstName, lastName, email, phone, playerRating, eventIds } = req.body;

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
      throw createError('First name, last name, and email are required', 400);
    }

    if (!eventIds || !Array.isArray(eventIds) || eventIds.length === 0) {
      throw createError('Please select at least one event', 400);
    }

    const interest = await createVetsInterest({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone?.trim(),
      playerRating: playerRating?.trim(),
      eventIds,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your interest! We will be in touch soon.',
      interest,
    });
  } catch (error) {
    next(error);
  }
};

// ============ Admin Endpoints - Events ============

export const getAllVetsEventsAdmin = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const events = await getAllVetsEvents(false);
    res.json(events);
  } catch (error) {
    next(error);
  }
};

export const createVetsEventAdmin = async (
  req: Request<{}, {}, CreateVetsEventData>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, location, eventDate, description, isActive } = req.body;

    if (!title?.trim() || !location?.trim() || !eventDate) {
      throw createError('Title, location, and event date are required', 400);
    }

    const event = await createVetsEvent({
      title: title.trim(),
      location: location.trim(),
      eventDate,
      description: description?.trim(),
      isActive,
    });

    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

export const updateVetsEventAdmin = async (
  req: Request<{ id: string }, {}, Partial<CreateVetsEventData>>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw createError('Invalid event ID', 400);

    const existing = await getVetsEventById(id);
    if (!existing) throw createError('Event not found', 404);

    const updated = await updateVetsEvent(id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteVetsEventAdmin = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw createError('Invalid event ID', 400);

    const deleted = await deleteVetsEvent(id);
    if (!deleted) throw createError('Event not found', 404);

    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ============ Admin Endpoints - Interests ============

export const getAllVetsInterestsAdmin = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const interests = await getAllVetsInterests();
    res.json(interests);
  } catch (error) {
    next(error);
  }
};

export const getVetsInterestByIdAdmin = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw createError('Invalid interest ID', 400);

    const interest = await getVetsInterestById(id);
    if (!interest) throw createError('Interest not found', 404);

    res.json(interest);
  } catch (error) {
    next(error);
  }
};

export const updateVetsInterestStatusAdmin = async (
  req: Request<{ id: string }, {}, { status: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw createError('Invalid interest ID', 400);

    const { status } = req.body;
    const validStatuses = ['interested', 'contacted', 'registered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      throw createError(`Status must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const existing = await getVetsInterestById(id);
    if (!existing) throw createError('Interest not found', 404);

    const updated = await updateVetsInterestStatus(
      id,
      status as 'interested' | 'contacted' | 'registered' | 'cancelled'
    );
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteVetsInterestAdmin = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw createError('Invalid interest ID', 400);

    const deleted = await deleteVetsInterest(id);
    if (!deleted) throw createError('Interest not found', 404);

    res.json({ success: true, message: 'Interest deleted successfully' });
  } catch (error) {
    next(error);
  }
};
