import { Router } from 'express';
import { expirePendingPromotionsCron } from '../controllers/cronController.js';

const router = Router();

/**
 * @route   POST /api/cron/expire-pending-promotions
 * @desc    Expire pending_payment registrations and promote next from waitlist
 * @access  Protected by CRON_SECRET (Authorization: Bearer <secret> or X-Cron-Secret)
 */
router.post('/expire-pending-promotions', expirePendingPromotionsCron);

export default router;
