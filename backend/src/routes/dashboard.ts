import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { getDashboardStats } from '../controllers/dashboardController.js';

const router = Router();

router.get('/stats', authenticateToken, requireAdmin, getDashboardStats);

export default router;
