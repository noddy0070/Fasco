import express from 'express';
import { requireRole } from '../../middleware/rbac.middleware.ts';
import { adminRole } from '../../model.interfaces/customEnum.ts';
import {
    listOrders,
    getOrder,
    updateOrderStatus,
} from '../../controller/admin/admin-order.controller.ts';

const router = express.Router();

const superAdminOnly = [adminRole.SUPER_ADMIN];

router.get('/', requireRole(superAdminOnly), listOrders);
router.get('/:id', requireRole(superAdminOnly), getOrder);
router.patch('/:id/status', requireRole(superAdminOnly), updateOrderStatus);

export default router;
