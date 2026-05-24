export const toSlug = (value: string): string =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

export const inferProductFilter = (slug: string): 'men' | 'women' | 'sale' | 'featured' | 'all' => {
    if (slug === 'sale') return 'sale';
    if (slug === 'featured') return 'featured';
    if (slug.includes('women')) return 'women';
    if (slug.includes('men')) return 'men';
    return 'all';
};
