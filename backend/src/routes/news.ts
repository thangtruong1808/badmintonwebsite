import { Router, Request, Response, NextFunction } from 'express';
import * as newsService from '../services/newsService.js';

const router = Router();

/** Public: list all news articles */
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const list = await newsService.findAll();
    res.json(list);
  } catch (error) {
    next(error);
  }
});

/** Public: get one news article by id */
router.get('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: 'Invalid news ID' });
      return;
    }
    const article = await newsService.findById(id);
    if (!article) {
      res.status(404).json({ error: 'News article not found' });
      return;
    }
    res.json(article);
  } catch (error) {
    next(error);
  }
});

export default router;
