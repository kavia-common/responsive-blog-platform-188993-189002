import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import HomePage from "./HomePage";

/**
 * PUBLIC_INTERFACE
 * Category page: delegates to HomePage by using URL query param "category".
 * Since routing already supports /category/:slug, we render a filtered feed.
 */
export default function CategoryPage({ categories }) {
  const { slug } = useParams();

  const title = useMemo(() => {
    const found = (categories || []).find((c) => c.slug === slug);
    return found?.name || slug;
  }, [categories, slug]);

  return (
    <section className="page">
      <div className="hero">
        <div className="hero__title">Category: {title}</div>
        <div className="hero__subtitle">Browse articles in this category</div>
      </div>

      {/* Reuse home feed; HomePage reads category from query param, so we also pass categories */}
      <HomePage categories={categories} />
    </section>
  );
}
