import { Router } from 'express';
import { login, register, refresh } from '../controllers/authController.js';
import { validateLogin, validateRegister } from '../middleware/validation.js';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get access + refresh tokens
 * @access  Public
 */
router.post('/login', validateLogin, login);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user and return access + refresh tokens
 * @access  Public
 */
router.post('/register', validateRegister, register);

/**
 * @route   POST /api/auth/refresh
 * @desc    Issue new access token using refresh token
 * @access  Public
 */
router.post('/refresh', refresh);

export default router;
