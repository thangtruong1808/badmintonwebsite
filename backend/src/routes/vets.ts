import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { validateVetsInterest } from '../middleware/validation.js';
import {
  getActiveVetsEvents,
  submitVetsInterest,
  getAllVetsEventsAdmin,
  createVetsEventAdmin,
  updateVetsEventAdmin,
  deleteVetsEventAdmin,
  getAllVetsInterestsAdmin,
  getVetsInterestByIdAdmin,
  updateVetsInterestStatusAdmin,
  deleteVetsInterestAdmin,
} from '../controllers/vetsController.js';

const router = Router();

// ============ Public Routes ============

/**
 * @route   GET /api/vets/events
 * @desc    Get all active VETS events for public sign-up form
 * @access  Public
 */
router.get('/events', getActiveVetsEvents);

/**
 * @route   POST /api/vets/interests
 * @desc    Submit interest form for VETS events
 * @access  Public
 */
router.post('/interests', validateVetsInterest, submitVetsInterest);

// ============ Admin Routes - Events ============

/**
 * @route   GET /api/vets/admin/events
 * @desc    Get all VETS events (including inactive) for admin
 * @access  Admin
 */
router.get('/admin/events', authenticateToken, requireAdmin, getAllVetsEventsAdmin);

/**
 * @route   POST /api/vets/admin/events
 * @desc    Create a new VETS event
 * @access  Admin
 */
router.post('/admin/events', authenticateToken, requireAdmin, createVetsEventAdmin);

/**
 * @route   PUT /api/vets/admin/events/:id
 * @desc    Update a VETS event
 * @access  Admin
 */
router.put('/admin/events/:id', authenticateToken, requireAdmin, updateVetsEventAdmin);

/**
 * @route   DELETE /api/vets/admin/events/:id
 * @desc    Delete a VETS event
 * @access  Admin
 */
router.delete('/admin/events/:id', authenticateToken, requireAdmin, deleteVetsEventAdmin);

// ============ Admin Routes - Interests ============

/**
 * @route   GET /api/vets/admin/interests
 * @desc    Get all VETS interest submissions
 * @access  Admin
 */
router.get('/admin/interests', authenticateToken, requireAdmin, getAllVetsInterestsAdmin);

/**
 * @route   GET /api/vets/admin/interests/:id
 * @desc    Get a single VETS interest by ID
 * @access  Admin
 */
router.get('/admin/interests/:id', authenticateToken, requireAdmin, getVetsInterestByIdAdmin);

/**
 * @route   PUT /api/vets/admin/interests/:id
 * @desc    Update VETS interest status
 * @access  Admin
 */
router.put('/admin/interests/:id', authenticateToken, requireAdmin, updateVetsInterestStatusAdmin);

/**
 * @route   DELETE /api/vets/admin/interests/:id
 * @desc    Delete a VETS interest
 * @access  Admin
 */
router.delete('/admin/interests/:id', authenticateToken, requireAdmin, deleteVetsInterestAdmin);

export default router;
