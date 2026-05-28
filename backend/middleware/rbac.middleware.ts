import express from 'express';
import jwt from 'jsonwebtoken';
import type { adminRole } from '../model.interfaces/customEnum.ts';
import { extractCookieToken } from '../utils/cookie.util.ts';

interface AdminJwtPayload {
    userId: string;
    email: string;
    role: string;
}


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
