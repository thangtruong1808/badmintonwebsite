import type { Request, Response, NextFunction } from 'express';
import * as courtService from '../services/courtService.js';
import { createError } from '../middleware/errorHandler.js';
import { getPlaySlotById } from '../services/playSlotService.js';

export const getCourts = async (req: Request<{ slotId: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const slotId = parseInt(req.params.slotId);
    if (isNaN(slotId)) {
      throw createError('Invalid slot ID', 400);
    }
    const slot = await getPlaySlotById(slotId);
    if (!slot) {
      throw createError('Play slot not found', 404);
    }
    const courts = await courtService.getCourtsByPlaySlotId(slotId);
    res.json(courts);
  } catch (error) {
    next(error);
  }
};

export const createCourt = async (
  req: Request<{ slotId: string }, object, { name?: string; sortOrder?: number }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const slotId = parseInt(req.params.slotId);
    if (isNaN(slotId)) {
      throw createError('Invalid slot ID', 400);
    }
    const slot = await getPlaySlotById(slotId);
    if (!slot) {
      throw createError('Play slot not found', 404);
    }
    const name = req.body?.name?.trim();
    if (!name) {
      throw createError('Court name is required', 400);
    }
    const sortOrder = req.body?.sortOrder ?? 0;
    const court = await courtService.createCourt(slotId, name, sortOrder);
    res.status(201).json(court);
  } catch (error) {
    next(error);
  }
};

export const updateCourt = async (
  req: Request<{ slotId: string; courtId: string }, object, { name?: string; sortOrder?: number }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const slotId = parseInt(req.params.slotId);
    const courtId = parseInt(req.params.courtId);
    if (isNaN(slotId) || isNaN(courtId)) {
      throw createError('Invalid slot or court ID', 400);
    }
    const name = req.body?.name?.trim();
    const sortOrder = req.body?.sortOrder;
    const court = await courtService.updateCourt(courtId, { name, sortOrder });
    if (!court) {
      throw createError('Court not found', 404);
    }
    if (court.playSlotId !== slotId) {
      throw createError('Court does not belong to this play slot', 400);
    }
    res.json(court);
  } catch (error) {
    next(error);
  }
};

export const deleteCourt = async (
  req: Request<{ slotId: string; courtId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const slotId = parseInt(req.params.slotId);
    const courtId = parseInt(req.params.courtId);
    if (isNaN(slotId) || isNaN(courtId)) {
      throw createError('Invalid slot or court ID', 400);
    }
    const courts = await courtService.getCourtsByPlaySlotId(slotId);
    const court = courts.find((c) => c.id === courtId);
    if (!court) {
      throw createError('Court not found', 404);
    }
    const deleted = await courtService.deleteCourt(courtId);
    if (!deleted) {
      throw createError('Failed to delete court', 500);
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
