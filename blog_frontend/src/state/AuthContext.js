import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "blog.auth.token";

const AuthContext = createContext(null);

/**
 * PUBLIC_INTERFACE
 * Provides auth state and actions (login/logout) for the app.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      if (token) localStorage.setItem(STORAGE_KEY, token);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage failures (private mode etc.)
    }
  }, [token]);

  const value = useMemo(() => {
    return {
      token,
      user,

      // PUBLIC_INTERFACE
      setSession: ({ token: newToken, user: newUser }) => {
        setToken(newToken || null);
        setUser(newUser || null);
      },

      // PUBLIC_INTERFACE
      logout: () => {
        setToken(null);
        setUser(null);
      }
    };
  }, [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * Hook to access auth context.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
