import express from 'express';
import { Brand } from '../../model/brand.model.ts';
import { toSlug } from '../../utils/slug.util.ts';

export const listBrands = async (_req: express.Request, res: express.Response) => {
    try {
        const brands = await Brand.find().sort({ title: 1 }).lean();
        return res.status(200).json({ message: 'Brands fetched successfully', data: brands });
    } catch (err) {
        console.error('listBrands error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const createBrand = async (req: express.Request, res: express.Response) => {
    try {
        const { title, slug, description, logo, isActive, isFeatured } = req.body as {
            title?: string;
            slug?: string;
            description?: string;
            logo?: string;
            isActive?: boolean;
            isFeatured?: boolean;
        };

        if (!title?.trim()) {
            return res.status(400).json({ message: 'title is required' });
        }

        const brand = await Brand.create({
            title: title.trim(),
            slug: slug?.trim() || toSlug(title),
            description,
            logo,
            isActive: isActive ?? true,
            isFeatured: isFeatured ?? false,
        });

        return res.status(201).json({ message: 'Brand created successfully', data: brand });
    } catch (err) {
        console.error('createBrand error', err);
        const e = err as { code?: number };
        if (e.code === 11000) {
            return res.status(409).json({ message: 'A brand with this slug already exists' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateBrand = async (req: express.Request, res: express.Response) => {
    try {
        const { title, slug, description, logo, isActive, isFeatured } = req.body as Record<string, unknown>;
        const update: Record<string, unknown> = {};

        if (title !== undefined) update['title'] = String(title).trim();
        if (slug !== undefined) update['slug'] = String(slug).trim();
        if (description !== undefined) update['description'] = description;
        if (logo !== undefined) update['logo'] = logo;
        if (isActive !== undefined) update['isActive'] = isActive;
        if (isFeatured !== undefined) update['isFeatured'] = isFeatured;

        const brand = await Brand.findByIdAndUpdate(req.params['id'], { $set: update }, {
            new: true,
            runValidators: true,
        });

        if (!brand) {
            return res.status(404).json({ message: 'Brand not found' });
        }

        return res.status(200).json({ message: 'Brand updated successfully', data: brand });
    } catch (err) {
        console.error('updateBrand error', err);
        const e = err as { code?: number };
        if (e.code === 11000) {
            return res.status(409).json({ message: 'A brand with this slug already exists' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteBrand = async (req: express.Request, res: express.Response) => {
    try {
        const brand = await Brand.findByIdAndDelete(req.params['id']);
        if (!brand) {
            return res.status(404).json({ message: 'Brand not found' });
        }
        return res.status(200).json({ message: 'Brand deleted successfully' });
    } catch (err) {
        console.error('deleteBrand error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
