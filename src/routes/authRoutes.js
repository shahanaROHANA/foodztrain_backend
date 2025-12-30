
// export default router;
import express from 'express';
import passport from 'passport';

// authRoutes.js
import { register, login, forgetPassword, resetPassword, verifyToken } from '../controllers/authController.js';



import { 
  authLimiter, 
  passwordResetLimiter 
} from '../middleware/rateLimitMiddleware.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Auth routes
router.post('/register', authLimiter, register);
router.post('/login', login);
router.post('/forget-password', passwordResetLimiter, forgetPassword);
router.post('/reset-password', authLimiter, resetPassword);

// Token verification route
router.get('/verify', protect, verifyToken);



export default router;