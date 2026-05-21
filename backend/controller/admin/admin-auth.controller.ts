import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../../model/user.model.ts';
import { adminRole } from '../../model.interfaces/customEnum.ts';

/**
 * POST /api/admin/auth/login
 * Authenticates an admin user and sets an HTTP-only JWT cookie
 * that includes the user's role for RBAC enforcement.
 */
export const adminLogin = async (req: express.Request, res: express.Response) => {
    try {
        const { email, password } = req.body as { email?: string; password?: string };

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const adminRoleValues = Object.values(adminRole) as string[];

        const user = await User.findOne({ email, role: { $in: adminRoleValues } }).select('+hashedPassword');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials or insufficient privileges' });
        }

        if (!user.hashedPassword) {
            return res.status(400).json({ message: 'Invalid account data' });
        }

        const isMatch = await bcrypt.compare(password, user.hashedPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials or insufficient privileges' });
        }

        if (user.isBlocked) {
            return res.status(403).json({ message: 'Account is blocked' });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '8h' },
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 8 * 60 * 60 * 1000,
        });

        const { hashedPassword: _hp, ...safeUser } = user.toObject();

        return res.status(200).json({ message: 'Admin login successful', data: safeUser });
    } catch (err) {
        console.error('adminLogin error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * GET /api/admin/auth/logout
 * Clears the auth cookie.
 */
export const adminLogout = (_req: express.Request, res: express.Response) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    return res.status(200).json({ message: 'Logged out successfully' });
};
