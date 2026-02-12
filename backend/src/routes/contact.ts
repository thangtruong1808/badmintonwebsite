import { Router } from 'express';
import { submitContactMessage } from '../controllers/contactController.js';
import { validateContactForm } from '../middleware/validation.js';

const router = Router();

router.post('/', validateContactForm, submitContactMessage);

export default router;
