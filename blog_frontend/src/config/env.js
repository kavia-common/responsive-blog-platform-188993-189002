/**
 * Centralized environment variable access.
 * CRA exposes env vars prefixed with REACT_APP_.
 */

/**
 * PUBLIC_INTERFACE
 * Returns the string env var value or a fallback.
 * @param {string} key REACT_APP_* variable name
 * @param {string} [fallback]
 * @returns {string}
 */
export function getEnv(key, fallback = "") {
  const v = process.env[key];
  return typeof v === "string" ? v : fallback;
}

/**
 * PUBLIC_INTERFACE
 * Determine the API base URL used for all REST requests.
 * Preference order:
 *  - REACT_APP_API_BASE
 *  - REACT_APP_BACKEND_URL
 *  - '' (relative, allows proxying if configured)
 * @returns {string}
 */
export function getApiBaseUrl() {
  const apiBase = getEnv("REACT_APP_API_BASE", "").trim();
  if (apiBase) return apiBase.replace(/\/+$/, "");
  const backend = getEnv("REACT_APP_BACKEND_URL", "").trim();
  if (backend) return backend.replace(/\/+$/, "");
  return "";
}

/**
 * PUBLIC_INTERFACE
 * Parses comma-separated feature flags from REACT_APP_FEATURE_FLAGS
 * (e.g. "mock_api,debug_ui").
 * @returns {Set<string>}
 */
export function getFeatureFlags() {
  const raw = getEnv("REACT_APP_FEATURE_FLAGS", "");
  const flags = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return new Set(flags);
}

/**
 * PUBLIC_INTERFACE
 * Returns boolean env var; accepts "true", "1", "yes".
 * @param {string} key
 * @param {boolean} [fallback]
 * @returns {boolean}
 */
export function getBoolEnv(key, fallback = false) {
  const raw = getEnv(key, "");
  if (!raw) return fallback;
  return ["true", "1", "yes", "y", "on"].includes(raw.toLowerCase());
}

/**
 * PUBLIC_INTERFACE
 * Whether mock API fallback should be allowed when backend is unavailable.
 * Uses feature flag "mock_api" OR REACT_APP_EXPERIMENTS_ENABLED=true.
 * @returns {boolean}
 */
export function allowMockApi() {
  const flags = getFeatureFlags();
  return flags.has("mock_api") || getBoolEnv("REACT_APP_EXPERIMENTS_ENABLED", false);
}
