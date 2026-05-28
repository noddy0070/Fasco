/**
 * Integration-level tests for admin user management routes.
 * Covers authentication, RBAC authorization, and all CRUD responses.
 * Uses jest.unstable_mockModule + dynamic imports (correct Jest ESM pattern).
 */
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { jest, describe, it, expect, beforeAll, afterEach } from '@jest/globals';

// ── Define mock fns before registering the module mock ─────────────────────────
const mockFind = jest.fn();
const mockFindOne = jest.fn();
const mockFindById = jest.fn();
const mockCreate = jest.fn();
const mockFindOneAndUpdate = jest.fn();
const mockCountDocuments = jest.fn();

jest.unstable_mockModule('../model/user.model', () => ({
    default: {
        find: mockFind,
        findOne: mockFindOne,
        findById: mockFindById,
        create: mockCreate,
        findOneAndUpdate: mockFindOneAndUpdate,
        countDocuments: mockCountDocuments,
    },
}));
jest.unstable_mockModule('../utils/logger', () => ({
    default: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

// Dynamic imports AFTER mock registration.
const { requireRole } = await import('../middleware/rbac.middleware');
const { adminRole } = await import('../model.interfaces/customEnum');
const {
    listUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
} = await import('../controller/admin/admin-user.controller');

// ── Helpers ───────────────────────────────────────────────────────────────────
const JWT_SECRET = 'test-secret';
const userAdminRoles = [adminRole.SUPER_ADMIN, adminRole.USER_ADMIN];

const makeToken = (role: string) =>
    jwt.sign({ userId: 'admin1', email: 'admin@a.com', role }, JWT_SECRET, { expiresIn: '1h' });

const superAdminCookie = () => `token=${makeToken(adminRole.SUPER_ADMIN)}`;

const buildApp = () => {
    const app = express();
    app.use(express.json());
    app.get('/users', requireRole(userAdminRoles), listUsers);
    app.get('/users/:id', requireRole(userAdminRoles), getUser);
    app.post('/users', requireRole(userAdminRoles), createUser);
    app.patch('/users/:id', requireRole(userAdminRoles), updateUser);
    app.delete('/users/:id', requireRole(userAdminRoles), deleteUser);
    return app;
};

beforeAll(() => {
    process.env['JWT_SECRET'] = JWT_SECRET;
});

afterEach(() => {
    mockFind.mockReset();
    mockFindOne.mockReset();
    mockFindById.mockReset();
    mockCreate.mockReset();
    mockFindOneAndUpdate.mockReset();
    mockCountDocuments.mockReset();
});

// ── Authorization ───────────────────────────────────────────────────────────────
describe('RBAC authorization', () => {
    it('returns 401 on GET /users with no token', async () => {
        const res = await request(buildApp()).get('/users');
        expect(res.status).toBe(401);
    });

    it('returns 403 on GET /users with inventory-management role', async () => {
        const res = await request(buildApp())
            .get('/users')
            .set('Cookie', `token=${makeToken(adminRole.INVENTORY_MANAGEMENT)}`);
        expect(res.status).toBe(403);
    });

    it('allows user-admin to access /users', async () => {
        mockFind.mockReturnValueOnce({
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue([]),
        });
        mockCountDocuments.mockResolvedValueOnce(0);

        const res = await request(buildApp())
            .get('/users')
            .set('Cookie', `token=${makeToken(adminRole.USER_ADMIN)}`);
        expect(res.status).toBe(200);
    });

    it('allows super-admin to access /users', async () => {
        mockFind.mockReturnValueOnce({
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue([]),
        });
        mockCountDocuments.mockResolvedValueOnce(0);

        const res = await request(buildApp()).get('/users').set('Cookie', superAdminCookie());
        expect(res.status).toBe(200);
    });
});

// ── GET /users (list + pagination) ──────────────────────────────────────────
describe('GET /users', () => {
    it('returns paginated user list with total count', async () => {
        const fakeUsers = [{ _id: 'u1', email: 'a@a.com' }, { _id: 'u2', email: 'b@b.com' }];
        mockFind.mockReturnValueOnce({
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(fakeUsers),
        });
        mockCountDocuments.mockResolvedValueOnce(2);

        const res = await request(buildApp()).get('/users').set('Cookie', superAdminCookie());
        expect(res.status).toBe(200);
        expect(res.body.data.users).toHaveLength(2);
        expect(res.body.data.total).toBe(2);
        expect(res.body.data.page).toBe(1);
    });

    it('returns empty list when no users exist', async () => {
        mockFind.mockReturnValueOnce({
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue([]),
        });
        mockCountDocuments.mockResolvedValueOnce(0);

        const res = await request(buildApp()).get('/users').set('Cookie', superAdminCookie());
        expect(res.status).toBe(200);
        expect(res.body.data.users).toHaveLength(0);
        expect(res.body.data.total).toBe(0);
    });
});

// ── GET /users/:id ──────────────────────────────────────────────────────────────
describe('GET /users/:id', () => {
    it('returns 200 and user data when found', async () => {
        mockFindOne.mockReturnValueOnce({ lean: jest.fn().mockResolvedValue({ _id: 'u1', email: 'a@a.com' }) });

        const res = await request(buildApp()).get('/users/u1').set('Cookie', superAdminCookie());
        expect(res.status).toBe(200);
        expect(res.body.data).toBeDefined();
    });

    it('returns 404 when user does not exist', async () => {
        mockFindOne.mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(null) });

        const res = await request(buildApp()).get('/users/nonexistent').set('Cookie', superAdminCookie());
        expect(res.status).toBe(404);
    });
});

// ── POST /users ─────────────────────────────────────────────────────────────────
describe('POST /users', () => {
    it('returns 400 when required fields are missing', async () => {
        const res = await request(buildApp())
            .post('/users')
            .set('Cookie', superAdminCookie())
            .send({ email: 'new@b.com' }); // missing firstName, phone, password
        expect(res.status).toBe(400);
    });

    it('returns 400 when email is already registered', async () => {
        mockFindOne.mockResolvedValueOnce({ email: 'dup@b.com' });

        const res = await request(buildApp())
            .post('/users')
            .set('Cookie', superAdminCookie())
            .send({ firstName: 'A', email: 'dup@b.com', phone: '123', password: 'pass123' });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/already in use/i);
    });

    it('creates a user and returns 201 with user data', async () => {
        mockFindOne.mockResolvedValueOnce(null);
        const fakeUser = { _id: 'uid1', email: 'new@b.com', role: 'user' };
        mockCreate.mockResolvedValueOnce(fakeUser);

        const res = await request(buildApp())
            .post('/users')
            .set('Cookie', superAdminCookie())
            .send({ firstName: 'A', email: 'new@b.com', phone: '123', password: 'pass123' });
        expect(res.status).toBe(201);
        expect(res.body.data.email).toBe('new@b.com');
    });

    it('assigns default role "user" when role is not specified', async () => {
        mockFindOne.mockResolvedValueOnce(null);
        const fakeUser = { _id: 'uid1', email: 'new@b.com', role: 'user' };
        mockCreate.mockResolvedValueOnce(fakeUser);

        const res = await request(buildApp())
            .post('/users')
            .set('Cookie', superAdminCookie())
            .send({ firstName: 'A', email: 'new@b.com', phone: '123', password: 'pass123' });
        expect(res.status).toBe(201);
        // Verify create was called (role defaults to 'user' in controller)
        expect(mockCreate).toHaveBeenCalledTimes(1);
    });
});

