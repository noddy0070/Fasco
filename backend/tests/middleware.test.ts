/**
 * Tests for api.middleware and auth.middleware (requireUser).
 * Uses jest.unstable_mockModule for pino logger.
 */
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { jest, describe, it, expect, beforeAll } from '@jest/globals';

jest.unstable_mockModule('../utils/logger', () => ({
    default: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

const { default: apiMiddleWare } = await import('../middleware/api.middleware');
const { requireUser } = await import('../middleware/auth.middleware');

const JWT_SECRET = 'test-secret';

beforeAll(() => {
    process.env['JWT_SECRET'] = JWT_SECRET;
});

// ── apiMiddleWare ─────────────────────────────────────────────────────────────
describe('apiMiddleWare', () => {
    it('passes the request through to the next handler', async () => {
        const app = express();
        app.use(apiMiddleWare);
        app.get('/ping', (_req, res) => res.json({ ok: true }));

        const res = await request(app).get('/ping');
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
    });
});

// ── requireUser ───────────────────────────────────────────────────────────────
describe('requireUser', () => {
    const buildApp = () => {
        const app = express();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        app.get('/protected', requireUser as any, (req: any, res: any) => {
            res.json({ userId: req.user?.userId });
        });
        return app;
    };

    it('returns 401 when no cookie is present', async () => {
        const res = await request(buildApp()).get('/protected');
        expect(res.status).toBe(401);
    });

    it('returns 401 when the token is invalid', async () => {
        const res = await request(buildApp())
            .get('/protected')
            .set('Cookie', 'token=bad.token.value');
        expect(res.status).toBe(401);
    });

    it('returns 401 when the token payload has no userId', async () => {
        const token = jwt.sign({ email: 'nobody@a.com' }, JWT_SECRET, { expiresIn: '1h' });
        const res = await request(buildApp())
            .get('/protected')
            .set('Cookie', `token=${token}`);
        expect(res.status).toBe(401);
    });

    it('calls next() and attaches req.user when token is valid', async () => {
        const token = jwt.sign({ userId: 'u123', email: 'a@b.com', role: 'user' }, JWT_SECRET, {
            expiresIn: '1h',
        });
        const res = await request(buildApp())
            .get('/protected')
            .set('Cookie', `token=${token}`);
        expect(res.status).toBe(200);
        expect(res.body.userId).toBe('u123');
    });
});
