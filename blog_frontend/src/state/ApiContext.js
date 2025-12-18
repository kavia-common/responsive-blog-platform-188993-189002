import React, { createContext, useContext, useMemo } from "react";
import { createApiClient } from "../api/client";
import { useAuth } from "./AuthContext";

const ApiContext = createContext(null);

/**
 * PUBLIC_INTERFACE
 * Provides a centralized API client with token injection.
 */
export function ApiProvider({ children }) {
  const { token } = useAuth();

  const api = useMemo(() => {
    return createApiClient({
      getToken: () => token
    });
  }, [token]);

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * Hook to access the API client.
 */
export function useApi() {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error("useApi must be used within ApiProvider");
  return ctx;
}