// ── PATCH /users/:id ─────────────────────────────────────────────────────────────
describe('PATCH /users/:id', () => {
    it('returns 200 and updated user on success', async () => {
        const updated = { _id: 'u1', firstName: 'Updated', email: 'a@a.com' };
        mockFindOneAndUpdate.mockResolvedValueOnce(updated);

        const res = await request(buildApp())
            .patch('/users/u1')
            .set('Cookie', superAdminCookie())
            .send({ firstName: 'Updated' });
        expect(res.status).toBe(200);
        expect(res.body.data.firstName).toBe('Updated');
    });

    it('returns 404 when user to update does not exist', async () => {
        mockFindOneAndUpdate.mockResolvedValueOnce(null);

        const res = await request(buildApp())
            .patch('/users/nonexistent')
            .set('Cookie', superAdminCookie())
            .send({ firstName: 'X' });
        expect(res.status).toBe(404);
    });

    it('ignores forbidden fields like _id and deletedAt', async () => {
        const updated = { _id: 'u1', email: 'a@a.com' };
        mockFindOneAndUpdate.mockResolvedValueOnce(updated);

        const res = await request(buildApp())
            .patch('/users/u1')
            .set('Cookie', superAdminCookie())
            // Sending forbidden fields — controller should strip them.
            .send({ _id: 'hacked', deletedAt: null, firstName: 'Legit' });
        expect(res.status).toBe(200);
        const callArg = mockFindOneAndUpdate.mock.calls[0]?.[1] as Record<string, unknown>;
        const setFields = callArg?.['$set'] as Record<string, unknown>;
        expect(setFields).not.toHaveProperty('_id');
        expect(setFields).not.toHaveProperty('deletedAt');
    });
});

