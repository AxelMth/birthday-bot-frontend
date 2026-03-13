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
    token: null,
    username: null,
    validating: true,
    error: null,
  });

  const validateToken = useCallback(async (token: string): Promise<boolean> => {
    setState((prev) => ({ ...prev, validating: true, error: null }));

    try {
      const result = await AuthClientService.validateToken(token);

      const storedUsername =
        typeof window !== "undefined"
          ? localStorage.getItem("username")
          : null;

      setState((prev) => ({
        ...prev,
        isAdmin: result.isAdmin,
        token,
        username: storedUsername,
        validating: false,
        error: null,
      }));

      return result.isAdmin;
    } catch {
      setState((prev) => ({
        ...prev,
        isAdmin: false,
        token: null,
        username: null,
        validating: false,
        error: "Session expired",
      }));

      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
      }
      return false;
    }
  }, []);

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      setState((prev) => ({ ...prev, validating: true, error: null }));

      try {
        const result = await AuthClientService.login(username, password);

        if (typeof window !== "undefined") {
          localStorage.setItem("token", result.token);
          localStorage.setItem("username", result.username);
        }

        setState({
          isAdmin: true,
          token: result.token,
          username: result.username,
          validating: false,
          error: null,
        });

        return true;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isAdmin: false,
          token: null,
          username: null,
          validating: false,
          error:
            error instanceof Error ? error.message : "Login failed",
        }));
        return false;
      }
    },
    [],
  );

  const logout = useCallback((): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
    }
    setState({
      isAdmin: false,
      token: null,
      username: null,
      validating: false,
      error: null,
    });
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window === "undefined") return;

      const storedToken = localStorage.getItem("token");

      if (storedToken) {
        await validateToken(storedToken);
      } else {
        setState((prev) => ({ ...prev, validating: false }));
      }
    };

    initializeAuth();
  }, [validateToken]);

  const contextValue = {
    ...state,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
