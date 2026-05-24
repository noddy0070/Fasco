/**
 * seed-collections.ts
 * Seeds CollectionPage documents from frontend/mockData/collections.json
 *
 * Run: npx ts-node --esm backend/scripts/seed-collections.ts
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import { CollectionPage } from '../model/collection-page.model.ts';
import { inferProductFilter } from '../utils/slug.util.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env'), quiet: true } as Parameters<typeof dotenv.config>[0]);

const JSON_PATH = resolve(__dirname, '../../frontend/mockData/collections.json');

type RawCollection = {
    slug: string;
    eyebrow?: string;
    title: string;
    description?: string;
    heroImage?: string;
    tabs?: { label: string; slug: string }[];
    sortOptions?: string[];
    promo?: {
        eyebrow?: string;
        title?: string;
        description?: string;
        actions?: { label: string; slug: string }[];
    };
};

const getMongoUri = (): string => {
    if (process.env['MONGO_USER'] && process.env['MONGO_PASS']) {
        return `mongodb://${process.env['MONGO_USER']}:${process.env['MONGO_PASS']}@ac-k61j8tu-shard-00-00.ttocs5k.mongodb.net:27017,ac-k61j8tu-shard-00-01.ttocs5k.mongodb.net:27017,ac-k61j8tu-shard-00-02.ttocs5k.mongodb.net:27017/?ssl=true&replicaSet=atlas-t2n02a-shard-0&authSource=admin&appName=base`;
    }
    return process.env['MONGO_URI'] ?? 'mongodb://localhost:27017/fasco';
};

const seed = async (): Promise<void> => {
    const raw = JSON.parse(readFileSync(JSON_PATH, 'utf-8')) as { collections?: RawCollection[] };
    const items = raw.collections ?? [];

    console.log('🔌 Connecting to MongoDB…');
    await mongoose.connect(getMongoUri());
    console.log(`📦 Seeding ${items.length} collections…`);

    let order = 0;
    for (const item of items) {
        await CollectionPage.findOneAndUpdate(
            { slug: item.slug },
            {
                $set: {
                    eyebrow: item.eyebrow ?? '',
                    title: item.title,
                    description: item.description ?? '',
                    heroImage: item.heroImage ?? '',
                    tabs: item.tabs ?? [],
                    sortOptions: item.sortOptions ?? ['Featured'],
                    promo: {
                        eyebrow: item.promo?.eyebrow ?? '',
                        title: item.promo?.title ?? '',
                        description: item.promo?.description ?? '',
                        actions: item.promo?.actions ?? [],
                    },
                    productFilter: inferProductFilter(item.slug),
                    isActive: true,
                    displayOrder: order++,
                },
                $setOnInsert: { slug: item.slug },
            },
            { upsert: true },
        );
        console.log(`  ✓ ${item.slug}`);
    }

    await mongoose.disconnect();
    console.log('✅ Collections seed complete');
};

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    mongoose.disconnect().finally(() => process.exit(1));
});
