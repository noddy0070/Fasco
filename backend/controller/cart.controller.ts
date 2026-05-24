import express from 'express';
import { Cart } from '../model/cart.model.ts';
import type { AuthedRequest } from '../middleware/auth.middleware.ts';
import { resolveProduct } from '../utils/resolve-product.util.ts';
import { recalculateCartTotals } from '../utils/cart-totals.util.ts';

const populateCart = (userId: string) =>
    Cart.findOne({ user: userId }).populate({
        path: 'items.product',
        select: 'title slug variants isActive deletedAt',
    });

export const getCart = async (req: AuthedRequest, res: express.Response) => {
    try {
        let cart = await populateCart(req.user!.userId);
        if (!cart) {
            cart = await Cart.create({ user: req.user!.userId, items: [] });
        }
        return res.status(200).json({ message: 'Cart fetched successfully', data: cart });
    } catch (err) {
        console.error('getCart error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const addToCart = async (req: AuthedRequest, res: express.Response) => {
    try {
        const { productId, variantSku, quantity } = req.body as {
            productId?: string;
            variantSku?: string;
            quantity?: number;
        };

        if (!productId || !variantSku) {
            return res.status(400).json({ message: 'productId and variantSku are required' });
        }

        const product = await resolveProduct(productId);
        if (!product || product.deletedAt) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const variant = product.variants.find((v) => v.sku === variantSku);
        if (!variant) {
            return res.status(400).json({ message: 'Variant not found for this product' });
        }

        const qty = Math.max(1, Number(quantity) || 1);
        if (variant.stock < qty) {
            return res.status(400).json({ message: 'Insufficient stock for this variant' });
        }

        let cart = await Cart.findOne({ user: req.user!.userId });
        if (!cart) {
            cart = new Cart({ user: req.user!.userId, items: [] });
        }

        const existing = cart.items.find(
            (i) => i.product.toString() === product._id.toString() && i.variantSku === variantSku,
        );

        if (existing) {
            existing.quantity = Math.min(variant.stock, existing.quantity + qty);
        } else {
            cart.items.push({
                product: product._id,
                variantSku,
                quantity: qty,
                addedAt: new Date(),
            });
        }

        await recalculateCartTotals(cart);
        await cart.save();

        const populated = await populateCart(req.user!.userId);
        return res.status(200).json({ message: 'Added to cart', data: populated });
    } catch (err) {
        console.error('addToCart error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateCartItem = async (req: AuthedRequest, res: express.Response) => {
    try {
        const { productId, variantSku, quantity } = req.body as {
            productId?: string;
            variantSku?: string;
            quantity?: number;
        };

        if (!productId || !variantSku || quantity === undefined) {
            return res.status(400).json({ message: 'productId, variantSku and quantity are required' });
        }

        const cart = await Cart.findOne({ user: req.user!.userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const product = await resolveProduct(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const variant = product.variants.find((v) => v.sku === variantSku);
        if (!variant) {
            return res.status(400).json({ message: 'Variant not found' });
        }

        const item = cart.items.find(
            (i) => i.product.toString() === product._id.toString() && i.variantSku === variantSku,
        );
        if (!item) {
            return res.status(404).json({ message: 'Item not in cart' });
        }

        const qty = Number(quantity);
        if (qty <= 0) {
            cart.items = cart.items.filter(
                (i) => !(i.product.toString() === product._id.toString() && i.variantSku === variantSku),
            );
        } else {
            item.quantity = Math.min(variant.stock, qty);
        }

        await recalculateCartTotals(cart);
        await cart.save();

        const populated = await populateCart(req.user!.userId);
        return res.status(200).json({ message: 'Cart updated', data: populated });
    } catch (err) {
        console.error('updateCartItem error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const removeFromCart = async (req: AuthedRequest, res: express.Response) => {
    try {
        const { productId, variantSku } = req.body as { productId?: string; variantSku?: string };
        if (!productId || !variantSku) {
            return res.status(400).json({ message: 'productId and variantSku are required' });
        }

        const product = await resolveProduct(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const cart = await Cart.findOne({ user: req.user!.userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(
            (i) => !(i.product.toString() === product._id.toString() && i.variantSku === variantSku),
        );

        await recalculateCartTotals(cart);
        await cart.save();

        const populated = await populateCart(req.user!.userId);
        return res.status(200).json({ message: 'Item removed from cart', data: populated });
    } catch (err) {
        console.error('removeFromCart error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
