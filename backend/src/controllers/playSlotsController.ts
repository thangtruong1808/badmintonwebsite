import { Request, Response, NextFunction } from 'express';
import {
  getAllPlaySlots as getAllPlaySlotsService,
  getPlaySlotById as getPlaySlotByIdService,
  createPlaySlot as createPlaySlotService,
  updatePlaySlot as updatePlaySlotService,
  deletePlaySlot as deletePlaySlotService,
} from '../services/playSlotService.js';
import { createError } from '../middleware/errorHandler.js';
import type { PlaySlot } from '../services/playSlotService.js';

export const getAllPlaySlots = async (
  req: Request<{}, {}, {}, { active?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const activeOnly = req.query.active === 'true';
    const slots = await getAllPlaySlotsService(activeOnly);
    res.json(slots);
  } catch (error) {
    next(error);
  }
};

export const getPlaySlotById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw createError('Invalid play slot ID', 400);
    const slot = await getPlaySlotByIdService(id);
    if (!slot) throw createError('Play slot not found', 404);
    res.json(slot);
  } catch (error) {
    next(error);
  }
};

export const createPlaySlot = async (
  req: Request<{}, {}, Omit<PlaySlot, 'id'>>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const slot = await createPlaySlotService(req.body);
    res.status(201).json(slot);
  } catch (error) {
    next(error);
  }
};

export const updatePlaySlot = async (
  req: Request<{ id: string }, {}, Partial<Omit<PlaySlot, 'id'>>>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw createError('Invalid play slot ID', 400);
    const slot = await updatePlaySlotService(id, req.body);
    if (!slot) throw createError('Play slot not found', 404);
    res.json(slot);
  } catch (error) {
    next(error);
  }
};

export const deletePlaySlot = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw createError('Invalid play slot ID', 400);
    const success = await deletePlaySlotService(id);
    if (!success) throw createError('Play slot not found', 404);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
