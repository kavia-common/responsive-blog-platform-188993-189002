import { mockArticles, mockCategories, mockCommentsByArticleId } from "./mockData";

/**
 * A tiny in-memory mock API. It intentionally mimics the shape of real API calls.
 * All methods return Promises to match network behavior.
 */

function normalizeQuery(q) {
  return (q || "").trim().toLowerCase();
}

function paginate(items, page, pageSize) {
  const p = Math.max(1, page || 1);
  const size = Math.max(1, pageSize || 10);
  const start = (p - 1) * size;
  const end = start + size;
  const slice = items.slice(start, end);
  return {
    items: slice,
    page: p,
    pageSize: size,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / size))
  };
}

/**
 * PUBLIC_INTERFACE
 * List categories.
 */
export function mockListCategories() {
  return Promise.resolve({ categories: mockCategories });
}

/**
 * PUBLIC_INTERFACE
 * List articles with optional pagination and filtering.
 * @param {{page?:number,pageSize?:number,category?:string,q?:string}} params
 */
export function mockListArticles(params = {}) {
  const q = normalizeQuery(params.q);
  const category = (params.category || "").trim().toLowerCase();

  let filtered = [...mockArticles];
  if (category) filtered = filtered.filter((a) => a.category.slug === category);
  if (q) {
    filtered = filtered.filter((a) => {
      const hay = `${a.title} ${a.excerpt} ${a.author?.name || ""} ${a.category?.name || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }

  const { items, ...meta } = paginate(filtered, params.page, params.pageSize);
  return Promise.resolve({ articles: items, meta });
}

/**
 * PUBLIC_INTERFACE
 * Get one article by id.
 * @param {string} id
 */
export function mockGetArticle(id) {
  const found = mockArticles.find((a) => a.id === id);
  if (!found) {
    const err = new Error("Article not found");
    err.status = 404;
    return Promise.reject(err);
  }
  return Promise.resolve({ article: found });
}

/**
 * PUBLIC_INTERFACE
 * List comments for an article.
 * @param {string} articleId
 */
export function mockListComments(articleId) {
  const items = mockCommentsByArticleId[articleId] || [];
  return Promise.resolve({ comments: items });
}

/**
 * PUBLIC_INTERFACE
 * Add a comment to an article (requires a token in real API; mock accepts authorName).
 * @param {string} articleId
 * @param {{body:string, authorName?:string}} payload
 */
export function mockAddComment(articleId, payload) {
  const body = (payload?.body || "").trim();
  if (!body) {
    const err = new Error("Comment body is required");
    err.status = 400;
    return Promise.reject(err);
  }

  const newComment = {
    id: `c_${Math.random().toString(16).slice(2)}`,
    author: { name: payload?.authorName || "Guest" },
    body,
    createdAt: new Date().toISOString()
  };

  if (!mockCommentsByArticleId[articleId]) mockCommentsByArticleId[articleId] = [];
  mockCommentsByArticleId[articleId].unshift(newComment);

  return Promise.resolve({ comment: newComment });
}

/**
 * PUBLIC_INTERFACE
 * Mock login/register.
 */
export function mockAuthLogin({ email, password }) {
  if (!email || !password) {
    const err = new Error("Email and password are required");
    err.status = 400;
    return Promise.reject(err);
  }
  return Promise.resolve({
    token: "mock-token",
    user: { id: "mock-user", name: email.split("@")[0] || "User", email }
  });
}

/**
 * PUBLIC_INTERFACE
 * Mock register.
 */
export function mockAuthRegister({ name, email, password }) {
  if (!name || !email || !password) {
    const err = new Error("Name, email and password are required");
    err.status = 400;
    return Promise.reject(err);
  }
  return Promise.resolve({
    token: "mock-token",
    user: { id: "mock-user", name, email }
  });
}
