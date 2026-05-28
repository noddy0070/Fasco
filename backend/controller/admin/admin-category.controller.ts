import express from 'express';
import { Category } from '../../model/category.model.ts';
import { level } from '../../model.interfaces/customEnum.ts';
import { toSlug } from '../../utils/slug.util.ts';

const LEVELS = Object.values(level);

export const listCategories = async (req: express.Request, res: express.Response) => {
    try {
        const filter: Record<string, unknown> = {};

        const levelParam = req.query['level'] as string | undefined;
        if (levelParam) {
            if (!LEVELS.includes(levelParam as (typeof LEVELS)[number])) {
                return res.status(400).json({ message: `level must be one of: ${LEVELS.join(', ')}` });
            }
            filter['level'] = levelParam;
        }

        const parentId = req.query['parent'] as string | undefined;
        if (parentId) {
            filter['parent'] = parentId;
        }

        const categories = await Category.find(filter)
            .populate('parent', 'name slug')
            .sort({ name: 1 })
            .lean();

        return res.status(200).json({ message: 'Categories fetched successfully', data: categories });
    } catch (err) {
        console.error('listCategories error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const createCategory = async (req: express.Request, res: express.Response) => {
    try {
        const { name, slug, level: levelValue, parent } = req.body as {
            name?: string;
            slug?: string;
            level?: string;
            parent?: string | null;
        };

        if (!name?.trim()) {
            return res.status(400).json({ message: 'name is required' });
        }
        if (!levelValue || !LEVELS.includes(levelValue as (typeof LEVELS)[number])) {
            return res.status(400).json({ message: `level is required (${LEVELS.join(', ')})` });
        }

        if (levelValue === level.SUB && !parent) {
            return res.status(400).json({ message: 'parent is required for sub categories' });
        }

        if (levelValue === level.MAIN && parent) {
            return res.status(400).json({ message: 'main categories cannot have a parent' });
        }

        const category = await Category.create({
            name: name.trim(),
            slug: slug?.trim() || toSlug(name),
            level: levelValue,
            parent: levelValue === level.SUB ? (parent ?? undefined) : undefined,
        });

        return res.status(201).json({ message: 'Category created successfully', data: category });
    } catch (err) {
        console.error('createCategory error', err);
        const e = err as { code?: number };
        if (e.code === 11000) {
            return res.status(409).json({ message: 'A category with this slug already exists' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateCategory = async (req: express.Request, res: express.Response) => {
    try {
        const { name, slug, parent } = req.body as {
            name?: string;
            slug?: string;
            parent?: string | null;
        };

        const existing = await Category.findById(req.params['id']);
        if (!existing) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const update: Record<string, unknown> = {};
        if (name !== undefined) update['name'] = String(name).trim();
        if (slug !== undefined) update['slug'] = String(slug).trim();
        if (parent !== undefined && existing.level === level.SUB) {
            update['parent'] = parent;
        }

        const category = await Category.findByIdAndUpdate(req.params['id'], { $set: update }, {
            new: true,
            runValidators: true,
        }).populate('parent', 'name slug');

        return res.status(200).json({ message: 'Category updated successfully', data: category });
    } catch (err) {
        console.error('updateCategory error', err);
        const e = err as { code?: number };
        if (e.code === 11000) {
            return res.status(409).json({ message: 'A category with this slug already exists' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteCategory = async (req: express.Request, res: express.Response) => {
    try {
        const category = await Category.findById(req.params['id']);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        if (category.level === level.MAIN) {
            const childCount = await Category.countDocuments({ parent: category._id as unknown as string });
            if (childCount > 0) {
                return res.status(400).json({
                    message: 'Cannot delete category with sub-categories. Remove sub-categories first.',
                });
            }
        }

        await category.deleteOne();
        return res.status(200).json({ message: 'Category deleted successfully' });
    } catch (err) {
        console.error('deleteCategory error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
