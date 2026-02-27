/**
 * Payment routes for Stripe checkout and payment management.
 */
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import {
  createPlayCheckout,
  createAddGuestsCheckout,
  createWaitlistCheckout,
  createShopCheckout,
  getAllPayments,
  getPaymentById,
  updatePaymentStatus,
  deletePaymentRecord,
} from '../controllers/paymentController.js';

const router = Router();

// Create checkout sessions (authenticated users)
router.post('/create-play-checkout', authenticateToken, createPlayCheckout);
router.post('/create-add-guests-checkout', authenticateToken, createAddGuestsCheckout);
router.post('/create-waitlist-checkout', authenticateToken, createWaitlistCheckout);
router.post('/create-shop-checkout', authenticateToken, createShopCheckout);

// Admin payment management
router.get('/', authenticateToken, requireAdmin, getAllPayments);
router.get('/:id', authenticateToken, requireAdmin, getPaymentById);
router.put('/:id/status', authenticateToken, requireAdmin, updatePaymentStatus);
router.delete('/:id', authenticateToken, requireAdmin, deletePaymentRecord);

export default router;
