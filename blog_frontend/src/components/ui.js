import React from "react";

/**
 * PUBLIC_INTERFACE
 * Simple pill/chip component used for categories/tags.
 */
export function Chip({ children, onClick, active = false, title }) {
  return (
    <button
      type="button"
      className={`chip ${active ? "chip--active" : ""}`}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}

/**
 * PUBLIC_INTERFACE
 * Shared loading placeholder.
 */
export function Loading({ label = "Loading..." }) {
  return (
    <div className="state state--loading" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Shared error block.
 */
export function ErrorState({ title = "Something went wrong", message, onRetry }) {
  return (
    <div className="state state--error" role="alert">
      <div className="state__title">{title}</div>
      {message ? <div className="state__message">{message}</div> : null}
      {onRetry ? (
        <button className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Primary button.
 */
export function Button({ children, variant = "primary", ...props }) {
  return (
    <button className={`btn btn--${variant}`} {...props}>
      {children}
    </button>
  );
}
