const express = require('express');
const router = express.Router();
const { z } = require('zod');
const validateRequest = require('../middleware/validate');
const { verifyAuthContext } = require('../middleware/roleCheck');

const {
  registerUser,
  loginUser,
  getCurrentUser
} = require('../controllers/authController');

// Schemas
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(['buyer', 'artisan', 'admin']).optional()
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(['buyer', 'artisan', 'admin']).optional()
});

// @route   POST /api/auth/register
router.post('/register', validateRequest(registerSchema), registerUser);

// @route   POST /api/auth/login
router.post('/login', validateRequest(loginSchema), loginUser);

// @route   GET /api/auth/me
router.get('/me', verifyAuthContext, getCurrentUser);

module.exports = router;

