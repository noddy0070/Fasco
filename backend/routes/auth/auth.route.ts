import express from 'express';
import { login, logout, me, signup } from '../../controller/auth/auth.controller.ts';
import { resendVerification, verifyEmail } from '../../controller/auth/verify.controller.ts';

const router = express.Router();

router.post('/signup', signup);
router.post('/login',login);
router.post('/verify/resend', resendVerification);
router.post('/google',signup)
router.post('/forgot-password',signup)
router.post('/reset-password',signup)
router.get('/me',me)
router.get('/verify/:token', verifyEmail);
router.get('/logout',logout)
router.get('/refresh',signup)

export default router;