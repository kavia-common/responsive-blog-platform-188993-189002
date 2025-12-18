import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useApi } from "../state/ApiContext";
import { useAuth } from "../state/AuthContext";
import { Button, ErrorState, Loading } from "../components/ui";

function formatDateTime(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "";
  }
}

function renderMarkdownLite(text) {
  // Minimal renderer: keep it safe (no HTML injection). This is a simple formatting helper.
  // For real apps, use a markdown library and sanitize.
  const lines = String(text || "").split("\n");
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("## ")) return <h2 key={idx} className="h2">{trimmed.slice(3)}</h2>;
    if (trimmed.startsWith("# ")) return <h1 key={idx} className="h1">{trimmed.slice(2)}</h1>;
    if (trimmed.startsWith("> ")) return <blockquote key={idx} className="quote">{trimmed.slice(2)}</blockquote>;
    if (trimmed.startsWith("- ")) return <li key={idx} className="li">{trimmed.slice(2)}</li>;
    if (!trimmed) return <div key={idx} className="spacer" />;
    return <p key={idx} className="p">{line}</p>;
  });
}

/**
 * PUBLIC_INTERFACE
 * Article detail page: shows article, comments, and add comment form.
 */
export default function ArticlePage() {
  const { id } = useParams();
  const api = useApi();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);

  const [loadingArticle, setLoadingArticle] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [error, setError] = useState(null);

  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoadingArticle(true);
      setError(null);
      try {
        const res = await api.getArticle(id);
        const a = res?.article || res?.data?.article || res;
        if (mounted) setArticle(a);
      } catch (e) {
        if (mounted) setError(e);
      } finally {
        if (mounted) setLoadingArticle(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [api, id]);

  const loadComments = useMemo(() => {
    return async () => {
      setLoadingComments(true);
      try {
        const res = await api.listComments(id);
        setComments(res?.comments || res?.data?.comments || []);
      } catch (e) {
        // Comments failing should not hide article; show as error state in comments block.
        setPostError(e);
      } finally {
        setLoadingComments(false);
      }
    };
  }, [api, id]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  async function submitComment(e) {
    e.preventDefault();
    setPostError(null);

    if (!token) {
      // Protected behavior: prompt to login
      navigate("/login", { state: { from: `/article/${id}` } });
      return;
    }

    const trimmed = body.trim();
    if (trimmed.length < 2) {
      setPostError({ message: "Comment is too short." });
      return;
    }

    setPosting(true);
    try {
      await api.addComment(id, { body: trimmed });
      setBody("");
      await loadComments();
    } catch (e2) {
      setPostError(e2);
    } finally {
      setPosting(false);
    }
  }

  if (loadingArticle && !article) return <Loading label="Loading article..." />;

  if (error) {
    return (
      <ErrorState
        title="Failed to load article"
        message={error?.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!article) {
    return <ErrorState title="Article not found" message="This article does not exist." />;
  }

  return (
    <section className="page">
      <div className="breadcrumbs">
        <Link className="link" to="/">
          ← Back to feed
        </Link>
      </div>

      <article className="article">
        <div className="article__meta">
          <span className="badge">{article.category?.name || "Uncategorized"}</span>
          <span className="article__metaText">By {article.author?.name || "Unknown"}</span>
          <span className="article__metaText">{formatDateTime(article.createdAt)}</span>
        </div>

        <h1 className="article__title">{article.title}</h1>
        <div className="article__content">{renderMarkdownLite(article.content)}</div>
      </article>

      <section className="comments">
        <div className="comments__header">
          <h2 className="h2">Comments</h2>
          <Button variant="ghost" onClick={loadComments} disabled={loadingComments}>
            Refresh
          </Button>
        </div>

        {loadingComments ? <Loading label="Loading comments..." /> : null}

        {comments.length === 0 && !loadingComments ? (
          <div className="muted">No comments yet. Be the first to comment.</div>
        ) : null}

        <div className="commentList">
          {comments.map((c) => (
            <div key={c.id} className="comment">
              <div className="comment__top">
                <div className="comment__author">{c.author?.name || "Anonymous"}</div>
                <div className="comment__date">{formatDateTime(c.createdAt)}</div>
              </div>
              <div className="comment__body">{c.body}</div>
            </div>
          ))}
        </div>

        <form className="commentForm" onSubmit={submitComment}>
          <div className="commentForm__title">Add a comment</div>

          {!token ? (
            <div className="callout">
              You need to <Link className="link" to="/login">log in</Link> to post a comment.
            </div>
          ) : null}

          <textarea
            className="textarea"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={token ? "Write your comment..." : "Log in to comment"}
            disabled={!token || posting}
            rows={4}
          />

          {postError ? <div className="formError">{postError.message || "Failed to post comment"}</div> : null}

          <div className="commentForm__actions">
            <Button type="submit" variant="primary" disabled={!token || posting}>
              {posting ? "Posting..." : "Post comment"}
            </Button>
          </div>
        </form>
      </section>
    </section>
  );
}
