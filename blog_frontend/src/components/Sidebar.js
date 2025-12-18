import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Chip, Loading, ErrorState } from "./ui";

/**
 * PUBLIC_INTERFACE
 * Sidebar with category list and quick filter chips.
 */
export default function Sidebar({ categories, loading, error, onRetry }) {
  const location = useLocation();
  const navigate = useNavigate();

  const url = new URL(`http://local${location.pathname}${location.search}`);
  const activeCategory = url.searchParams.get("category") || "";

  function setCategoryFilter(slug) {
    const next = new URL(`http://local${location.pathname}${location.search}`);
    if (slug) next.searchParams.set("category", slug);
    else next.searchParams.delete("category");
    navigate(`/${location.pathname === "/" ? "" : ""}?${next.searchParams.toString()}`.replace(/\/\?/, "/?"));
  }

  return (
    <aside className="sidebar" aria-label="Sidebar categories">
      <div className="sidebar__section">
        <div className="sidebar__title">Categories</div>

        {loading ? <Loading label="Loading categories..." /> : null}

        {error ? (
          <ErrorState
            title="Failed to load categories"
            message={error?.message}
            onRetry={onRetry}
          />
        ) : null}

        {!loading && !error ? (
          <div className="sidebar__chips" role="list">
            <Chip active={!activeCategory} onClick={() => setCategoryFilter("")} title="Show all">
              All
            </Chip>
            {categories.map((c) => (
              <Chip
                key={c.slug || c.id}
                active={activeCategory === c.slug}
                onClick={() => setCategoryFilter(c.slug)}
                title={`Filter by ${c.name}`}
              >
                {c.name}
              </Chip>
            ))}
          </div>
        ) : null}
      </div>

      <div className="sidebar__section">
        <div className="sidebar__title">Browse</div>
        <div className="sidebar__links">
          {categories.map((c) => (
            <Link key={`link-${c.slug || c.id}`} className="sidebar__link" to={`/category/${c.slug}`}>
              {c.name} →
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
