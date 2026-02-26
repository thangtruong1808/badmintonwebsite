import { Router } from 'express';
import { expirePendingPromotionsCron, processRefundsCron } from '../controllers/cronController.js';

const router = Router();

/**
 * @route   POST /api/cron/expire-pending-promotions
 * @desc    Expire pending_payment registrations and promote next from waitlist
 * @access  Protected by CRON_SECRET (Authorization: Bearer <secret> or X-Cron-Secret)
 */
router.post('/expire-pending-promotions', expirePendingPromotionsCron);

/**
 * @route   POST /api/cron/process-refunds
 * @desc    Refund cancelled registrations and waitlist entries for completed events
 * @access  Protected by CRON_SECRET
 */
router.post('/process-refunds', processRefundsCron);

export default router;
