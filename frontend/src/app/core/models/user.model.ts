export interface AuthUser {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  isVerified?: boolean;
  isBlocked?: boolean;
  role?: string;
  avatar?: string;
}

export interface SignupRequest {
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  password: string;
}

export interface SignupResponse {
  message: string;
  token: string;
  data: AuthUser;
}