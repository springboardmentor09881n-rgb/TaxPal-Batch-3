export interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export interface ValidateTokenResponse {
  valid: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    country: string;
    income_bracket: string;
  };
  message?: string;
  code?: string;
}
