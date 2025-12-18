import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";

import Layout from "./components/Layout";
import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import ArticlePage from "./pages/ArticlePage";
import CategoryPage from "./pages/CategoryPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import { AuthProvider } from "./state/AuthContext";
import { ApiProvider, useApi } from "./state/ApiContext";
import { ErrorState, Loading } from "./components/ui";

function CategoryRouteWrapper({ categories }) {
  const { slug } = useMemo(() => {
    // Use params via useLocation? We just render CategoryPage directly in routes; no wrapper needed.
    return { slug: "" };
  }, []);
  void slug;
  return <CategoryPage categories={categories} />;
}

function AppShell() {
  const api = useApi();
  const location = useLocation();

  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState(null);

  // If we are on /category/:slug, also add category query param so HomePage can filter.
  useEffect(() => {
    if (!location.pathname.startsWith("/category/")) return;
    const slug = location.pathname.split("/").filter(Boolean)[1];
    if (!slug) return;

    const url = new URL(`http://local${location.pathname}${location.search}`);
    if (url.searchParams.get("category") === slug) return;

    url.searchParams.set("category", slug);
    // Use history.replaceState without needing navigate (avoid loops)
    window.history.replaceState(null, "", `${location.pathname}?${url.searchParams.toString()}`);
  }, [location.pathname, location.search]);

  async function fetchCategories() {
    setCatLoading(true);
    setCatError(null);
    try {
      const res = await api.listCategories();
      const list = res?.categories || res?.data?.categories || [];
      setCategories(list);
    } catch (e) {
      setCatError(e);
    } finally {
      setCatLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  const sidebar = (
    <Sidebar
      categories={categories}
      loading={catLoading}
      error={catError}
      onRetry={fetchCategories}
    />
  );

  if (catLoading && categories.length === 0) {
    // Still render layout shell, but show loading in main area too.
    return (
      <Layout sidebar={sidebar}>
        <Loading label="Loading..." />
      </Layout>
    );
  }

  return (
    <Layout sidebar={sidebar}>
      <Routes>
        <Route path="/" element={<HomePage categories={categories} />} />
        <Route path="/article/:id" element={<ArticlePage />} />
        <Route path="/category/:slug" element={<CategoryRouteWrapper categories={categories} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="*"
          element={<ErrorState title="Page not found" message="The page you requested does not exist." />}
        />
      </Routes>
    </Layout>
  );
}

// PUBLIC_INTERFACE
function App() {
  /**
   * App root that wires global providers (auth + API) and routing.
   */
  return (
    <AuthProvider>
      <ApiProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </ApiProvider>
    </AuthProvider>
  );
}

export default App;
