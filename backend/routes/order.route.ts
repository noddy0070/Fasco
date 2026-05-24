import express from 'express';
import { requireUser } from '../middleware/auth.middleware.ts';
import { getMyOrders, checkout } from '../controller/order.controller.ts';

const router = express.Router();

router.use(requireUser);
router.get('/', getMyOrders);
router.post('/checkout', checkout);

export default router;
