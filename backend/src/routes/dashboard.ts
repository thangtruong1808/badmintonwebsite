import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { testDbConnection } from '../controllers/dashboardController.js';

const router = Router();

router.get('/stats', authenticateToken, requireAdmin, getDashboardStats);
router.get('/db-test', authenticateToken, requireAdmin, testDbConnection);

export default router;
