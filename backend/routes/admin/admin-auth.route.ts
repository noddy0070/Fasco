import express from 'express';
import { adminLogin, adminLogout } from '../../controller/admin/admin-auth.controller.ts';

const router = express.Router();

router.post('/login', adminLogin);
router.get('/logout', adminLogout);

export default router;
