import { Router, Request, Response } from 'express';
import { login, register } from '../controllers/authController.js';
import { validateLogin, validateRegister } from '../middleware/validation.js';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post('/login', validateLogin, login);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateRegister, register);

export default router;
