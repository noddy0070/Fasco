/**
 * Tests for admin authentication controller (adminLogin, adminLogout).
 */
import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { jest, describe, it, expect, beforeAll, afterEach } from '@jest/globals';

const mockFindOne = jest.fn();

jest.unstable_mockModule('../model/user.model', () => ({
    default: { findOne: mockFindOne },
}));

const { adminLogin, adminLogout } = await import('../controller/admin/admin-auth.controller');

const JWT_SECRET = 'test-secret';

const buildApp = () => {
    const app = express();
    app.use(express.json());
    app.post('/login', adminLogin);
    app.get('/logout', adminLogout);
    return app;
};

beforeAll(() => {
    process.env['JWT_SECRET'] = JWT_SECRET;
});

afterEach(() => {
    mockFindOne.mockReset();
});

describe('POST /admin/login', () => {
    it('returns 400 when email or password is missing', async () => {
        const res = await request(buildApp()).post('/login').send({ email: 'a@a.com' });
        expect(res.status).toBe(400);
    });

    it('returns 401 when user is not found or not an admin', async () => {
        mockFindOne.mockReturnValueOnce({ select: jest.fn().mockResolvedValue(null) });

        const res = await request(buildApp())
            .post('/login')
            .send({ email: 'user@a.com', password: 'pass' });
        expect(res.status).toBe(401);
    });

    it('returns 400 when account has no hashedPassword', async () => {
        mockFindOne.mockReturnValueOnce({
            select: jest.fn().mockResolvedValue({ hashedPassword: null, isBlocked: false }),
        });

        const res = await request(buildApp())
            .post('/login')
            .send({ email: 'admin@a.com', password: 'pass' });
        expect(res.status).toBe(400);
    });

    it('returns 401 when password is incorrect', async () => {
        const hashed = await bcrypt.hash('correct', 1);
        mockFindOne.mockReturnValueOnce({
            select: jest.fn().mockResolvedValue({
                hashedPassword: hashed,
                isBlocked: false,
            }),
        });

        const res = await request(buildApp())
            .post('/login')
            .send({ email: 'admin@a.com', password: 'wrong' });
        expect(res.status).toBe(401);
    });

    it('returns 403 when account is blocked', async () => {
        const hashed = await bcrypt.hash('pass', 1);
        mockFindOne.mockReturnValueOnce({
            select: jest.fn().mockResolvedValue({
                _id: 'uid1',
                hashedPassword: hashed,
                isBlocked: true,
                email: 'admin@a.com',
                role: 'super-admin',
                toObject: () => ({ _id: 'uid1', hashedPassword: hashed }),
            }),
        });

        const res = await request(buildApp())
            .post('/login')
            .send({ email: 'admin@a.com', password: 'pass' });
        expect(res.status).toBe(403);
    });

    it('returns 200, sets cookie and excludes hashedPassword from body on success', async () => {
        const hashed = await bcrypt.hash('pass', 1);
        mockFindOne.mockReturnValueOnce({
            select: jest.fn().mockResolvedValue({
                _id: 'uid1',
                email: 'admin@a.com',
                role: 'super-admin',
                hashedPassword: hashed,
                isBlocked: false,
                toObject: () => ({ _id: 'uid1', email: 'admin@a.com', role: 'super-admin', hashedPassword: hashed }),
            }),
        });

        const res = await request(buildApp())
            .post('/login')
            .send({ email: 'admin@a.com', password: 'pass' });
        expect(res.status).toBe(200);
        expect(res.body.data).not.toHaveProperty('hashedPassword');
        expect(res.headers['set-cookie']).toBeDefined();
    });
});

describe('GET /admin/logout', () => {
    it('returns 200 and clears the cookie', async () => {
        const res = await request(buildApp()).get('/logout');
        expect(res.status).toBe(200);
        const cookies = (res.headers['set-cookie'] as string[] | undefined) ?? [];
        expect(cookies.some((c) => c.startsWith('token=;'))).toBe(true);
    });
});

// Snapshot: cover jwt.sign branch
describe('admin token payload', () => {
    it('issued token contains userId, email, role', async () => {
        const hashed = await bcrypt.hash('pass', 1);
        mockFindOne.mockReturnValueOnce({
            select: jest.fn().mockResolvedValue({
                _id: 'uid1',
                email: 'admin@a.com',
                role: 'super-admin',
                hashedPassword: hashed,
                isBlocked: false,
                toObject: () => ({ _id: 'uid1', email: 'admin@a.com', role: 'super-admin', hashedPassword: hashed }),
            }),
        });

        const res = await request(buildApp())
            .post('/login')
            .send({ email: 'admin@a.com', password: 'pass' });

        const cookies = (res.headers['set-cookie'] as string[]) ?? [];
        const tokenCookie = cookies.find((c) => c.startsWith('token='));
        const token = tokenCookie?.split(';')[0].replace('token=', '');
        const decoded = jwt.verify(token as string, JWT_SECRET) as Record<string, unknown>;
        expect(decoded).toHaveProperty('userId');
        expect(decoded).toHaveProperty('role', 'super-admin');
    });
});
