import { Router, Request, Response, NextFunction } from 'express';
import * as homepageBannersService from '../services/homepageBannersService.js';

const router = Router();

/** Public: active carousel banners only, ordered. Response shape: { id, imageUrl, altText, title } for frontend. */
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const list = await homepageBannersService.findAllActive();
    const payload = list.map((b) => ({
      id: b.id,
      imageUrl: b.image_url,
      altText: b.alt_text,
      title: b.title ?? undefined,
    }));
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

export default router;
