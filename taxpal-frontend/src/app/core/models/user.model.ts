export type IncomeBracket = 'low' | 'middle' | 'high';

export interface User {
  id: string;
  name: string;
  email: string;
  country: string;
  income_bracket: IncomeBracket;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  country: string;
  income_bracket: IncomeBracket;
}
