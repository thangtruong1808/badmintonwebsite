import { Router } from 'express';
import {
  getCurrentUser,
  updateUserProfile,
  getUserById,
} from '../controllers/usersController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticateToken, getCurrentUser);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (Admin only - add admin middleware later)
 * @access  Private
 */
router.get('/:id', authenticateToken, getUserById);

/**
 * @route   PUT /api/users/me
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/me', authenticateToken, updateUserProfile);

export default router;
