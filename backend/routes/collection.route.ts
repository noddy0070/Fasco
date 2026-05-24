import express from 'express';
import { listCollections, getCollectionBySlug } from '../controller/collection.controller.ts';

const router = express.Router();

router.get('/', listCollections);
router.get('/:slug', getCollectionBySlug);

export default router;
