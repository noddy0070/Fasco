/**
 * Tests for slug utility: toSlug and inferProductFilter.
 * Pure functions — no mocks needed.
 */
import { describe, it, expect } from '@jest/globals';
import { toSlug, inferProductFilter } from '../utils/slug.util';

describe('toSlug', () => {
    it('lowercases and hyphenates a basic string', () => {
        expect(toSlug('Hello World')).toBe('hello-world');
    });

    it('strips special characters', () => {
        expect(toSlug('Hello, World!')).toBe('hello-world');
    });

    it('collapses multiple spaces and dashes', () => {
        expect(toSlug('foo  bar--baz')).toBe('foo-bar-baz');
    });

    it('trims leading and trailing dashes', () => {
        expect(toSlug(' -hello- ')).toBe('hello');
    });

    it('returns empty string for empty input', () => {
        expect(toSlug('')).toBe('');
    });

    it('preserves underscores as word separators (converts to dash)', () => {
        expect(toSlug('foo_bar')).toBe('foo-bar');
    });

    it('handles already-slugified input unchanged', () => {
        expect(toSlug('already-a-slug')).toBe('already-a-slug');
    });
});

describe('inferProductFilter', () => {
    it('returns "sale" for exact "sale" slug', () => {
        expect(inferProductFilter('sale')).toBe('sale');
    });

    it('returns "featured" for exact "featured" slug', () => {
        expect(inferProductFilter('featured')).toBe('featured');
    });

    it('returns "women" when slug contains "women"', () => {
        expect(inferProductFilter('summer-women-collection')).toBe('women');
    });

    it('returns "men" when slug contains "men" but not "women"', () => {
        expect(inferProductFilter('men-shirts')).toBe('men');
    });

    it('returns "all" for unrecognised slug', () => {
        expect(inferProductFilter('accessories')).toBe('all');
    });

    it('prioritises "women" over "men" when slug contains both', () => {
        // "women" check runs before "men" check in the function
        expect(inferProductFilter('women-and-men')).toBe('women');
    });
});
