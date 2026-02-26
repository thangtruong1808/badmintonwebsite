import { Router } from 'express';
import {
  getUserRegistrations,
  registerForEvents,
  cancelRegistration,
  getEventRegistrations,
  joinWaitlist,
  getMyPendingPayments,
  getPendingAddGuests,
  confirmPayment,
  reserveAddGuests,
  addGuestsToRegistration,
  removeGuestsFromRegistration,
  getRegistrationGuests,
  putRegistrationGuests,
  getMyAddGuestsWaitlist,
  getMyEventWaitlistStatus,
  reduceWaitlistFriends,
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

/**
 * @route   POST /api/registrations/waitlist
 * @desc    Join waitlist when event is full
 * @access  Private
 */
router.post('/waitlist', authenticateToken, joinWaitlist);

/**
 * @route   GET /api/registrations/my-pending-payments
 * @desc    Get user's pending payment registrations (reserved spots)
 * @access  Private
 */
router.get('/my-pending-payments', authenticateToken, getMyPendingPayments);

/**
 * @route   GET /api/registrations/pending-add-guests/:id
 * @desc    Get pending add-guests promotion details (for checkout flow)
 * @access  Private
 */
router.get('/pending-add-guests/:id', authenticateToken, getPendingAddGuests);

/**
 * @route   GET /api/registrations/my-add-guests-waitlist?eventId=
 * @desc    Get current user's add-guests waitlist count for an event
 * @access  Private
 */
router.get('/my-add-guests-waitlist', authenticateToken, getMyAddGuestsWaitlist);

/**
 * @route   GET /api/registrations/my-event-waitlist?eventId=
 * @desc    Check if current user is on event waitlist (new_spot type)
 * @access  Private
 */
router.get('/my-event-waitlist', authenticateToken, getMyEventWaitlistStatus);

/**
 * @route   POST /api/registrations/:id/confirm-payment
 * @desc    Confirm payment for pending_payment registration (after PayID/Stripe)
 * @access  Private
 */
router.post('/:id/confirm-payment', authenticateToken, confirmPayment);

/**
 * @route   GET /api/registrations/:id/guests
 * @desc    Get guest names for a registration (owner only)
 * @access  Private
 */
router.get('/:id/guests', authenticateToken, getRegistrationGuests);

/**
 * @route   PUT /api/registrations/:id/guests
 * @desc    Update guest names for a registration (owner only)
 * @access  Private
 */
router.put('/:id/guests', authenticateToken, putRegistrationGuests);

/**
 * @route   POST /api/registrations/:id/reserve-add-guests
 * @desc    Reserve add-guests (create pending) so spots are held until payment (partial availability flow)
 * @access  Private
 */
router.post('/:id/reserve-add-guests', authenticateToken, reserveAddGuests);

/**
 * @route   POST /api/registrations/:id/add-guests
 * @desc    Add guests to existing registration (1–10)
 * @access  Private
 */
router.post('/:id/add-guests', authenticateToken, addGuestsToRegistration);

/**
 * @route   POST /api/registrations/:id/remove-guests
 * @desc    Remove friends from existing registration (1–10)
 * @access  Private
 */
router.post('/:id/remove-guests', authenticateToken, removeGuestsFromRegistration);

/**
 * @route   POST /api/registrations/:id/reduce-waitlist-friends
 * @desc    Reduce friends from add-guests waitlist (1–10)
 * @access  Private
 */
router.post('/:id/reduce-waitlist-friends', authenticateToken, reduceWaitlistFriends);

export default router;
