import { Router, Request, Response, NextFunction } from 'express';
import * as galleryService from '../services/galleryService.js';

const router = Router();

/** Public: list all gallery photos */
router.get('/photos', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const list = await galleryService.findAllPhotos();
    res.json(list);
  } catch (error) {
    next(error);
  }
});

/** Public: list all gallery videos */
router.get('/videos', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const list = await galleryService.findAllVideos();
    res.json(list);
  } catch (error) {
    next(error);
  }
});

export default router;
