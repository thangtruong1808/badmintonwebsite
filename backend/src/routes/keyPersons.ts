import { Router, Request, Response, NextFunction } from 'express';
import * as keyPersonsService from '../services/keyPersonsService.js';

const router = Router();

/** Public: all key persons ordered. Response shape: { id, firstName, lastName, role, description, imageUrl } for frontend. */
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const list = await keyPersonsService.findAll();
    const payload = list.map((p) => ({
      id: p.id,
      firstName: p.first_name,
      lastName: p.last_name,
      role: p.role,
      description: p.description ?? undefined,
      imageUrl: p.image_url ?? undefined,
    }));
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

export default router;
