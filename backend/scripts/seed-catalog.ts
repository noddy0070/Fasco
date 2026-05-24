/**
 * seed-catalog.ts
 * ----------------
 * Seeds Brand and Category collections from frontend/mockData/products.json
 * (and optional frontend/mockData/catalog.json overrides).
 *
 * Run from project root:
 *   npx ts-node --esm backend/scripts/seed-catalog.ts
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Brand } from '../model/brand.model.ts';
import { Category } from '../model/category.model.ts';
import { level } from '../model.interfaces/customEnum.ts';
import { toSlug } from '../utils/slug.util.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env'), quiet: true } as Parameters<typeof dotenv.config>[0]);

const PRODUCTS_PATH = resolve(__dirname, '../../frontend/mockData/products.json');
const CATALOG_PATH = resolve(__dirname, '../../frontend/mockData/catalog.json');

interface RawProduct {
    brand?: string;
    category?: string;
    subCategory?: string;
}

interface CatalogJson {
    brands?: { title: string; slug?: string; description?: string }[];
    categories?: {
        name: string;
        slug?: string;
        subcategories?: { name: string; slug?: string }[];
    }[];
}

const titleCase = (slug: string): string =>
    slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

const getMongoUri = (): string => {
    if (process.env['MONGO_USER'] && process.env['MONGO_PASS']) {
        return `mongodb://${process.env['MONGO_USER']}:${process.env['MONGO_PASS']}@ac-k61j8tu-shard-00-00.ttocs5k.mongodb.net:27017,ac-k61j8tu-shard-00-01.ttocs5k.mongodb.net:27017,ac-k61j8tu-shard-00-02.ttocs5k.mongodb.net:27017/?ssl=true&replicaSet=atlas-t2n02a-shard-0&authSource=admin&appName=base`;
    }
    return process.env['MONGO_URI'] ?? 'mongodb://localhost:27017/fasco';
};

const seed = async (): Promise<void> => {
    console.log('🔌 Connecting to MongoDB…');
    await mongoose.connect(getMongoUri());
    console.log('✅ Connected');

    const brandSlugs = new Set<string>();
    const mainCategories = new Map<string, string>();
    const subPairs = new Map<string, { parentSlug: string; subSlug: string }>();

    if (existsSync(PRODUCTS_PATH)) {
        const productsFile = JSON.parse(readFileSync(PRODUCTS_PATH, 'utf-8')) as {
            products?: RawProduct[];
        };
        const products = productsFile.products ?? [];
        console.log(`📦 Scanning ${products.length} products…`);

        for (const p of products) {
            if (p.brand?.trim()) {
                brandSlugs.add(toSlug(p.brand.trim()));
            }
            if (p.category?.trim()) {
                const catSlug = toSlug(p.category.trim());
                mainCategories.set(catSlug, titleCase(catSlug));
                if (p.subCategory?.trim()) {
                    const subSlug = toSlug(p.subCategory.trim());
                    subPairs.set(`${catSlug}/${subSlug}`, { parentSlug: catSlug, subSlug });
                }
            }
        }
    }

    if (existsSync(CATALOG_PATH)) {
        const catalog = JSON.parse(readFileSync(CATALOG_PATH, 'utf-8')) as CatalogJson;
        for (const b of catalog.brands ?? []) {
            brandSlugs.add(b.slug ?? toSlug(b.title));
        }
        for (const c of catalog.categories ?? []) {
            const catSlug = c.slug ?? toSlug(c.name);
            mainCategories.set(catSlug, c.name);
            for (const sub of c.subcategories ?? []) {
                const subSlug = sub.slug ?? toSlug(sub.name);
                subPairs.set(`${catSlug}/${subSlug}`, { parentSlug: catSlug, subSlug });
            }
        }
    }

    let brandsUpserted = 0;
    for (const slug of brandSlugs) {
        await Brand.findOneAndUpdate(
            { slug },
            {
                $setOnInsert: {
                    title: titleCase(slug),
                    slug,
                    isActive: true,
                    isFeatured: false,
                },
            },
            { upsert: true },
        );
        brandsUpserted++;
    }
    console.log(`🏷️  Brands upserted: ${brandsUpserted}`);

    const mainIdBySlug = new Map<string, mongoose.Types.ObjectId>();
    let mainsUpserted = 0;

    for (const [slug, name] of mainCategories) {
        const doc = await Category.findOneAndUpdate(
            { slug, level: level.MAIN },
            {
                $set: { name },
                $setOnInsert: { slug, level: level.MAIN, parent: null },
            },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
        );
        if (doc) {
            mainIdBySlug.set(slug, doc._id as mongoose.Types.ObjectId);
            mainsUpserted++;
        }
    }
    console.log(`📁 Main categories upserted: ${mainsUpserted}`);

    let subsUpserted = 0;
    for (const { parentSlug, subSlug } of subPairs.values()) {
        const parentId = mainIdBySlug.get(parentSlug);
        if (!parentId) {
            console.warn(`  ⚠️  Skipping sub "${subSlug}" — parent "${parentSlug}" not found`);
            continue;
        }

        await Category.findOneAndUpdate(
            { slug: subSlug, level: level.SUB, parent: parentId },
            {
                $set: { name: titleCase(subSlug), parent: parentId },
                $setOnInsert: { slug: subSlug, level: level.SUB },
            },
            { upsert: true },
        );
        subsUpserted++;
    }
    console.log(`📂 Sub-categories upserted: ${subsUpserted}`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected');
    console.log('\n✅ Catalog seed complete');
};

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    mongoose.disconnect().finally(() => process.exit(1));
});
