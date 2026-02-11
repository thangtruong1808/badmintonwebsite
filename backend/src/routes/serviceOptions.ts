import { Router } from 'express';
import { getServiceOptions } from '../controllers/serviceOptionsController.js';

const router = Router();

/**
 * GET /api/service-options
 * Public - returns strings, tensions, stencils, grips for Services form (no auth)
 */
router.get('/', getServiceOptions);

export default router;
