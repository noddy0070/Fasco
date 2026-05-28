/**
 * Tests for email-verification controller (verify.controller.ts).
 */
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { jest, describe, it, expect, beforeAll, afterEach } from '@jest/globals';

const mockFindByIdAndUpdate = jest.fn();
const mockFindOne = jest.fn();
const mockSendEmail = jest.fn().mockResolvedValue(undefined);

jest.unstable_mockModule('../model/user.model', () => ({
    default: { findByIdAndUpdate: mockFindByIdAndUpdate, findOne: mockFindOne },
}));
jest.unstable_mockModule('../utils/mailService', () => ({
    sendEmail: mockSendEmail,
}));

const { verifyEmail, resendVerification } = await import('../controller/auth/verify.controller');

const JWT_SECRET = 'test-secret';

const buildApp = () => {
    const app = express();
    app.use(express.json());
    app.get('/verify/:token', verifyEmail);
    app.post('/resend', resendVerification);
    return app;
};

beforeAll(() => {
    process.env['JWT_SECRET'] = JWT_SECRET;
});

afterEach(() => {
    mockFindByIdAndUpdate.mockReset();
    mockFindOne.mockReset();
    mockSendEmail.mockReset();
});

describe('GET /verify/:token', () => {
    it('returns 400 when no token is provided (empty string param not possible via route, test invalid)', async () => {
        // Express route requires :token to be non-empty; simulate invalid token
        const res = await request(buildApp()).get('/verify/not.a.valid.token');
        expect(res.status).toBe(400);
    });

    it('returns 400 when user is not found after verification', async () => {
        const token = jwt.sign({ userId: 'uid1' }, JWT_SECRET, { expiresIn: '1h' });
        mockFindByIdAndUpdate.mockReturnValueOnce(
            Promise.resolve(null),
        );

        const res = await request(buildApp()).get(`/verify/${token}`);
        expect(res.status).toBe(400);
    });

    it('returns 200 on successful email verification', async () => {
        const token = jwt.sign({ userId: 'uid1' }, JWT_SECRET, { expiresIn: '1h' });
        mockFindByIdAndUpdate.mockResolvedValueOnce({ _id: 'uid1', isVerified: true });

        const res = await request(buildApp()).get(`/verify/${token}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/verified/i);
    });

    it('returns 500 when findByIdAndUpdate rejects', async () => {
        const token = jwt.sign({ userId: 'uid1' }, JWT_SECRET, { expiresIn: '1h' });
        mockFindByIdAndUpdate.mockRejectedValueOnce(new Error('DB error'));

        const res = await request(buildApp()).get(`/verify/${token}`);
        expect(res.status).toBe(500);
    });
});

describe('POST /resend', () => {
    it('returns 400 when email is missing', async () => {
        const res = await request(buildApp()).post('/resend').send({});
        expect(res.status).toBe(400);
    });

    it('returns 404 when user is not found', async () => {
        mockFindOne.mockResolvedValueOnce(null);

        const res = await request(buildApp()).post('/resend').send({ email: 'ghost@b.com' });
        expect(res.status).toBe(404);
    });

    it('returns 400 when email is already verified', async () => {
        mockFindOne.mockResolvedValueOnce({ _id: 'uid1', isVerified: true });

        const res = await request(buildApp()).post('/resend').send({ email: 'a@b.com' });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/already verified/i);
    });

    it('returns 200 and sends verification email', async () => {
        mockFindOne.mockResolvedValueOnce({ _id: 'uid1', isVerified: false });
        mockSendEmail.mockResolvedValueOnce(undefined);

        const res = await request(buildApp()).post('/resend').send({ email: 'a@b.com' });
        expect(res.status).toBe(200);
        expect(mockSendEmail).toHaveBeenCalledTimes(1);
    });

    it('returns 500 when db throws', async () => {
        mockFindOne.mockRejectedValueOnce(new Error('DB error'));

        const res = await request(buildApp()).post('/resend').send({ email: 'a@b.com' });
        expect(res.status).toBe(500);
    });
});
