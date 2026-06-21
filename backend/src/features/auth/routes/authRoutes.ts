import express from 'express';
import { login, logout, register, refresh, getMe, forgotPassword, resetPassword, googleLogin, updateProfile } from '../controllers/authController';
import { protect } from '../../../middlewares/authMiddleware';
import { validate } from '../../../middlewares/validateMiddleware';
import { registerSchema, loginSchema } from '../../../shared/validators/authValidator';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/google-login', googleLogin);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logout);

export default router;
