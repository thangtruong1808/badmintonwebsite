import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { getDashboardStats, testDbConnection } from '../controllers/dashboardController.js';
import {
  getNewsletterSubscriptions,
  createNewsletterSubscription,
  updateNewsletterSubscription,
  deleteNewsletterSubscription,
} from '../controllers/newsletterController.js';

const router = Router();

router.get('/stats', authenticateToken, requireAdmin, getDashboardStats);
router.get('/db-test', authenticateToken, requireAdmin, testDbConnection);

router.get('/newsletter', authenticateToken, requireAdmin, getNewsletterSubscriptions);
router.post('/newsletter', authenticateToken, requireAdmin, createNewsletterSubscription);
router.put('/newsletter/:id', authenticateToken, requireAdmin, updateNewsletterSubscription);
router.delete('/newsletter/:id', authenticateToken, requireAdmin, deleteNewsletterSubscription);

export default router;
