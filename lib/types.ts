export interface AuthState {
  isAdmin: boolean;
  token: string | null;
  username: string | null;
  validating: boolean;
  error: string | null;
}

export interface ValidateApiKeyResponse {
  isAdmin: boolean;
}

export interface LoginResponse {
  token: string;
  username: string;
}

export interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}
