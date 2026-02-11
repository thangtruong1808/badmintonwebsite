import type { Request, Response, NextFunction } from 'express';
import * as serviceOptionsService from '../services/serviceOptionsService.js';
import { createError } from '../middleware/errorHandler.js';

// ---- Strings ----
export const getDashboardServiceOptionsStrings = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const list = await serviceOptionsService.findAllStrings();
    res.json(list);
  } catch (error) {
    next(error);
  }
};

export const createDashboardServiceOptionsString = async (
  req: Request<{}, {}, { name: string; image_url?: string | null; display_order?: number }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, image_url, display_order } = req.body;
    if (!name || !name.trim()) throw createError('name is required', 400);
    const created = await serviceOptionsService.createString({
      name: name.trim(),
      image_url: image_url ?? null,
      display_order,
    });
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const updateDashboardServiceOptionsString = async (
  req: Request<
    { id: string },
    {},
    { name?: string; image_url?: string | null; display_order?: number }
  >,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) throw createError('Invalid string ID', 400);
    const updated = await serviceOptionsService.updateString(id, req.body);
    if (!updated) throw createError('String not found', 404);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteDashboardServiceOptionsString = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) throw createError('Invalid string ID', 400);
    const ok = await serviceOptionsService.removeString(id);
    if (!ok) throw createError('String not found', 404);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// ---- String Colours ----
export const getDashboardServiceOptionsColours = async (
  req: Request<{ stringId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stringId = parseInt(req.params.stringId, 10);
    if (Number.isNaN(stringId)) throw createError('Invalid string ID', 400);
    const list = await serviceOptionsService.findColoursByStringId(stringId);
    res.json(list);
  } catch (error) {
    next(error);
  }
};

export const createDashboardServiceOptionsColour = async (
  req: Request<
    { stringId: string },
    {},
    { colour: string; display_order?: number }
  >,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stringId = parseInt(req.params.stringId, 10);
    if (Number.isNaN(stringId)) throw createError('Invalid string ID', 400);
    const { colour, display_order } = req.body;
    if (!colour || !colour.trim()) throw createError('colour is required', 400);
    const created = await serviceOptionsService.createColour({
      string_id: stringId,
      colour: colour.trim(),
      display_order,
    });
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const updateDashboardServiceOptionsColour = async (
  req: Request<
    { colourId: string },
    {},
    { colour?: string; display_order?: number }
  >,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const colourId = parseInt(req.params.colourId, 10);
    if (Number.isNaN(colourId)) throw createError('Invalid colour ID', 400);
    const body = req.body;
    if (body.colour !== undefined && typeof body.colour === 'string' && !body.colour.trim())
      throw createError('colour cannot be empty', 400);
    const updated = await serviceOptionsService.updateColour(colourId, {
      colour: body.colour !== undefined ? String(body.colour).trim() : undefined,
      display_order: body.display_order,
    });
    if (!updated) throw createError('Colour not found', 404);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteDashboardServiceOptionsColour = async (
  req: Request<{ colourId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const colourId = parseInt(req.params.colourId, 10);
    if (Number.isNaN(colourId)) throw createError('Invalid colour ID', 400);
    const ok = await serviceOptionsService.removeColour(colourId);
    if (!ok) throw createError('Colour not found', 404);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// ---- Tensions ----
export const getDashboardServiceOptionsTensions = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const list = await serviceOptionsService.findAllTensions();
    res.json(list);
  } catch (error) {
    next(error);
  }
};

export const createDashboardServiceOptionsTension = async (
  req: Request<{}, {}, { label: string; display_order?: number }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { label, display_order } = req.body;
    if (!label || !label.trim()) throw createError('label is required', 400);
    const created = await serviceOptionsService.createTension({
      label: label.trim(),
      display_order,
    });
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const updateDashboardServiceOptionsTension = async (
  req: Request<{ id: string }, {}, { label?: string; display_order?: number }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) throw createError('Invalid tension ID', 400);
    const updated = await serviceOptionsService.updateTension(id, req.body);
    if (!updated) throw createError('Tension not found', 404);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteDashboardServiceOptionsTension = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) throw createError('Invalid tension ID', 400);
    const ok = await serviceOptionsService.removeTension(id);
    if (!ok) throw createError('Tension not found', 404);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// ---- Stencils ----
export const getDashboardServiceOptionsStencils = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const list = await serviceOptionsService.findAllStencils();
    res.json(list);
  } catch (error) {
    next(error);
  }
};

export const createDashboardServiceOptionsStencil = async (
  req: Request<{}, {}, { value?: string; label: string; display_order?: number }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { value, label, display_order } = req.body;
    if (!label || !label.trim()) throw createError('label is required', 400);
    const created = await serviceOptionsService.createStencil({
      value: value ?? '',
      label: label.trim(),
      display_order,
    });
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const updateDashboardServiceOptionsStencil = async (
  req: Request<
    { id: string },
    {},
    { value?: string; label?: string; display_order?: number }
  >,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) throw createError('Invalid stencil ID', 400);
    const updated = await serviceOptionsService.updateStencil(id, req.body);
    if (!updated) throw createError('Stencil not found', 404);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteDashboardServiceOptionsStencil = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) throw createError('Invalid stencil ID', 400);
    const ok = await serviceOptionsService.removeStencil(id);
    if (!ok) throw createError('Stencil not found', 404);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// ---- Grips ----
export const getDashboardServiceOptionsGrips = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const list = await serviceOptionsService.findAllGrips();
    res.json(list);
  } catch (error) {
    next(error);
  }
};

export const createDashboardServiceOptionsGrip = async (
  req: Request<{}, {}, { value?: string; label: string; display_order?: number }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { value, label, display_order } = req.body;
    if (!label || !label.trim()) throw createError('label is required', 400);
    const created = await serviceOptionsService.createGrip({
      value: value ?? '',
      label: label.trim(),
      display_order,
    });
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const updateDashboardServiceOptionsGrip = async (
  req: Request<
    { id: string },
    {},
    { value?: string; label?: string; display_order?: number }
  >,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) throw createError('Invalid grip ID', 400);
    const updated = await serviceOptionsService.updateGrip(id, req.body);
    if (!updated) throw createError('Grip not found', 404);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteDashboardServiceOptionsGrip = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) throw createError('Invalid grip ID', 400);
    const ok = await serviceOptionsService.removeGrip(id);
    if (!ok) throw createError('Grip not found', 404);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
