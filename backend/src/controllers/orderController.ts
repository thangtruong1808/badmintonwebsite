/**
 * Order controller for dashboard CRUD operations.
 */
import type { Request, Response, NextFunction } from 'express';
import * as orderService from '../services/orderService.js';
import { createError } from '../middleware/errorHandler.js';

export const getDashboardOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const list = await orderService.findAll();
    res.json(list);
  } catch (error) {
    next(error);
  }
};

export const getDashboardOrderById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await orderService.findById(req.params.id);
    if (!order) throw createError('Order not found', 404);
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const updateDashboardOrder = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.body;
    if (!status || !['pending', 'paid', 'shipped', 'completed', 'cancelled'].includes(status)) {
      throw createError('Invalid status', 400);
    }
    const updated = await orderService.updateStatus(req.params.id, status);
    if (!updated) throw createError('Order not found', 404);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};
