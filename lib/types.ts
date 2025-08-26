export interface AuthState {
  isAdmin: boolean;
  apiKey: string | null;
  validating: boolean;
  error: string | null;
}

export interface ValidateApiKeyResponse {
  isAdmin: boolean;
}

export interface AuthContextValue extends AuthState {
  setApiKey: (apiKey: string) => Promise<void>;
  clearApiKey: () => void;
}
