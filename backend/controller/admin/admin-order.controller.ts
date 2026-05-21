import express from 'express';
import Order from '../../model/orders.model.ts';
import { orderStatus } from '../../model.interfaces/customEnum.ts';

/**
 * GET /api/admin/orders
 * Returns a paginated list of all orders, optionally filtered by status.
 */
export const listOrders = async (req: express.Request, res: express.Response) => {
    try {
        const page = Math.max(1, parseInt(req.query['page'] as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query['limit'] as string) || 20));
        const skip = (page - 1) * limit;
        const status = req.query['status'] as string | undefined;

        const filter: Record<string, unknown> = {};
        if (status && Object.values(orderStatus).includes(status as typeof orderStatus[keyof typeof orderStatus])) {
            filter['orderStatus'] = status;
        }

        const [orders, total] = await Promise.all([
            Order.find(filter)
                .populate('user', 'firstName lastName email')
                .skip(skip)
                .limit(limit)
                .lean(),
            Order.countDocuments(filter),
        ]);

        return res.status(200).json({
            message: 'Orders fetched successfully',
            data: { orders, total, page, limit },
        });
    } catch (err) {
        console.error('listOrders error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * GET /api/admin/orders/:id
 * Returns a single order by ID with full population.
 */
export const getOrder = async (req: express.Request, res: express.Response) => {
    try {
        const order = await Order.findById(req.params['id'])
            .populate('user', 'firstName lastName email phone')
            .lean();

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        return res.status(200).json({ message: 'Order fetched successfully', data: order });
    } catch (err) {
        console.error('getOrder error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * PATCH /api/admin/orders/:id/status
 * Updates the order status and optionally the tracking ID.
 */
export const updateOrderStatus = async (req: express.Request, res: express.Response) => {
    try {
        const { status, trackingId } = req.body as { status?: string; trackingId?: string };

        if (!status) {
            return res.status(400).json({ message: 'status is required' });
        }

        if (!Object.values(orderStatus).includes(status as typeof orderStatus[keyof typeof orderStatus])) {
            return res.status(400).json({ message: 'Invalid order status value' });
        }

        const update: Record<string, unknown> = { orderStatus: status };
        if (trackingId) {
            update['trackingId'] = trackingId;
        }

        const order = await Order.findByIdAndUpdate(
            req.params['id'],
            { $set: update },
            { new: true },
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        return res.status(200).json({ message: 'Order status updated successfully', data: order });
    } catch (err) {
        console.error('updateOrderStatus error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
