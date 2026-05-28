import express from 'express';
import mongoose from 'mongoose';
import { Cart } from '../model/cart.model.ts';
import { Order } from '../model/orders.model.ts';
import User from '../model/user.model.ts';
import Product from '../model/product.model.ts';
import type { AuthedRequest } from '../middleware/auth.middleware.ts';
import { paymentMethod, paymentStatus, orderStatus } from '../model.interfaces/customEnum.ts';
import { resolveProduct } from '../utils/resolve-product.util.ts';

type CheckoutItemInput = {
    productId: string;
    variantSku: string;
    quantity: number;
};

type ShippingAddressInput = {
    fullName: string;
    phone: string;
    pincode: string;
    state: string;
    city: string;
    addressLine1: string;
    addressLine2?: string;
};

const buildLineItems = async (inputs: CheckoutItemInput[]) => {
    // Batch-load all products in one query instead of N individual reads.
    const identifiers = inputs.map((i) => i.productId);
    const objectIdInputs = identifiers.filter((id) => mongoose.Types.ObjectId.isValid(id));
    const slugInputs = identifiers.filter((id) => !mongoose.Types.ObjectId.isValid(id));

    const products = await Product.find({
        $or: [
            ...(objectIdInputs.length ? [{ _id: { $in: objectIdInputs } }] : []),
            ...(slugInputs.length ? [{ slug: { $in: slugInputs } }] : []),
        ],
        deletedAt: null,
    });

    const productMap = new Map(
        products.flatMap((p) => [
            [p._id.toString(), p],
            ...(p.slug ? [[p.slug, p] as [string, typeof p]] : []),
        ]),
    );

    const lines: Array<{
        product: mongoose.Types.ObjectId;
        title: string;
        slug: string;
        variantSku: string;
        size?: string;
        color?: string;
        price: number;
        discount: number;
        finalPrice: number;
        quantity: number;
        image: string[];
    }> = [];

    // Collect stock decrements for a single bulkWrite at the end.
    const stockUpdates: Array<{ productId: mongoose.Types.ObjectId; sku: string; qty: number }> = [];

    for (const input of inputs) {
        const product = productMap.get(input.productId) ?? productMap.get(input.productId.toLowerCase());
        if (!product || product.deletedAt) {
            throw new Error(`Product not found: ${input.productId}`);
        }

        const variant = product.variants.find((v) => v.sku === input.variantSku);
        if (!variant) {
            throw new Error(`Variant not found: ${input.variantSku}`);
        }

        const qty = Math.max(1, input.quantity);
        if (variant.stock < qty) {
            throw new Error(`Insufficient stock for ${product.title} (${variant.sku})`);
        }

        const finalPrice = Math.round((variant.price * (100 - (variant.discount || 0))) / 100);

        lines.push({
            product: product._id as mongoose.Types.ObjectId,
            title: product.title,
            slug: product.slug,
            variantSku: variant.sku,
            size: variant.size,
            color: variant.color,
            price: variant.price,
            discount: variant.discount || 0,
            finalPrice,
            quantity: qty,
            image: variant.images ?? [],
        });

        stockUpdates.push({ productId: product._id as mongoose.Types.ObjectId, sku: variant.sku, qty });
    }

    // Single bulkWrite to decrement all variant stocks atomically.
    if (stockUpdates.length > 0) {
        await Product.bulkWrite(
            stockUpdates.map(({ productId, sku, qty }) => ({
                updateOne: {
                    filter: { _id: productId, 'variants.sku': sku },
                    update: { $inc: { 'variants.$.stock': -qty } },
                },
            })),
        );
    }

    return lines;
};

export const getMyOrders = async (req: AuthedRequest, res: express.Response) => {
    try {
        const page = Math.max(1, parseInt(req.query['page'] as string) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query['limit'] as string) || 10));
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find({ user: req.user!.userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Order.countDocuments({ user: req.user!.userId }),
        ]);

        return res.status(200).json({ message: 'Orders fetched successfully', data: { orders, total, page, limit } });
    } catch (err) {
        console.error('getMyOrders error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const checkout = async (req: AuthedRequest, res: express.Response) => {
    try {
        const {
            paymentMethod: method,
            shippingAddress,
            items: directItems,
            useCart,
        } = req.body as {
            paymentMethod?: string;
            shippingAddress?: ShippingAddressInput;
            items?: CheckoutItemInput[];
            useCart?: boolean;
        };

        if (!method || !Object.values(paymentMethod).includes(method as (typeof paymentMethod)[keyof typeof paymentMethod])) {
            return res.status(400).json({ message: 'Valid paymentMethod is required (cod, card, upi, netbanking)' });
        }

        if (
            !shippingAddress?.fullName ||
            !shippingAddress?.phone ||
            !shippingAddress?.pincode ||
            !shippingAddress?.state ||
            !shippingAddress?.city ||
            !shippingAddress?.addressLine1
        ) {
            return res.status(400).json({ message: 'Complete shipping address is required' });
        }

        let checkoutInputs: CheckoutItemInput[] = [];

        if (directItems?.length) {
            checkoutInputs = directItems.map((i) => ({
                productId: i.productId,
                variantSku: i.variantSku,
                quantity: Math.max(1, Number(i.quantity) || 1),
            }));
        } else if (useCart === true) {
            const cart = await Cart.findOne({ user: req.user!.userId });
            if (!cart?.items.length) {
                return res.status(400).json({ message: 'Cart is empty' });
            }
            checkoutInputs = cart.items.map((i) => ({
                productId: i.product.toString(),
                variantSku: i.variantSku,
                quantity: i.quantity,
            }));
        } else {
            return res.status(400).json({ message: 'No items to checkout' });
        }

        const orderItems = await buildLineItems(checkoutInputs);

        const subtotal = orderItems.reduce((sum, i) => sum + i.finalPrice * i.quantity, 0);
        const discountAmount = orderItems.reduce(
            (sum, i) => sum + (i.price - i.finalPrice) * i.quantity,
            0,
        );
        const shippingCharges = subtotal >= 999 ? 0 : 49;
        const totalAmount = subtotal + shippingCharges;
        const totalItems = orderItems.reduce((sum, i) => sum + i.quantity, 0);

        const order = await Order.create({
            user: req.user!.userId,
            items: orderItems,
            shippingAddress,
            payment: {
                method,
                status: method === paymentMethod.COD ? paymentStatus.PENDING : paymentStatus.PENDING,
            },
            orderStatus: orderStatus.PENDING,
            totalItems,
            subtotal,
            discountAmount,
            shippingCharges,
            totalAmount,
        });

        await User.findByIdAndUpdate(req.user!.userId, {
            $push: { orders: order._id },
        });

        if (!directItems?.length) {
            await Cart.findOneAndUpdate({ user: req.user!.userId }, { $set: { items: [], totalItems: 0, totalAmount: 0 } });
        }

        return res.status(201).json({ message: 'Order placed successfully', data: order });
    } catch (err) {
        console.error('checkout error', err);
        const msg = err instanceof Error ? err.message : 'Checkout failed';
        if (msg.includes('not found') || msg.includes('stock')) {
            return res.status(400).json({ message: msg });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};
