import { environment } from "../../../environments/environments";

const API_PREFIX = `${environment.apiUrl}/api`;
const AUTH_PREFIX = `${API_PREFIX}/auth`;

export const API_ENDPOINTS = {
    auth: {
        signup: `${AUTH_PREFIX}/signup`,
        login: `${AUTH_PREFIX}/login`,
        resendVerification: `${AUTH_PREFIX}/verify/resend`,
        google: `${AUTH_PREFIX}/google`,
        forgotPassword: `${AUTH_PREFIX}/forgot-password`,
        resetPassword: `${AUTH_PREFIX}/reset-password`,
        me: `${AUTH_PREFIX}/me`,
        verifyEmail: (token: string) => `${AUTH_PREFIX}/verify/${token}`,
        logout: `${AUTH_PREFIX}/logout`,
        refresh: `${AUTH_PREFIX}/refresh`,
    },
} as const;