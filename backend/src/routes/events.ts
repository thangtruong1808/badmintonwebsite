import { Router } from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  generateEvents,
  getEventRegistrationsPublic,
  getEventWaitlistPublic,
} from '../controllers/eventsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

/**
 * @route   GET /api/events
 * @desc    Get all events (optional ?from=DATE&to=DATE to generate from play_slots)
 * @access  Public
 */
router.get('/', getAllEvents);

/**
 * @route   GET /api/events/generate
 * @desc    Generate events from play_slots for date range (?from=YYYY-MM-DD&to=YYYY-MM-DD)
 * @access  Public
 */
router.get('/generate', generateEvents);

/**
 * @route   GET /api/events/:id/registrations
 * @desc    Get registered players for event (public, no auth)
 * @access  Public
 */
router.get('/:id/registrations', getEventRegistrationsPublic);

/**
 * @route   GET /api/events/:id/waitlist
 * @desc    Get waitlist entries for event (public)
 * @access  Public
 */
router.get('/:id/waitlist', getEventWaitlistPublic);

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
