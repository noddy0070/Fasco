import express from 'express';
import Order from '../../model/orders.model.ts';
import User from '../../model/user.model.ts';
import Product from '../../model/product.model.ts';

/**
 * GET /api/admin/analytics/overview
 * Returns aggregated KPIs: total revenue, orders, users, products.
 */
export const getOverview = async (_req: express.Request, res: express.Response) => {
    try {
        const [
            totalUsers,
            totalProducts,
            totalOrders,
            revenueResult,
        ] = await Promise.all([
            User.countDocuments({ deletedAt: null }),
            Product.countDocuments({ deletedAt: null }),
            Order.countDocuments({}),
            Order.aggregate([
                { $match: { 'payment.status': 'paid' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } },
            ]),
        ]);

        const totalRevenue: number = revenueResult[0]?.total ?? 0;

        return res.status(200).json({
            message: 'Overview fetched successfully',
            data: { totalUsers, totalProducts, totalOrders, totalRevenue },
        });
    } catch (err) {
        console.error('getOverview error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * GET /api/admin/analytics/revenue
 * Returns daily revenue aggregated over the last 30 days.
 */
export const getRevenueChart = async (_req: express.Request, res: express.Response) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const data = await Order.aggregate([
            {
                $match: {
                    'payment.status': 'paid',
                    createdAt: { $gte: thirtyDaysAgo },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: '$_id', revenue: 1, orders: 1 } },
        ]);

        return res.status(200).json({ message: 'Revenue chart data fetched', data });
    } catch (err) {
        console.error('getRevenueChart error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * GET /api/admin/analytics/order-status-breakdown
 * Returns order counts grouped by status.
 */
export const getOrderStatusBreakdown = async (_req: express.Request, res: express.Response) => {
    try {
        const data = await Order.aggregate([
            { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
            { $project: { _id: 0, status: '$_id', count: 1 } },
            { $sort: { count: -1 } },
        ]);

        return res.status(200).json({ message: 'Order status breakdown fetched', data });
    } catch (err) {
        console.error('getOrderStatusBreakdown error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * GET /api/admin/analytics/top-products
 * Returns the top 10 best-selling products by quantity sold.
 */
export const getTopProducts = async (_req: express.Request, res: express.Response) => {
    try {
        const data = await Order.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    title: { $first: '$items.title' },
                    totalSold: { $sum: '$items.quantity' },
                    revenue: { $sum: { $multiply: ['$items.finalPrice', '$items.quantity'] } },
                },
            },
            { $sort: { totalSold: -1 } },
            { $limit: 10 },
            { $project: { _id: 0, productId: '$_id', title: 1, totalSold: 1, revenue: 1 } },
        ]);

        return res.status(200).json({ message: 'Top products fetched', data });
    } catch (err) {
        console.error('getTopProducts error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
