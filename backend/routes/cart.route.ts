import express from 'express';
import { requireUser } from '../middleware/auth.middleware.ts';
import { getCart, addToCart, updateCartItem, removeFromCart } from '../controller/cart.controller.ts';

const router = express.Router();

router.use(requireUser);
router.get('/', getCart);
router.post('/items', addToCart);
router.patch('/items', updateCartItem);
router.delete('/items', removeFromCart);

export default router;
