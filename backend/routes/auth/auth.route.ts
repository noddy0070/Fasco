import express from 'express';
import { login, signup,me,logout,refresh,forgotPassword,resetPassword } from '../../controller/auth/auth.controller.ts';
import { verifyEmail } from '../../controller/auth/verify.controller.ts';

const router = express.Router();

router.post('/signup', signup);
router.post('/login',login);
router.post('/google',signup)
router.post('/forgot-password',forgotPassword)
router.post('/reset-password',resetPassword)
router.get('/me',me)
router.get('/verify/:token', verifyEmail);
router.get('/logout',logout)
router.get('/refresh',refresh)

export default router;