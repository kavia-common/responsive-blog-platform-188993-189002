import React, { useEffect, useState } from "react";
import Header from "./Header";

/**
 * PUBLIC_INTERFACE
 * App shell with header and responsive content layout.
 */
export default function Layout({ sidebar, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Close sidebar on Escape
    function onKeyDown(e) {
      if (e.key === "Escape") setSidebarOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="app">
      <Header />

      <div className="layout">
        <button
          className="sidebarToggle"
          type="button"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-expanded={sidebarOpen}
          aria-controls="mobileSidebar"
        >
          {sidebarOpen ? "Close" : "Categories"}
        </button>

        <main className="main" id="main">
          {children}
        </main>

        <div className="sidebarDesktop">{sidebar}</div>

        {sidebar ? (
          <div
            id="mobileSidebar"
            className={`sidebarMobile ${sidebarOpen ? "sidebarMobile--open" : ""}`}
            role="dialog"
            aria-label="Categories"
          >
            <div className="sidebarMobile__overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
            <div className="sidebarMobile__panel">
              <div className="sidebarMobile__header">
                <div className="sidebarMobile__title">Categories</div>
                <button className="btn btn--ghost" type="button" onClick={() => setSidebarOpen(false)}>
                  Close
                </button>
              </div>
              <div className="sidebarMobile__body">{sidebar}</div>
            </div>
          </div>
        ) : null}
      </div>

      <footer className="footer">
        <div className="footer__inner">
          <span>© {new Date().getFullYear()} BlueBlog</span>
          <span className="footer__muted">Light theme • Responsive layout</span>
        </div>
      </footer>
    </div>
  );
}
