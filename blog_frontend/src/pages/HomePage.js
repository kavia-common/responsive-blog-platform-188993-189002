import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useApi } from "../state/ApiContext";
import { Chip, ErrorState, Loading, Button } from "../components/ui";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function getQueryParams(location) {
  const url = new URL(`http://local${location.pathname}${location.search}`);
  return {
    q: url.searchParams.get("q") || "",
    category: url.searchParams.get("category") || ""
  };
}

/**
 * PUBLIC_INTERFACE
 * Home feed page: list of articles with pagination and optional filters.
 */
export default function HomePage({ categories }) {
  const api = useApi();
  const location = useLocation();

  const { q, category } = useMemo(() => getQueryParams(location), [location]);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0, pageSize });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [q, category]);

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.listArticles({ page, pageSize, category, q });
        const nextArticles = res?.articles || res?.data?.articles || [];
        const nextMeta = res?.meta || { page, pageSize, totalPages: 1, total: nextArticles.length };

        if (!mounted) return;

        // If page=1, replace; else append (Load More)
        if (page === 1) setItems(nextArticles);
        else setItems((prev) => [...prev, ...nextArticles]);

        setMeta({
          page: nextMeta.page || page,
          pageSize: nextMeta.pageSize || pageSize,
          total: nextMeta.total ?? nextArticles.length,
          totalPages: nextMeta.totalPages || 1
        });
      } catch (e) {
        if (!mounted) return;
        setError(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [api, page, pageSize, category, q]);

  const categoryName = useMemo(() => {
    if (!category) return "";
    const found = (categories || []).find((c) => c.slug === category);
    return found?.name || category;
  }, [categories, category]);

  const canLoadMore = meta.page < meta.totalPages;

  return (
    <section className="page">
      <div className="page__header">
        <h1 className="h1">Latest Articles</h1>
        <div className="page__meta">
          {q ? <span className="badge">Search: “{q}”</span> : null}
          {category ? <span className="badge">Category: {categoryName}</span> : null}
        </div>
      </div>

      {error ? (
        <ErrorState
          title="Failed to load articles"
          message={error?.message}
          onRetry={() => setPage(1)}
        />
      ) : null}

      {items.length === 0 && loading ? <Loading label="Loading articles..." /> : null}

      <div className="feed">
        {items.map((a) => (
          <article key={a.id} className="card">
            <div className="card__top">
              <div className="card__chips">
                <Chip active title="Category">
                  {a.category?.name || "Uncategorized"}
                </Chip>
              </div>
              <div className="card__date">{formatDate(a.createdAt)}</div>
            </div>

            <h2 className="card__title">
              <Link className="link" to={`/article/${a.id}`}>
                {a.title}
              </Link>
            </h2>

            <p className="card__excerpt">{a.excerpt}</p>

            <div className="card__footer">
              <div className="card__author">By {a.author?.name || "Unknown"}</div>
              <Link className="btn btn--ghost" to={`/article/${a.id}`}>
                Read →
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="pagination">
        <div className="pagination__left">
          <Button
            variant="ghost"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </Button>
          <span className="pagination__meta">
            Page {meta.page} / {meta.totalPages}
          </span>
          <Button
            variant="ghost"
            disabled={page >= meta.totalPages || loading}
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
          >
            Next
          </Button>
        </div>

        <div className="pagination__right">
          <Button
            variant="primary"
            disabled={!canLoadMore || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            {loading && items.length ? "Loading..." : canLoadMore ? "Load more" : "No more"}
          </Button>
        </div>
      </div>
    </section>
  );
}
