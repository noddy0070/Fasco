const API_PREFIX = '/api';
const AUTH_PREFIX = `${API_PREFIX}/auth`;

export const API_ENDPOINTS = {
    auth: {
        signup: `${AUTH_PREFIX}/signup`,
        login: `${AUTH_PREFIX}/login`,
        google: `${AUTH_PREFIX}/google`,
        forgotPassword: `${AUTH_PREFIX}/forgot-password`,
        resetPassword: `${AUTH_PREFIX}/reset-password`,
        me: `${AUTH_PREFIX}/me`,
        verifyEmail: (token: string) => `${AUTH_PREFIX}/verify/${token}`,
        logout: `${AUTH_PREFIX}/logout`,
        refresh: `${AUTH_PREFIX}/refresh`,
    },
} as const;