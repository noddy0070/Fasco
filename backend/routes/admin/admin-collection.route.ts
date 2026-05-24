import express from 'express';
import { requireRole } from '../../middleware/rbac.middleware.ts';
import { adminRole } from '../../model.interfaces/customEnum.ts';
import {
    listAdminCollections,
    getAdminCollection,
    createCollection,
    updateCollection,
    deleteCollection,
} from '../../controller/admin/admin-collection.controller.ts';

const router = express.Router();
const roles = [adminRole.SUPER_ADMIN, adminRole.INVENTORY_MANAGEMENT];

router.get('/', requireRole(roles), listAdminCollections);
router.get('/:id', requireRole(roles), getAdminCollection);
router.post('/', requireRole(roles), createCollection);
router.patch('/:id', requireRole(roles), updateCollection);
router.delete('/:id', requireRole(roles), deleteCollection);

export default router;
