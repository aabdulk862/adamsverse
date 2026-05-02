import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function MessagesPage() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchThreads() {
      setLoading(true);
      setError(null);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch client's projects with their messages
        const { data: projects, error: projError } = await supabase
          .from("projects")
          .select(
            `
            id, name, status, updated_at,
            messages ( id, sender_id, content, read, created_at )
          `,
          )
          .order("updated_at", { ascending: false });

        if (projError) {
          setError(projError.message);
          setLoading(false);
          return;
        }

        // Build thread summaries from projects that have messages
        const threadData = (projects || [])
          .map((project) => {
            const msgs = project.messages || [];
            if (msgs.length === 0) return null;

            // Sort messages by created_at descending to get latest
            const sorted = [...msgs].sort(
              (a, b) => new Date(b.created_at) - new Date(a.created_at),
            );
            const lastMessage = sorted[0];

            // Count unread messages not sent by the current user
            const unreadCount = msgs.filter(
              (m) => !m.read && m.sender_id !== user.id,
            ).length;

            return {
              projectId: project.id,
              projectName: project.name,
              projectStatus: project.status,
              lastMessage: lastMessage.content,
              lastMessageAt: lastMessage.created_at,
              unreadCount,
            };
          })
          .filter(Boolean)
          // Sort by most recent message first
          .sort(
            (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt),
          );

        setThreads(threadData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchThreads();
  }, []);

  function formatTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    }
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function truncatePreview(text, maxLen = 80) {
    if (!text) return "No message content";
    return text.length > maxLen ? text.slice(0, maxLen) + "…" : text;
  }

  return (
    <div className="messages-page">
      <h1 className="messages-page-title">Messages</h1>
      <p className="messages-page-subtitle">
        All your project conversations in one place.
      </p>

      {loading ? (
        <div className="dashboard-page-loading">
          <div className="auth-guard-spinner" />
          <span>Loading messages…</span>
        </div>
      ) : error ? (
        <div className="messages-page-error" role="alert">
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
        </div>
      ) : threads.length === 0 ? (
        <div className="dashboard-empty-state">
          <div className="dashboard-empty-icon">
            <i className="fa-solid fa-comments" />
          </div>
          <h3>No messages yet</h3>
          <p>
            Messages from your projects will show up here. Start a project to
            begin a conversation.
          </p>
          <Link to="/services" className="dashboard-empty-cta">
            Browse services <i className="fa-solid fa-arrow-right" />
          </Link>
        </div>
      ) : (
        <div className="messages-thread-list" role="list">
          {threads.map((thread) => (
            <Link
              key={thread.projectId}
              to={`/dashboard/projects/${thread.projectId}`}
              className="messages-thread-row"
              role="listitem"
              aria-label={`${thread.projectName} — ${thread.unreadCount > 0 ? `${thread.unreadCount} unread` : "no unread"} messages`}
            >
              <div className="messages-thread-icon">
                <i className="fa-solid fa-folder-open" />
                {thread.unreadCount > 0 && (
                  <span
                    className="messages-thread-badge"
                    aria-label={`${thread.unreadCount} unread`}
                  >
                    {thread.unreadCount > 99 ? "99+" : thread.unreadCount}
                  </span>
                )}
              </div>

              <div className="messages-thread-content">
                <div className="messages-thread-header">
                  <span className="messages-thread-name">
                    {thread.projectName}
                  </span>
                  <span className="messages-thread-time">
                    {formatTime(thread.lastMessageAt)}
                  </span>
                </div>
                <p
                  className={`messages-thread-preview${thread.unreadCount > 0 ? " messages-thread-preview--unread" : ""}`}
                >
                  {truncatePreview(thread.lastMessage)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
