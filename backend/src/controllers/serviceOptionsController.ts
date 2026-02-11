import type { Request, Response, NextFunction } from 'express';
import * as serviceOptionsService from '../services/serviceOptionsService.js';

/**
 * GET /api/service-options
 * Public endpoint - returns all service options for the Services form (no auth required).
 */
export const getServiceOptions = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [strings, tensions, stencils, grips] = await Promise.all([
      serviceOptionsService.findAllStrings(),
      serviceOptionsService.findAllTensions(),
      serviceOptionsService.findAllStencils(),
      serviceOptionsService.findAllGrips(),
    ]);

    res.json({
      strings,
      tensions,
      stencils,
      grips,
    });
  } catch (error) {
    next(error);
  }
};
