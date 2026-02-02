import { Router } from 'express';
import { subscribe as subscribeHandler } from '../controllers/newsletterController.js';
import { validateNewsletterSubscribe } from '../middleware/validation.js';

const router = Router();

router.post('/subscribe', validateNewsletterSubscribe, subscribeHandler);

export default router;
