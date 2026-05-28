/**
 * Shared utility: extracts the raw JWT string from the Cookie header.
 * Single source of truth — imported by auth.middleware.ts, rbac.middleware.ts,
 * and auth.controller.ts instead of each defining their own copy.
 */
export const extractCookieToken = (cookieHeader?: string): string | null => {
    if (!cookieHeader) return null;
    const pair = cookieHeader
        .split(';')
        .map((p) => p.trim())
        .find((p) => p.startsWith('token='));
    if (!pair) return null;
    return decodeURIComponent(pair.replace('token=', ''));
};
