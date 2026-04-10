import express from 'express';
import { login, signup } from '../../controller/auth/auth.controller.ts';
import { verifyEmail } from '../../controller/auth/verify.controller.ts';

const router = express.Router();

router.post('/signup', signup);
router.post('/login',login);
router.post('/google',signup)
router.post('/forgot-password',signup)
router.post('/reset-password',signup)
router.get('/me',signup)
router.get('/verify/:token', verifyEmail);
router.get('/logout',signup)
router.get('/refresh',signup)

export default router;