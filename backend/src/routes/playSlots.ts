import { Router } from 'express';
import {
  getAllPlaySlots,
  getPlaySlotById,
  createPlaySlot,
  updatePlaySlot,
  deletePlaySlot,
} from '../controllers/playSlotsController.js';
import { getCourts, createCourt, updateCourt, deleteCourt } from '../controllers/courtsController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.get('/:slotId/courts', getCourts);
router.post('/:slotId/courts', authenticateToken, requireAdmin, createCourt);
router.put('/:slotId/courts/:courtId', authenticateToken, requireAdmin, updateCourt);
router.delete('/:slotId/courts/:courtId', authenticateToken, requireAdmin, deleteCourt);

/**
 * @route   GET /api/play-slots
 * @desc    Get all play slots (optional ?active=true for active only)
 * @access  Public
 */
router.get('/', getAllPlaySlots);

/**
 * @route   GET /api/play-slots/:id
 * @desc    Get play slot by ID
 * @access  Public
 */
router.get('/:id', getPlaySlotById);

/**
 * @route   POST /api/play-slots
 * @desc    Create a play slot (Admin only)
 * @access  Private
 */
router.post('/', authenticateToken, requireAdmin, createPlaySlot);

/**
 * @route   PUT /api/play-slots/:id
 * @desc    Update a play slot (Admin only)
 * @access  Private
 */
router.put('/:id', authenticateToken, requireAdmin, updatePlaySlot);

/**
 * @route   DELETE /api/play-slots/:id
 * @desc    Delete a play slot (Admin only)
 * @access  Private
 */
router.delete('/:id', authenticateToken, requireAdmin, deletePlaySlot);

export default router;
