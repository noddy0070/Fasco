/**
 * Tests for resolveProduct utility.
 * Mocks the Product model — no real DB required.
 */
import { jest, describe, it, expect, afterEach } from '@jest/globals';

const mockFindOne = jest.fn();

jest.unstable_mockModule('../model/product.model', () => ({
    default: { findOne: mockFindOne },
}));

const { resolveProduct } = await import('../utils/resolve-product.util');

afterEach(() => {
    mockFindOne.mockReset();
});

describe('resolveProduct', () => {
    it('returns null for an empty string without querying the DB', async () => {
        const result = await resolveProduct('   ');
        expect(result).toBeNull();
        expect(mockFindOne).not.toHaveBeenCalled();
    });

    it('resolves by _id when a valid 24-char hex ObjectId is provided', async () => {
        const fakeProduct = { _id: '507f1f77bcf86cd799439011', slug: 'my-prod' };
        mockFindOne.mockResolvedValueOnce(fakeProduct);

        const result = await resolveProduct('507f1f77bcf86cd799439011');
        expect(result).toEqual(fakeProduct);
        expect(mockFindOne).toHaveBeenCalledTimes(1);
    });

    it('falls back to slug lookup when _id lookup returns null', async () => {
        const fakeProduct = { _id: '507f1f77bcf86cd799439011', slug: 'my-prod' };
        mockFindOne
            .mockResolvedValueOnce(null)          // _id query miss
            .mockResolvedValueOnce(fakeProduct);   // slug query hit

        const result = await resolveProduct('507f1f77bcf86cd799439011');
        expect(result).toEqual(fakeProduct);
        expect(mockFindOne).toHaveBeenCalledTimes(2);
    });

    it('resolves by slug for a non-ObjectId string (skips _id query)', async () => {
        const fakeProduct = { slug: 'summer-sale', _id: 'abc' };
        mockFindOne.mockResolvedValueOnce(fakeProduct);

        const result = await resolveProduct('summer-sale');
        expect(result).toEqual(fakeProduct);
        expect(mockFindOne).toHaveBeenCalledTimes(1);
    });

    it('returns null when neither _id nor slug matches', async () => {
        mockFindOne.mockResolvedValue(null);

        const result = await resolveProduct('not-found-slug');
        expect(result).toBeNull();
    });
});
