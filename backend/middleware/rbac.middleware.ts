import express from 'express';
import jwt from 'jsonwebtoken';
import type { adminRole } from '../model.interfaces/customEnum.ts';

interface AdminJwtPayload {
    userId: string;
    email: string;
    role: string;
}

/**
 * Extracts the raw JWT string from the Cookie header.
 */
const extractCookieToken = (cookieHeader?: string): string | null => {
    if (!cookieHeader) return null;
    const pair = cookieHeader
        .split(';')
        .map((p) => p.trim())
        .find((p) => p.startsWith('token='));
    if (!pair) return null;
    return decodeURIComponent(pair.replace('token=', ''));
};

/**
 * Factory that returns an Express middleware enforcing that the caller
 * holds one of the supplied admin roles inside their JWT token cookie.
 */
export const requireRole = (allowedRoles: adminRole[]) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const token = extractCookieToken(req.headers.cookie);

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: no token provided' });
        }

        let decoded: AdminJwtPayload;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AdminJwtPayload;
        } catch {
            return res.status(401).json({ message: 'Unauthorized: invalid or expired token' });
        }

        if (!decoded.role || !(allowedRoles as string[]).includes(decoded.role)) {
            return res.status(403).json({ message: 'Forbidden: insufficient privileges' });
        }

        // Attach the decoded payload for downstream handlers.
        (req as express.Request & { admin: AdminJwtPayload }).admin = decoded;
        return next();
    };
};
