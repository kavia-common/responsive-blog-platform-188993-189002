import React, { useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

/**
 * PUBLIC_INTERFACE
 * App header with logo/title, nav, and search. Search updates URL query (?q=...).
 */
export default function Header() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const initialQ = useMemo(() => {
    const url = new URL(`http://local${location.pathname}${location.search}`);
    return url.searchParams.get("q") || "";
  }, [location.pathname, location.search]);

  const [q, setQ] = useState(initialQ);

  function submitSearch(e) {
    e.preventDefault();
    const url = new URL(`http://local/${location.search.startsWith("?") ? location.search.slice(1) : ""}`);
    // Keep existing query params but set q.
    const next = new URL(`http://local${location.pathname}${location.search}`);
    if (q.trim()) next.searchParams.set("q", q.trim());
    else next.searchParams.delete("q");

    // Always search from home feed for clarity.
    navigate(`/?${next.searchParams.toString()}`);
  }

  return (
    <header className="header">
      <div className="header__inner">
        <Link className="brand" to="/">
          <span className="brand__mark" aria-hidden="true">
            B
          </span>
          <span className="brand__text">
            <span className="brand__title">BlueBlog</span>
            <span className="brand__subtitle">Modern, responsive articles</span>
          </span>
        </Link>

        <nav className="nav" aria-label="Primary navigation">
          <NavLink className={({ isActive }) => `nav__link ${isActive ? "nav__link--active" : ""}`} to="/">
            Home
          </NavLink>
        </nav>

        <form className="search" onSubmit={submitSearch} role="search" aria-label="Search articles">
          <input
            className="search__input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search articles..."
            aria-label="Search articles"
          />
          <button className="search__btn" type="submit">
            Search
          </button>
        </form>

        <div className="auth">
          {token ? (
            <>
              <span className="auth__user" title={user?.email || ""}>
                {user?.name || "Signed in"}
              </span>
              <button className="btn btn--ghost" onClick={logout} type="button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn--ghost" to="/login">
                Login
              </Link>
              <Link className="btn btn--primary" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
