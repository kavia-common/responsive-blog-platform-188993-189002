const now = new Date();

function daysAgo(n) {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const mockCategories = [
  { id: "cat-react", name: "React", slug: "react" },
  { id: "cat-design", name: "Design", slug: "design" },
  { id: "cat-product", name: "Product", slug: "product" },
  { id: "cat-engineering", name: "Engineering", slug: "engineering" }
];

export const mockArticles = [
  {
    id: "a1",
    title: "Building a Modern Blog with React",
    excerpt:
      "A practical guide to building a fast, accessible blog UI using routing, global state, and a clean responsive layout.",
    content:
      "## Building a Modern Blog with React\n\nThis is mock content used when the backend is unavailable.\n\n- Responsive layout\n- Centralized API client\n- Auth session\n\n> Enable/disable via REACT_APP_FEATURE_FLAGS=mock_api\n",
    author: { id: "u1", name: "Alex Writer" },
    createdAt: daysAgo(2),
    category: { slug: "react", name: "React" },
    tags: ["react", "frontend"]
  },
  {
    id: "a2",
    title: "Designing with a Light Theme",
    excerpt:
      "How to build a crisp light theme with accessible color contrast and a modern UI feel.",
    content:
      "## Designing with a Light Theme\n\nMock content.\n\nUse a surface color, subtle borders, and strong primary action color.\n",
    author: { id: "u2", name: "Jamie Designer" },
    createdAt: daysAgo(5),
    category: { slug: "design", name: "Design" },
    tags: ["ui", "design"]
  },
  {
    id: "a3",
    title: "Pagination Patterns for Feeds",
    excerpt:
      "Load more vs. numbered pagination: tradeoffs, UX expectations, and implementation tips.",
    content:
      "## Pagination Patterns for Feeds\n\nMock content.\n\nThis template implements simple page-based pagination with an optional Load More.\n",
    author: { id: "u3", name: "Morgan PM" },
    createdAt: daysAgo(8),
    category: { slug: "product", name: "Product" },
    tags: ["product", "ux"]
  }
];

export const mockCommentsByArticleId = {
  a1: [
    {
      id: "c1",
      author: { name: "Sam" },
      body: "This is a great starting point. Love the layout!",
      createdAt: daysAgo(1)
    }
  ],
  a2: [
    {
      id: "c2",
      author: { name: "Taylor" },
      body: "The color palette is clean and readable.",
      createdAt: daysAgo(3)
    }
  ],
  a3: []
};
