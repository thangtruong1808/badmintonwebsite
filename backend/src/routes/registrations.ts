import { Router } from 'express';
import {
  getUserRegistrations,
  registerForEvents,
  cancelRegistration,
  getEventRegistrations,
} from '../controllers/registrationsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

/**
 * @route   GET /api/registrations/my-registrations
 * @desc    Get current user's registrations
 * @access  Private
 */
router.get('/my-registrations', authenticateToken, getUserRegistrations);

/**
 * @route   GET /api/registrations/event/:eventId
 * @desc    Get all registrations for an event (Admin only)
 * @access  Private
 */
router.get('/event/:eventId', authenticateToken, getEventRegistrations);

/**
 * @route   POST /api/registrations
 * @desc    Register user for events
 * @access  Private
 */
router.post('/', authenticateToken, registerForEvents);

/**
 * @route   DELETE /api/registrations/:registrationId
 * @desc    Cancel a registration
 * @access  Private
 */
router.delete('/:registrationId', authenticateToken, cancelRegistration);

export default router;
