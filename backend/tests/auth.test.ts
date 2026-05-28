/**
 * Tests for the auth controller (signup, login, logout, me).
 * Uses jest.unstable_mockModule + dynamic imports — the correct Jest ESM pattern.
 */
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { jest, describe, it, expect, beforeAll, afterEach } from '@jest/globals';

// ── Define mock fns before registering the module mock ───────────────────────────
const mockFindOne = jest.fn();
const mockFindById = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockDeleteOne = jest.fn();
const mockSave = jest.fn();
const mockUserConstructor = jest.fn().mockImplementation(() => ({
    _id: 'new-uid',
    save: mockSave,
}));
Object.assign(mockUserConstructor, {
    findOne: mockFindOne,
    findById: mockFindById,
    findByIdAndUpdate: mockFindByIdAndUpdate,
    deleteOne: mockDeleteOne,
});

const mockSendEmail = jest.fn();

jest.unstable_mockModule('../model/user.model', () => ({ default: mockUserConstructor }));
jest.unstable_mockModule('../utils/mailService', () => ({ sendEmail: mockSendEmail }));
jest.unstable_mockModule('../utils/logger', () => ({
    default: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

// Dynamic imports AFTER mock registration — these receive the mocked versions.
const { signup, login, logout, me, forgotPassword, resetPassword } = await import('../controller/auth/auth.controller');

// ── Helpers ───────────────────────────────────────────────────────────────────
const JWT_SECRET = 'test-secret';

const buildApp = () => {
    const app = express();
    app.use(express.json());
    app.post('/signup', signup);
    app.post('/login', login);
    app.get('/logout', logout);
    app.get('/me', me);
    app.post('/forgot-password', forgotPassword);
    app.post('/reset-password', resetPassword);
    return app;
};

beforeAll(() => {
    process.env['JWT_SECRET'] = JWT_SECRET;
});

afterEach(() => {
    mockFindOne.mockReset();
    mockFindById.mockReset();
    mockFindByIdAndUpdate.mockReset();
    mockDeleteOne.mockReset();
    mockSave.mockReset();
    mockUserConstructor.mockClear();
    mockSendEmail.mockReset();
});

// ── POST /signup ──────────────────────────────────────────────────────────────
describe('POST /signup', () => {
    it('returns 400 when required fields are missing', async () => {
        const app = buildApp();
        const res = await request(app).post('/signup').send({ email: 'a@b.com' });
        expect(res.status).toBe(400);
    });

    it('returns 400 when email is already in use by a verified user', async () => {
        mockFindOne.mockResolvedValueOnce({ isVerified: true });

        const app = buildApp();
        const res = await request(app)
            .post('/signup')
            .send({ firstName: 'A', email: 'a@b.com', phone: '1234', password: 'pass123' });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/already in use/i);
    });

    it('replaces unverified account and creates a new one', async () => {
        mockFindOne.mockResolvedValueOnce({ isVerified: false, _id: 'old-uid' });
        mockDeleteOne.mockResolvedValueOnce({});
        mockSave.mockResolvedValueOnce({});
        mockSendEmail.mockResolvedValue(undefined);

        const app = buildApp();
        const res = await request(app)
            .post('/signup')
            .send({ firstName: 'A', email: 'a@b.com', phone: '1234', password: 'pass123' });
        expect(res.status).toBe(201);
        expect(mockDeleteOne).toHaveBeenCalledTimes(1);
    });

    it('creates user and returns 201 when account is new', async () => {
        mockFindOne.mockResolvedValueOnce(null);
        mockSave.mockResolvedValueOnce({});
        mockSendEmail.mockResolvedValue(undefined);

        const app = buildApp();
        const res = await request(app)
            .post('/signup')
            .send({ firstName: 'A', email: 'a@b.com', phone: '1234', password: 'pass123' });
        expect(res.status).toBe(201);
        expect(res.body.message).toMatch(/created/i);
    });

    it('still returns 201 even if email send fails (fire-and-forget)', async () => {
        mockFindOne.mockResolvedValueOnce(null);
        mockSave.mockResolvedValueOnce({});
        // Simulate sendEmail throwing — should not affect response.
        mockSendEmail.mockRejectedValue(new Error('SMTP failure'));

        const app = buildApp();
        const res = await request(app)
            .post('/signup')
            .send({ firstName: 'A', email: 'a@b.com', phone: '1234', password: 'pass123' });
        expect(res.status).toBe(201);
    });
});

// ── POST /login ───────────────────────────────────────────────────────────────
describe('POST /login', () => {
    it('returns 400 when credentials are missing', async () => {
        const app = buildApp();
        const res = await request(app).post('/login').send({ email: 'a@b.com' });
        expect(res.status).toBe(400);
    });

    it('returns 401 with generic message when user is not found (prevents account enumeration)', async () => {
        mockFindOne.mockReturnValueOnce({ select: jest.fn().mockResolvedValue(null) });

        const app = buildApp();
        const res = await request(app)
            .post('/login')
            .send({ email: 'ghost@b.com', password: 'pass123' });
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Invalid email or password');
    });

    it('returns 401 with same generic message when password is wrong', async () => {
        const hashed = await bcrypt.hash('correctpass', 1);
        mockFindOne.mockReturnValueOnce({
            select: jest.fn().mockResolvedValue({
                hashedPassword: hashed,
                isBlocked: false,
                isVerified: true,
                _id: 'uid1',
                email: 'a@b.com',
                toObject: () => ({ _id: 'uid1', email: 'a@b.com' }),
            }),
        });

        const app = buildApp();
        const res = await request(app)
            .post('/login')
            .send({ email: 'a@b.com', password: 'wrongpass' });
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Invalid email or password');
    });

    it('returns 200, sets HttpOnly cookie, and keeps JWT out of body on success', async () => {
        const hashed = await bcrypt.hash('pass123', 1);
        mockFindOne.mockReturnValueOnce({
            select: jest.fn().mockResolvedValue({
                hashedPassword: hashed,
                isBlocked: false,
                isVerified: true,
                _id: 'uid1',
                email: 'a@b.com',
                role: 'user',
                toObject: () => ({ _id: 'uid1', email: 'a@b.com', role: 'user' }),
            }),
        });

        const app = buildApp();
        const res = await request(app)
            .post('/login')
            .send({ email: 'a@b.com', password: 'pass123' });
        expect(res.status).toBe(200);
        expect(res.body).not.toHaveProperty('token'); // JWT removed from body
        expect(res.body.data).toBeDefined();
        expect(res.headers['set-cookie']).toBeDefined();
    });

    it('returns 403 when user account is blocked', async () => {
        const hashed = await bcrypt.hash('pass123', 1);
        mockFindOne.mockReturnValueOnce({
            select: jest.fn().mockResolvedValue({
                hashedPassword: hashed,
                isBlocked: true,
                isVerified: true,
                _id: 'uid1',
                email: 'a@b.com',
                toObject: jest.fn(),
            }),
        });

        const app = buildApp();
        const res = await request(app)
            .post('/login')
            .send({ email: 'a@b.com', password: 'pass123' });
        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(/blocked/i);
    });

    it('returns 403 when user has not verified their email', async () => {
        const hashed = await bcrypt.hash('pass123', 1);
        mockFindOne.mockReturnValueOnce({
            select: jest.fn().mockResolvedValue({
                hashedPassword: hashed,
                isBlocked: false,
                isVerified: false,
                _id: 'uid1',
                email: 'a@b.com',
                toObject: jest.fn(),
            }),
        });

        const app = buildApp();
        const res = await request(app)
            .post('/login')
            .send({ email: 'a@b.com', password: 'pass123' });
        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(/not verified/i);
    });
});

// ── GET /me ─────────────────────────────────────────────────────────────────────
describe('GET /me', () => {
    it('returns 401 when no cookie is present', async () => {
        const app = buildApp();
        const res = await request(app).get('/me');
        expect(res.status).toBe(401);
    });

    it('returns 401 when cookie contains a bad token', async () => {
        const app = buildApp();
        const res = await request(app).get('/me').set('Cookie', 'token=not.a.valid.jwt');
        expect(res.status).toBe(401);
    });

    it('returns 200 with user data when valid cookie is present', async () => {
        const token = jwt.sign({ userId: 'uid1' }, JWT_SECRET, { expiresIn: '1h' });
        mockFindById.mockResolvedValueOnce({ _id: 'uid1', email: 'a@b.com' });

        const app = buildApp();
        const res = await request(app).get('/me').set('Cookie', `token=${token}`);
        expect(res.status).toBe(200);
        expect(res.body.data).toBeDefined();
    });

    it('returns 401 when the user referenced in the token no longer exists', async () => {
        const token = jwt.sign({ userId: 'uid-deleted' }, JWT_SECRET, { expiresIn: '1h' });
        mockFindById.mockResolvedValueOnce(null);

        const app = buildApp();
        const res = await request(app).get('/me').set('Cookie', `token=${token}`);
        expect(res.status).toBe(401);
    });
});

// ── POST /forgot-password ─────────────────────────────────────────────────────
describe('POST /forgot-password', () => {
    it('returns 400 when email is missing', async () => {
        const res = await request(buildApp()).post('/forgot-password').send({});
        expect(res.status).toBe(400);
    });

    it('returns 200 (anti-enumeration) when user does not exist', async () => {
        mockFindOne.mockResolvedValueOnce(null);

        const res = await request(buildApp())
            .post('/forgot-password')
            .send({ email: 'ghost@b.com' });
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/reset link/i);
    });

    it('returns 200 and sends email when user exists', async () => {
        mockFindOne.mockResolvedValueOnce({ _id: 'uid1', email: 'a@b.com' });
        mockSendEmail.mockResolvedValueOnce(undefined);

        const res = await request(buildApp())
            .post('/forgot-password')
            .send({ email: 'a@b.com' });
        expect(res.status).toBe(200);
        expect(mockSendEmail).toHaveBeenCalledTimes(1);
    });

    it('returns 500 when database throws', async () => {
        mockFindOne.mockRejectedValueOnce(new Error('DB down'));

        const res = await request(buildApp())
            .post('/forgot-password')
            .send({ email: 'a@b.com' });
        expect(res.status).toBe(500);
    });
});

// ── POST /reset-password ────────────────────────────────────────────────────────
describe('POST /reset-password', () => {
    it('returns 400 when token or newPassword is missing', async () => {
        const res = await request(buildApp()).post('/reset-password').send({ token: 'x' });
        expect(res.status).toBe(400);
    });

    it('returns 400 when password is too short', async () => {
        const token = jwt.sign(
            { userId: 'uid1', type: 'password-reset' },
            JWT_SECRET,
            { expiresIn: '15m' },
        );
        const res = await request(buildApp())
            .post('/reset-password')
            .send({ token, newPassword: 'abc' });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/6 characters/i);
    });

    it('returns 400 when token is invalid JWT', async () => {
        const res = await request(buildApp())
            .post('/reset-password')
            .send({ token: 'not.a.valid.jwt', newPassword: 'newpass123' });
        expect(res.status).toBe(400);
    });

    it('returns 400 when token type is not password-reset', async () => {
        const token = jwt.sign({ userId: 'uid1', type: 'email-verify' }, JWT_SECRET, {
            expiresIn: '15m',
        });
        const res = await request(buildApp())
            .post('/reset-password')
            .send({ token, newPassword: 'newpass123' });
        expect(res.status).toBe(400);
    });

    it('returns 404 when user is not found for the token userId', async () => {
        const token = jwt.sign({ userId: 'uid-gone', type: 'password-reset' }, JWT_SECRET, {
            expiresIn: '15m',
        });
        mockFindByIdAndUpdate.mockResolvedValueOnce(null);

        const res = await request(buildApp())
            .post('/reset-password')
            .send({ token, newPassword: 'newpass123' });
        expect(res.status).toBe(404);
    });

    it('returns 200 on successful password reset', async () => {
        const token = jwt.sign({ userId: 'uid1', type: 'password-reset' }, JWT_SECRET, {
            expiresIn: '15m',
        });
        mockFindByIdAndUpdate.mockResolvedValueOnce({ _id: 'uid1' });

        const res = await request(buildApp())
            .post('/reset-password')
            .send({ token, newPassword: 'newpass123' });
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/reset successful/i);
    });
});

// ── GET /logout ────────────────────────────────────────────────────────────────
describe('GET /logout', () => {
    it('returns 200 and clears the token cookie', async () => {
        const app = buildApp();
        const res = await request(app).get('/logout');
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/logout/i);
        const cookies = (res.headers['set-cookie'] as string[] | undefined) ?? [];
        const tokenCookie = cookies.find((c) => c.startsWith('token='));
        // Cleared cookie should have an empty value.
        expect(tokenCookie).toMatch(/token=;/);
    });
});

