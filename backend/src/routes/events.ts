import { Router } from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

/**
 * @route   GET /api/events
 * @desc    Get all events
 * @access  Public
 */
router.get('/', getAllEvents);

/**
 * @route   GET /api/events/:id
 * @desc    Get event by ID
 * @access  Public
 */
router.get('/:id', getEventById);

/**
 * @route   POST /api/events
 * @desc    Create a new event (Admin only - add admin middleware later)
 * @access  Private
 */
router.post('/', authenticateToken, createEvent);

/**
 * @route   PUT /api/events/:id
 * @desc    Update an event (Admin only)
 * @access  Private
 */
router.put('/:id', authenticateToken, updateEvent);

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete an event (Admin only)
 * @access  Private
 */
router.delete('/:id', authenticateToken, deleteEvent);

export default router;
