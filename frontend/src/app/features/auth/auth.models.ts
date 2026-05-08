
export interface SignupPayload {
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface AuthUser {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  isVerified?: boolean;
  isBlocked?: boolean;
}

export interface LoginResponse {
  message: string;
  token?: string;
  data: AuthUser;
}

export interface CurrentUserResponse {
  message: string;
  data: AuthUser;
}