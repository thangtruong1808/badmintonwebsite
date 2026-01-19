import { Router } from 'express';
import {
  getUserRewardPoints,
  getUserTransactions,
  getUserEventHistory,
  claimPointsForEvent,
  usePointsForBooking,
  getUnclaimedPointsCount,
} from '../controllers/rewardsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

/**
 * @route   GET /api/rewards/points
 * @desc    Get user's current reward points
 * @access  Private
 */
router.get('/points', authenticateToken, getUserRewardPoints);

/**
 * @route   GET /api/rewards/transactions
 * @desc    Get user's reward point transactions
 * @access  Private
 */
router.get('/transactions', authenticateToken, getUserTransactions);

/**
 * @route   GET /api/rewards/event-history
 * @desc    Get user's event history
 * @access  Private
 */
router.get('/event-history', authenticateToken, getUserEventHistory);

/**
 * @route   GET /api/rewards/unclaimed-count
 * @desc    Get count of unclaimed reward points
 * @access  Private
 */
router.get('/unclaimed-count', authenticateToken, getUnclaimedPointsCount);

/**
 * @route   POST /api/rewards/claim/:eventId
 * @desc    Claim reward points for an attended event
 * @access  Private
 */
router.post('/claim/:eventId', authenticateToken, claimPointsForEvent);

/**
 * @route   POST /api/rewards/use-points
 * @desc    Use reward points for booking
 * @access  Private
 */
router.post('/use-points', authenticateToken, usePointsForBooking);

export default router;
