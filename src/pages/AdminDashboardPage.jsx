import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import styles from "./Admin.module.css";

export default function AdminDashboardPage() {
  const { profile, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    activeProjects: [],
    pendingInvoices: [],
    recentMessages: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [projectsRes, invoicesRes, messagesRes] = await Promise.all([
        supabase
          .from("projects")
          .select(
            "id, name, status, service_tier, client_id, updated_at, profiles:client_id(display_name)",
          )
          .not("status", "eq", "Closed")
          .order("updated_at", { ascending: false })
          .limit(10),
        supabase
          .from("invoices")
          .select(
            "id, project_id, client_id, status, total_amount, due_date, created_at, profiles:client_id(display_name)",
          )
          .in("status", ["Draft", "Sent", "Overdue"])
          .order("due_date", { ascending: true })
          .limit(10),
        supabase
          .from("messages")
          .select(
            "id, project_id, sender_id, content, created_at, profiles:sender_id(display_name, avatar_url)",
          )
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      if (projectsRes.error) throw projectsRes.error;
      if (invoicesRes.error) throw invoicesRes.error;
      if (messagesRes.error) throw messagesRes.error;

      setStats({
        activeProjects: projectsRes.data || [],
        pendingInvoices: invoicesRes.data || [],
        recentMessages: messagesRes.data || [],
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) fetchAdminData();
  }, [authLoading, fetchAdminData]);

  const pendingTotal = stats.pendingInvoices.reduce(
    (sum, inv) => sum + Number(inv.total_amount || 0),
    0,
  );

  if (authLoading || loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className="auth-guard-spinner" />
          <span>Loading admin dashboard…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <h1 className={styles.pageTitle}>Admin Dashboard</h1>
        <div className={styles.error}>
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
          <button onClick={fetchAdminData} className={styles.retryBtn}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Admin Dashboard</h1>
        <span className={styles.welcome}>
          Welcome, {profile?.display_name?.split(" ")[0] || "Admin"}
        </span>
      </div>

      {/* Quick action links */}
      <div className={styles.quickActions}>
        <Link to="/admin/projects" className={styles.quickAction}>
          <i className="fa-solid fa-folder-open" />
          <span>Manage Projects</span>
        </Link>
        <Link to="/admin/invoices" className={styles.quickAction}>
          <i className="fa-solid fa-file-invoice-dollar" />
          <span>Manage Invoices</span>
        </Link>
        <Link to="/admin/clients" className={styles.quickAction}>
          <i className="fa-solid fa-users" />
          <span>Manage Clients</span>
        </Link>
      </div>

      {/* Summary cards */}
      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIcon} ${styles.summaryIconProjects}`}>
            <i className="fa-solid fa-folder-open" />
          </div>
          <div className={styles.summaryInfo}>
            <span className={styles.summaryValue}>
              {stats.activeProjects.length}
            </span>
            <span className={styles.summaryLabel}>Active Projects</span>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIcon} ${styles.summaryIconInvoices}`}>
            <i className="fa-solid fa-file-invoice-dollar" />
          </div>
          <div className={styles.summaryInfo}>
            <span className={styles.summaryValue}>
              $
              {pendingTotal.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className={styles.summaryLabel}>
              Pending Invoices ({stats.pendingInvoices.length})
            </span>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIcon} ${styles.summaryIconMessages}`}>
            <i className="fa-solid fa-comments" />
          </div>
          <div className={styles.summaryInfo}>
            <span className={styles.summaryValue}>
              {stats.recentMessages.length}
            </span>
            <span className={styles.summaryLabel}>Recent Messages</span>
          </div>
        </div>
      </div>

      {/* Active projects */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Active Projects</h2>
          <Link to="/admin/projects" className={styles.sectionLink}>
            View all <i className="fa-solid fa-arrow-right" />
          </Link>
        </div>
        {stats.activeProjects.length === 0 ? (
          <div className={styles.empty}>No active projects</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Tier</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {stats.activeProjects.map((p) => (
                  <tr key={p.id}>
                    <td className={styles.tableName}>{p.name}</td>
                    <td>{p.profiles?.display_name || "—"}</td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${styles[`status${p.status?.replace(/\s+/g, "")}`] || ""}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className={styles.tableTier}>
                      {formatTier(p.service_tier)}
                    </td>
                    <td className={styles.tableDate}>
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

      {/* Pending invoices */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Pending Invoices</h2>
          <Link to="/admin/invoices" className={styles.sectionLink}>
            View all <i className="fa-solid fa-arrow-right" />
          </Link>
        </div>
        {stats.pendingInvoices.length === 0 ? (
          <div className={styles.empty}>No pending invoices</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.pendingInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.profiles?.display_name || "—"}</td>
                    <td className={styles.tableAmount}>
                      $
                      {Number(inv.total_amount || 0).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${styles[`status${inv.status?.replace(/\s+/g, "")}`] || ""}`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className={styles.tableDate}>
                      {inv.due_date
                        ? new Date(inv.due_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
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

      {/* Recent messages */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Messages</h2>
        </div>
        {stats.recentMessages.length === 0 ? (
          <div className={styles.empty}>No recent messages</div>
        ) : (
          <div className={styles.messagesList}>
            {stats.recentMessages.map((msg) => (
              <div key={msg.id} className={styles.messageRow}>
                <div className={styles.messageAvatar}>
                  {msg.profiles?.avatar_url ? (
                    <img
                      src={msg.profiles.avatar_url}
                      alt=""
                      className={styles.messageAvatarImg}
                    />
                  ) : (
                    <div className={styles.messageAvatarFallback}>
                      {(msg.profiles?.display_name || "?")[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className={styles.messageBody}>
                  <div className={styles.messageMeta}>
                    <span className={styles.messageSender}>
                      {msg.profiles?.display_name || "Unknown"}
                    </span>
                    <span className={styles.messageTime}>
                      {new Date(msg.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className={styles.messageContent}>
                    {msg.content?.length > 120
                      ? msg.content.slice(0, 120) + "…"
                      : msg.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
