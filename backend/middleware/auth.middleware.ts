import express from 'express';
import jwt from 'jsonwebtoken';
import { extractCookieToken } from '../utils/cookie.util.ts';

export {   };

export interface AuthUserPayload {
    userId: string;
    email?: string;
    role?: string;
}

export type AuthedRequest = express.Request & { user?: AuthUserPayload };

export const requireUser = (req: AuthedRequest, res: express.Response, next: express.NextFunction) => {
    const token = extractCookieToken(req.headers.cookie);

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: please log in' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AuthUserPayload & {
            userId?: string;
        };
        if (!decoded?.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.user = { userId: decoded.userId, email: decoded.email, role: decoded.role };
        return next();
    } catch {
        return res.status(401).json({ message: 'Unauthorized: invalid or expired session' });
    }
};

