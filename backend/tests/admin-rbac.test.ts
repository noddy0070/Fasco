import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { requireRole } from '../middleware/rbac.middleware.ts';
import { adminRole } from '../model.interfaces/customEnum.ts';

// ── Helpers ──────────────────────────────────────────────────────────────────

const JWT_SECRET = 'test-secret-key';

const makeToken = (role: string) =>
    jwt.sign({ userId: 'user123', email: 'a@a.com', role }, JWT_SECRET, { expiresIn: '1h' });

const cookieHeader = (role: string) => `token=${makeToken(role)}`;

// Tiny express app wired with RBAC middleware for test isolation.
const buildApp = (allowedRoles: (typeof adminRole)[keyof typeof adminRole][]) => {
    const app = express();
    app.use(express.json());
    app.get('/protected', requireRole(allowedRoles), (_req, res) => {
        res.json({ message: 'ok' });
    });
    return app;
};

// Patch JWT_SECRET for tests (middleware reads process.env)
beforeAll(() => {
    process.env['JWT_SECRET'] = JWT_SECRET;
});

// ── RBAC middleware tests ─────────────────────────────────────────────────────

describe('requireRole middleware', () => {
    describe('when no cookie is provided', () => {
        it('returns 401', async () => {
            const app = buildApp([adminRole.SUPER_ADMIN]);
            const res = await request(app).get('/protected');
            expect(res.status).toBe(401);
            expect(res.body.message).toMatch(/no token/i);
        });
    });

    describe('when token is malformed', () => {
        it('returns 401', async () => {
            const app = buildApp([adminRole.SUPER_ADMIN]);
            const res = await request(app).get('/protected').set('Cookie', 'token=bad-token');
            expect(res.status).toBe(401);
        });
    });

    describe('when user holds an insufficient role', () => {
        it('returns 403 for inventory-management accessing user-management route', async () => {
            const app = buildApp([adminRole.SUPER_ADMIN, adminRole.USER_ADMIN]);
            const res = await request(app)
                .get('/protected')
                .set('Cookie', cookieHeader(adminRole.INVENTORY_MANAGEMENT));
            expect(res.status).toBe(403);
            expect(res.body.message).toMatch(/insufficient/i);
        });

        it('returns 403 for user-admin accessing analytics route', async () => {
            const app = buildApp([adminRole.SUPER_ADMIN]);
            const res = await request(app)
                .get('/protected')
                .set('Cookie', cookieHeader(adminRole.USER_ADMIN));
            expect(res.status).toBe(403);
        });

        it('returns 403 for plain "user" role on any admin route', async () => {
            const app = buildApp([adminRole.SUPER_ADMIN]);
            const res = await request(app)
                .get('/protected')
                .set('Cookie', cookieHeader('user'));
            expect(res.status).toBe(403);
        });
    });

    describe('when user holds a permitted role', () => {
        it('allows super-admin through', async () => {
            const app = buildApp([adminRole.SUPER_ADMIN]);
            const res = await request(app)
                .get('/protected')
                .set('Cookie', cookieHeader(adminRole.SUPER_ADMIN));
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('ok');
        });

        it('allows user-admin through user-management route', async () => {
            const app = buildApp([adminRole.SUPER_ADMIN, adminRole.USER_ADMIN]);
            const res = await request(app)
                .get('/protected')
                .set('Cookie', cookieHeader(adminRole.USER_ADMIN));
            expect(res.status).toBe(200);
        });

        it('allows inventory-management through product route', async () => {
            const app = buildApp([adminRole.SUPER_ADMIN, adminRole.INVENTORY_MANAGEMENT]);
            const res = await request(app)
                .get('/protected')
                .set('Cookie', cookieHeader(adminRole.INVENTORY_MANAGEMENT));
            expect(res.status).toBe(200);
        });
    });
});

// ── adminRole const object tests ─────────────────────────────────────────────

describe('adminRole const object', () => {
    it('contains the three expected roles', () => {
        expect(Object.values(adminRole)).toEqual(
            expect.arrayContaining(['super-admin', 'user-admin', 'inventory-management']),
        );
    });

    it('has exactly three keys', () => {
        expect(Object.keys(adminRole)).toHaveLength(3);
    });
});
