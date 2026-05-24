import { Document } from 'mongoose';

export type CollectionProductFilter = 'men' | 'women' | 'sale' | 'featured' | 'all';

export interface CollectionTabI {
    label: string;
    slug: string;
}

export interface CollectionPromoActionI {
    label: string;
    slug: string;
}

export interface CollectionPromoI {
    eyebrow: string;
    title: string;
    description: string;
    actions: CollectionPromoActionI[];
}

export default interface CollectionPageI extends Document {
    slug: string;
    eyebrow: string;
    title: string;
    description: string;
    heroImage: string;
    tabs: CollectionTabI[];
    sortOptions: string[];
    promo: CollectionPromoI;
    productFilter: CollectionProductFilter;
    isActive: boolean;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
}
