import express from 'express';
import User from '../../model/user.model.ts';
import bcrypt from 'bcrypt';

/**
 * GET /api/admin/users
 * Returns a paginated list of all non-deleted users.
 */
export const listUsers = async (req: express.Request, res: express.Response) => {
    try {
        const page = Math.max(1, parseInt(req.query['page'] as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query['limit'] as string) || 20));
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            User.find({ deletedAt: null }).skip(skip).limit(limit).lean(),
            User.countDocuments({ deletedAt: null }),
        ]);

        return res.status(200).json({
            message: 'Users fetched successfully',
            data: { users, total, page, limit },
        });
    } catch (err) {
        console.error('listUsers error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * GET /api/admin/users/:id
 * Returns a single user by ID.
 */
export const getUser = async (req: express.Request, res: express.Response) => {
    try {
        const user = await User.findOne({ _id: req.params['id'], deletedAt: null }).lean();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ message: 'User fetched successfully', data: user });
    } catch (err) {
        console.error('getUser error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * POST /api/admin/users
 * Creates a new user (admin-initiated).
 */
export const createUser = async (req: express.Request, res: express.Response) => {
    try {
        const { firstName, lastName, email, phone, password, role } = req.body as {
            firstName?: string;
            lastName?: string;
            email?: string;
            phone?: string;
            password?: string;
            role?: string;
        };

        if (!firstName || !email || !phone || !password) {
            return res.status(400).json({ message: 'firstName, email, phone, and password are required' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            firstName,
            lastName,
            email,
            phone,
            hashedPassword,
            role: role ?? 'user',
            isVerified: true,
        });

        return res.status(201).json({ message: 'User created successfully', data: user });
    } catch (err) {
        console.error('createUser error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * PATCH /api/admin/users/:id
 * Updates mutable fields on a user record.
 */
export const updateUser = async (req: express.Request, res: express.Response) => {
    try {
        const allowed = ['firstName', 'lastName', 'phone', 'role', 'isBlocked', 'isVerified', 'gender', 'avatar'] as const;
        type AllowedKey = typeof allowed[number];

        const update: Partial<Record<AllowedKey, unknown>> = {};
        for (const key of allowed) {
            if (key in req.body) {
                update[key] = req.body[key];
            }
        }

        const user = await User.findOneAndUpdate(
            { _id: req.params['id'], deletedAt: null },
            { $set: update },
            { new: true, runValidators: true },
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ message: 'User updated successfully', data: user });
    } catch (err) {
        console.error('updateUser error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * DELETE /api/admin/users/:id
 * Soft-deletes a user by setting deletedAt.
 */
export const deleteUser = async (req: express.Request, res: express.Response) => {
    try {
        const user = await User.findOneAndUpdate(
            { _id: req.params['id'], deletedAt: null },
            { $set: { deletedAt: new Date() } },
            { new: true },
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('deleteUser error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
