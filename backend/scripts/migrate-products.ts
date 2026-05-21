/**
 * migrate-products.ts
 * --------------------
 * One-shot migration that reads frontend/mockData/products.json and upserts
 * every product into MongoDB using the ProductI schema.
 *
 * Run from the project root:
 *   npx ts-node --esm backend/scripts/migrate-products.ts
 *
 * Or from the backend directory:
 *   npx ts-node --esm scripts/migrate-products.ts
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Product } from '../model/product.model.ts';

dotenv.config({ quiet: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend/ regardless of where the script is invoked from
dotenv.config({ path: resolve(__dirname, '../.env'), quiet: true } as Parameters<typeof dotenv.config>[0]);

// ── Resolve the products.json path relative to this script file ─────────────
const JSON_PATH = resolve(__dirname, '../../frontend/mockData/products.json');

// ── Raw shape coming out of the JSON file ─────────────────────────────────────
interface RawVariant {
    sku: string;
    size?: string;
    color?: string;
    colorCode?: string;
    price: number;
    discount?: number;
    stock?: number;
    images?: string[];
}

interface RawProduct {
    _id?: string;
    title: string;
    slug?: string;
    description?: string;
    brand?: string;
    gender?: string;
    category?: string;
    subCategory?: string;
    isActive?: boolean;
    isTrending?: boolean;
    isLimitedOffer?: boolean;
    averageRating?: number;
    totalReviews?: number;
    tags?: string[];
    specifications?: { title: string; value: string }[];
    metaTitle?: string;
    metaDescription?: string;
    variants: RawVariant[];
}

interface ProductsJson {
    products: RawProduct[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Derives a URL-safe slug from the product title when one is not provided.
 */
const toSlug = (title: string): string =>
    title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

// ── Main ─────────────────────────────────────────────────────────────────────

const migrate = async (): Promise<void> => {
    const mongoUri = process.env['MONGO_USER'] && process.env['MONGO_PASS']
        ? `mongodb://${process.env['MONGO_USER']}:${process.env['MONGO_PASS']}@ac-k61j8tu-shard-00-00.ttocs5k.mongodb.net:27017,ac-k61j8tu-shard-00-01.ttocs5k.mongodb.net:27017,ac-k61j8tu-shard-00-02.ttocs5k.mongodb.net:27017/?ssl=true&replicaSet=atlas-t2n02a-shard-0&authSource=admin&appName=base`
        : (process.env['MONGO_URI'] ?? 'mongodb://localhost:27017/fasco');

    console.log('🔌 Connecting to MongoDB…');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected');

    // Read & parse JSON
    const raw = JSON.parse(readFileSync(JSON_PATH, 'utf-8')) as ProductsJson;
    const items = raw.products ?? [];
    console.log(`📦 Found ${items.length} products in JSON`);

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const item of items) {
        const slug = item.slug ?? toSlug(item.title);

        // Map variants — category/brand are string refs in mock data so we
        // omit them from the upsert to avoid ObjectId casting failures.
        const doc = {
            title: item.title,
            slug,
            description: item.description,
            gender: item.gender,
            isActive: item.isActive ?? true,
            isTrending: item.isTrending ?? false,
            isLimitedOffer: item.isLimitedOffer ?? false,
            averageRating: item.averageRating ?? 0,
            totalReviews: item.totalReviews ?? 0,
            tags: item.tags ?? [],
            specifications: item.specifications ?? [],
            metaTitle: item.metaTitle,
            metaDescription: item.metaDescription,
            deletedAt: null,
            variants: (item.variants ?? []).map((v) => ({
                sku: v.sku,
                size: v.size,
                color: v.color,
                price: v.price,
                discount: v.discount ?? 0,
                stock: v.stock ?? 0,
                images: v.images ?? [],
            })),
        };

        try {
            const result = await Product.findOneAndUpdate(
                { slug },
                { $set: doc },
                { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
            );

            // Mongoose returns null on upsert-insert when the doc was CREATED.
            // We use $inc to detect insert vs update: if updatedExisting it was updated.
            if (result) {
                updated++;
            } else {
                inserted++;
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            console.warn(`  ⚠️  Skipped "${item.title}": ${msg}`);
            skipped++;
        }
    }

    console.log(`\n📊 Migration complete:`);
    console.log(`   Upserted : ${inserted + updated}`);
    console.log(`   Skipped  : ${skipped}`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
};

migrate().catch((err) => {
    console.error('❌ Migration failed:', err);
    mongoose.disconnect().finally(() => process.exit(1));
});
