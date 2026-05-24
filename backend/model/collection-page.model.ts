import mongoose, { Schema } from 'mongoose';
import type CollectionPageI from '../model.interfaces/collection-page.interface.ts';

const tabSchema = new Schema(
    {
        label: { type: String, required: true },
        slug: { type: String, required: true },
    },
    { _id: false },
);

const promoActionSchema = new Schema(
    {
        label: { type: String, required: true },
        slug: { type: String, required: true },
    },
    { _id: false },
);

const promoSchema = new Schema(
    {
        eyebrow: { type: String, default: '' },
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        actions: { type: [promoActionSchema], default: [] },
    },
    { _id: false },
);

const collectionPageSchema = new Schema<CollectionPageI>(
    {
        slug: { type: String, required: true, unique: true, trim: true, index: true },
        eyebrow: { type: String, default: '' },
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        heroImage: { type: String, default: '' },
        tabs: { type: [tabSchema], default: [] },
        sortOptions: { type: [String], default: ['Featured'] },
        promo: { type: promoSchema, default: () => ({}) },
        productFilter: {
            type: String,
            enum: ['men', 'women', 'sale', 'featured', 'all'],
            default: 'men',
        },
        isActive: { type: Boolean, default: true, index: true },
        displayOrder: { type: Number, default: 0 },
    },
    { timestamps: true },
);

collectionPageSchema.index({ isActive: 1, displayOrder: 1 });

export const CollectionPage = mongoose.model<CollectionPageI>('CollectionPage', collectionPageSchema);
export default CollectionPage;
