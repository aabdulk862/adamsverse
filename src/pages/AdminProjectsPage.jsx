import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

const PROJECT_STATUSES = [
  "Discovery",
  "In Progress",
  "Review",
  "Revision",
  "Delivered",
  "Closed",
];

export default function AdminProjectsPage() {
  const { loading: authLoading } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [updating, setUpdating] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchErr } = await supabase
        .from("projects")
        .select(
          "id, name, status, service_tier, client_id, created_at, updated_at, profiles:client_id(display_name)",
        )
        .order("updated_at", { ascending: false });

      if (fetchErr) throw fetchErr;
      setProjects(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) fetchProjects();
  }, [authLoading, fetchProjects]);

  const handleStatusUpdate = async (projectId, newStatus) => {
    setUpdating(projectId);
    setUpdateError(null);

    try {
      // Call admin-mutations edge function for status update
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("admin-mutations", {
        body: {
          action: "update_project_status",
          project_id: projectId,
          status: newStatus,
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (res.error) throw res.error;

      // Update local state
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, status: newStatus, updated_at: new Date().toISOString() }
            : p,
        ),
      );
    } catch (err) {
      setUpdateError(`Failed to update project: ${err.message}`);
    } finally {
      setUpdating(null);
    }
  };

  const filtered =
    statusFilter === "all"
      ? projects
      : projects.filter((p) => p.status === statusFilter);

  if (authLoading || loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="auth-guard-spinner" />
          <span>Loading projects…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <h1 className="admin-page-title">Projects</h1>
        <div className="admin-error">
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
          <button onClick={fetchProjects} className="admin-retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-page-title">Projects</h1>
        <Link to="/admin" className="admin-back-link">
          <i className="fa-solid fa-arrow-left" /> Dashboard
        </Link>
      </div>

      {updateError && (
        <div className="admin-error admin-error--inline">
          <i className="fa-solid fa-circle-exclamation" />
          <span>{updateError}</span>
          <button
            onClick={() => setUpdateError(null)}
            className="admin-dismiss-btn"
            aria-label="Dismiss"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      )}

      <div className="admin-toolbar">
        <div className="admin-filter-wrap">
          <label htmlFor="status-filter" className="admin-filter-label">
            Status:
          </label>
          <select
            id="status-filter"
            className="admin-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All ({projects.length})</option>
            {PROJECT_STATUSES.map((s) => {
              const count = projects.filter((p) => p.status === s).length;
              return (
                <option key={s} value={s}>
                  {s} ({count})
                </option>
              );
            })}
          </select>
        </div>
        <span className="admin-result-count">
          {filtered.length} project{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="admin-empty">No projects found</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Client</th>
                <th>Tier</th>
                <th>Status</th>
                <th>Update Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="admin-table-name">{p.name}</td>
                  <td>{p.profiles?.display_name || "—"}</td>
                  <td className="admin-table-tier">
                    {formatTier(p.service_tier)}
                  </td>
                  <td>
                    <span
                      className={`admin-status-badge admin-status--${p.status?.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <select
                      className="admin-status-select"
                      value={p.status}
                      onChange={(e) => handleStatusUpdate(p.id, e.target.value)}
                      disabled={updating === p.id}
                      aria-label={`Update status for ${p.name}`}
                    >
                      {PROJECT_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {updating === p.id && (
                      <span className="admin-updating-indicator" />
                    )}
                  </td>
                  <td className="admin-table-date">
                    {p.updated_at
                      ? new Date(p.updated_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatTier(tier) {
  if (!tier) return "—";
  return tier
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
