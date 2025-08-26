"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./auth-context";
import { AuthState } from "@/lib/types";
import { AuthClientService } from "@/lib/clients/auth.client.service";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAdmin: false,
    apiKey: null,
    validating: false,
    error: null,
  });

  // Parse API key from URL parameters
  const parseApiKeyFromUrl = useCallback((): string | null => {
    if (typeof window === "undefined") return null;

    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("apiKey") || urlParams.get("API_KEY");
  }, []);

  // Get stored API key from localStorage
  const getStoredApiKey = useCallback((): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("apiKey");
  }, []);

  // Store API key in localStorage
  const storeApiKey = useCallback((apiKey: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem("apiKey", apiKey);
  }, []);

  // Clear API key from localStorage
  const clearStoredApiKey = useCallback((): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("apiKey");
    localStorage.removeItem("isAdmin"); // Clear cached admin status too
  }, []);

  // Validate API key with backend
  const validateApiKey = useCallback(
    async (apiKey: string): Promise<boolean> => {
      setState((prev) => ({ ...prev, validating: true, error: null }));

      try {
        const result = await AuthClientService.validateApiKey(apiKey);

        setState((prev) => ({
          ...prev,
          isAdmin: result.isAdmin,
          apiKey,
          validating: false,
          error: null,
        }));

        // Cache admin status for UX (will be re-validated on reload)
        if (typeof window !== "undefined") {
          localStorage.setItem("isAdmin", result.isAdmin.toString());
        }

        return true;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isAdmin: false,
          apiKey: null,
          validating: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to validate API key",
        }));

        // Clear stored key on validation failure
        clearStoredApiKey();
        return false;
      }
    },
    [clearStoredApiKey],
  );

  // Set API key and validate
  const setApiKey = useCallback(
    async (apiKey: string): Promise<void> => {
      storeApiKey(apiKey);
      await validateApiKey(apiKey);
    },
    [storeApiKey, validateApiKey],
  );

  // Clear API key and reset state
  const clearApiKey = useCallback((): void => {
    clearStoredApiKey();
    setState({
      isAdmin: false,
      apiKey: null,
      validating: false,
      error: null,
    });
  }, [clearStoredApiKey]);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      // First, check for API key in URL
      const urlApiKey = parseApiKeyFromUrl();

      if (urlApiKey) {
        // Store and validate API key from URL
        storeApiKey(urlApiKey);
        await validateApiKey(urlApiKey);

        // Clean up URL by removing the API key parameter
        const url = new URL(window.location.href);
        url.searchParams.delete("apiKey");
        url.searchParams.delete("API_KEY");
        window.history.replaceState({}, "", url.toString());
      } else {
        // Check for stored API key and validate
        const storedApiKey = getStoredApiKey();

        if (storedApiKey) {
          // Load cached admin status for immediate UX
          const cachedIsAdmin = localStorage.getItem("isAdmin") === "true";
          setState((prev) => ({
            ...prev,
            apiKey: storedApiKey,
            isAdmin: cachedIsAdmin,
          }));

          // Validate stored key in background
          await validateApiKey(storedApiKey);
        }
      }
    };

    initializeAuth();
  }, [parseApiKeyFromUrl, getStoredApiKey, storeApiKey, validateApiKey]);

  const contextValue = {
    ...state,
    setApiKey,
    clearApiKey,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