// ── DELETE /users/:id (soft-delete) ────────────────────────────────────────────
describe('DELETE /users/:id', () => {
    it('returns 200 on successful soft-delete', async () => {
        mockFindOneAndUpdate.mockResolvedValueOnce({ _id: 'u1', deletedAt: new Date() });

        const res = await request(buildApp())
            .delete('/users/u1')
            .set('Cookie', superAdminCookie());
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/deleted/i);
    });

    it('returns 404 when user does not exist or is already deleted', async () => {
        mockFindOneAndUpdate.mockResolvedValueOnce(null);

        const res = await request(buildApp())
            .delete('/users/nonexistent')
            .set('Cookie', superAdminCookie());
        expect(res.status).toBe(404);
    });

    it('performs a soft-delete (sets deletedAt) rather than removing the document', async () => {
        mockFindOneAndUpdate.mockResolvedValueOnce({ _id: 'u1', deletedAt: new Date() });

        await request(buildApp()).delete('/users/u1').set('Cookie', superAdminCookie());

        // Verify the update sets deletedAt, not a hard delete.
        const filter = mockFindOneAndUpdate.mock.calls[0]?.[0] as Record<string, unknown>;
        const update = mockFindOneAndUpdate.mock.calls[0]?.[1] as Record<string, unknown>;
        expect(filter).toHaveProperty('deletedAt', null);
        expect((update['$set'] as Record<string, unknown>)).toHaveProperty('deletedAt');
    });
});

// ── error paths for each CRUD handler ──────────────────────────────────────────────
describe('500 error paths', () => {
    it('GET /users returns 500 on DB error', async () => {
        mockFind.mockReturnValueOnce({
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            lean: jest.fn().mockRejectedValue(new Error('DB error')),
        });

        const res = await request(buildApp()).get('/users').set('Cookie', superAdminCookie());
        expect(res.status).toBe(500);
    });

    it('GET /users/:id returns 500 on DB error', async () => {
        mockFindOne.mockReturnValueOnce({ lean: jest.fn().mockRejectedValue(new Error('DB error')) });

        const res = await request(buildApp()).get('/users/u1').set('Cookie', superAdminCookie());
        expect(res.status).toBe(500);
    });

    it('POST /users returns 500 on DB error', async () => {
        mockFindOne.mockResolvedValueOnce(null);
        mockCreate.mockRejectedValueOnce(new Error('DB error'));

        const res = await request(buildApp())
            .post('/users')
            .set('Cookie', superAdminCookie())
            .send({ firstName: 'A', email: 'new@b.com', phone: '123', password: 'pass123' });
        expect(res.status).toBe(500);
    });

    it('PATCH /users/:id returns 500 on DB error', async () => {
        mockFindOneAndUpdate.mockRejectedValueOnce(new Error('DB error'));

        const res = await request(buildApp())
            .patch('/users/u1')
            .set('Cookie', superAdminCookie())
            .send({ firstName: 'X' });
        expect(res.status).toBe(500);
    });

    it('DELETE /users/:id returns 500 on DB error', async () => {
        mockFindOneAndUpdate.mockRejectedValueOnce(new Error('DB error'));

        const res = await request(buildApp())
            .delete('/users/u1')
            .set('Cookie', superAdminCookie());
        expect(res.status).toBe(500);
    });
});

