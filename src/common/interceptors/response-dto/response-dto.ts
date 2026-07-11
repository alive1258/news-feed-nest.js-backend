export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  tokens?: AuthTokens;
  accessToken?: string;
  refreshToken?: string;
  newRefreshToken?: string;
  ttl?: number;
  message?: string;
}

// export interface StandardResponse<T> {
//   apiVersion: string;
//   success: boolean;
//   message: string;
//   status: number;
//   data: T;
// }

export interface StandardResponse<T> {
  apiVersion: string;
  success: boolean;
  message: string;
  status: number;
  data: T | T[];
  meta?: Record<string, any>;
  links?: Record<string, any>;
}

