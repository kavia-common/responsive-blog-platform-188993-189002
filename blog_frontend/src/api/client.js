import { allowMockApi, getApiBaseUrl } from "../config/env";
import {
  mockAddComment,
  mockAuthLogin,
  mockAuthRegister,
  mockGetArticle,
  mockListArticles,
  mockListCategories,
  mockListComments
} from "../mocks/mockApi";

/**
 * @typedef {Object} ApiErrorShape
 * @property {number} status
 * @property {string} message
 * @property {any} [details]
 */

function joinUrl(base, path) {
  const b = (base || "").replace(/\/+$/, "");
  const p = (path || "").replace(/^\/+/, "");
  if (!b) return `/${p}`;
  return `${b}/${p}`;
}

async function safeParseJson(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function makeApiError(status, message, details) {
  /** @type {ApiErrorShape} */
  const err = new Error(message);
  err.status = status;
  err.details = details;
  return err;
}

/**
 * PUBLIC_INTERFACE
 * Create an API client used by the app. All REST calls should go through this client.
 * @param {{ getToken: () => (string|null) }} opts
 */
export function createApiClient({ getToken }) {
  const baseUrl = getApiBaseUrl();

  async function request(method, path, body) {
    const url = joinUrl(baseUrl, path);
    const token = getToken?.() || null;

    const headers = { Accept: "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Bearer ${token}`;

    let res;
    try {
      res = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined
      });
    } catch (e) {
      // Network error: optionally fall back to mock API.
      const canMock = allowMockApi();
      if (canMock) {
        const mocked = await routeToMock(method, path, body);
        return mocked;
      }
      throw makeApiError(0, "Network error: backend is unreachable", { originalError: String(e) });
    }

    if (!res.ok) {
      const parsed = await safeParseJson(res);
      const message =
        (parsed && (parsed.message || parsed.error)) ||
        `Request failed (${res.status})`;
      throw makeApiError(res.status, message, parsed);
    }

    const parsed = await safeParseJson(res);
    return parsed;
  }

  // Map placeholder REST endpoints to mock implementations.
  async function routeToMock(method, path, body) {
    // articles list
    if (method === "GET" && path.startsWith("/api/articles")) {
      // /api/articles or /api/articles/:id
      const parts = path.split("?")[0].split("/").filter(Boolean); // ["api","articles",":id?"]
      const id = parts.length >= 3 ? parts[2] : null;
      if (id) return mockGetArticle(id);
      // query params
      const url = new URL(`http://local${path}`);
      const page = Number(url.searchParams.get("page") || 1);
      const pageSize = Number(url.searchParams.get("pageSize") || 10);
      const category = url.searchParams.get("category") || "";
      const q = url.searchParams.get("q") || "";
      return mockListArticles({ page, pageSize, category, q });
    }

    if (method === "GET" && path === "/api/categories") {
      return mockListCategories();
    }

    // comments
    if (method === "GET" && path.startsWith("/api/articles/") && path.endsWith("/comments")) {
      const parts = path.split("/").filter(Boolean);
      const articleId = parts[2];
      return mockListComments(articleId);
    }

    if (method === "POST" && path.startsWith("/api/articles/") && path.endsWith("/comments")) {
      const parts = path.split("/").filter(Boolean);
      const articleId = parts[2];
      return mockAddComment(articleId, body || {});
    }

    // auth
    if (method === "POST" && path === "/api/auth/login") {
      return mockAuthLogin(body || {});
    }
    if (method === "POST" && path === "/api/auth/register") {
      return mockAuthRegister(body || {});
    }

    throw makeApiError(404, "Mock route not implemented", { method, path });
  }

  return {
    // PUBLIC_INTERFACE
    async listArticles({ page = 1, pageSize = 10, category = "", q = "" } = {}) {
      const qs = new URLSearchParams();
      if (page) qs.set("page", String(page));
      if (pageSize) qs.set("pageSize", String(pageSize));
      if (category) qs.set("category", category);
      if (q) qs.set("q", q);
      const suffix = qs.toString() ? `?${qs.toString()}` : "";
      return request("GET", `/api/articles${suffix}`);
    },

    // PUBLIC_INTERFACE
    async getArticle(id) {
      return request("GET", `/api/articles/${encodeURIComponent(id)}`);
    },

    // PUBLIC_INTERFACE
    async listCategories() {
      return request("GET", "/api/categories");
    },

    // PUBLIC_INTERFACE
    async listComments(articleId) {
      return request("GET", `/api/articles/${encodeURIComponent(articleId)}/comments`);
    },

    // PUBLIC_INTERFACE
    async addComment(articleId, { body }) {
      return request("POST", `/api/articles/${encodeURIComponent(articleId)}/comments`, { body });
    },

    // PUBLIC_INTERFACE
    async login({ email, password }) {
      return request("POST", "/api/auth/login", { email, password });
    },

    // PUBLIC_INTERFACE
    async register({ name, email, password }) {
      return request("POST", "/api/auth/register", { name, email, password });
    }
  };
}
