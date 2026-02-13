import { Router } from 'express';
import { submitServiceRequest } from '../controllers/serviceRequestController.js';
import { validateServiceRequest } from '../middleware/validation.js';

const router = Router();

router.post('/', validateServiceRequest, submitServiceRequest);

export default router;
