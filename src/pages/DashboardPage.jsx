import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useSupabaseClient } from "../hooks/useSupabaseClient";
import { useProjects } from "../hooks/useProjects";
import { useInvoices } from "../hooks/useInvoices";
import { useNotifications } from "../hooks/useNotifications";
import styles from "./DashboardPage.module.css";

const STATUS_CLASS_MAP = {
  discovery: "projectStatusDiscovery",
  "in-progress": "projectStatusInProgress",
  review: "projectStatusReview",
  revision: "projectStatusRevision",
  delivered: "projectStatusDelivered",
  closed: "projectStatusClosed",
};

export default function DashboardPage() {
  const { user } = useUser();
  const { userId } = useAuth();
  const supabase = useSupabaseClient();
  const { projects, loading: projectsLoading, fetchProjects } = useProjects();
  const { invoices, loading: invoicesLoading, fetchInvoices } = useInvoices();
  const {
    unreadMessages,
    loading: notificationsLoading,
    fetchNotifications,
  } = useNotifications();

  const [pendingConfigToast, setPendingConfigToast] = useState(null);
  const pendingConfigChecked = useRef(false);

  useEffect(() => {
    fetchProjects();
    fetchInvoices();
    fetchNotifications();
  }, [fetchProjects, fetchInvoices, fetchNotifications]);

  // Check for pending config from unauthenticated builder handoff
  useEffect(() => {
    if (pendingConfigChecked.current || !userId) return;
    pendingConfigChecked.current = true;

    const pending = localStorage.getItem("webuilder_pending_config");
    if (!pending) return;

    let config;
    try {
      config = JSON.parse(pending);
    } catch {
      // Invalid JSON — clear it silently
      localStorage.removeItem("webuilder_pending_config");
      return;
    }

    supabase
      .from("projects")
      .insert({
        client_id: userId,
        name: config.name || "Custom Website",
        service_tier: config.category || "Professional",
        intake_data: config,
        status: "active",
      })
      .then(({ error }) => {
        if (!error) {
          localStorage.removeItem("webuilder_pending_config");
          setPendingConfigToast("success");
          fetchProjects();
          setTimeout(() => setPendingConfigToast(null), 5000);
        } else {
          setPendingConfigToast("error");
          setTimeout(() => setPendingConfigToast(null), 5000);
        }
      });
  }, [userId, supabase, fetchProjects]);

  const activeProjects = projects.filter(
    (p) => p.status !== "Closed" && p.status !== "Delivered",
  );

  const outstandingInvoices = invoices.filter(
    (inv) => inv.status === "Sent" || inv.status === "Overdue",
  );
  const outstandingTotal = outstandingInvoices.reduce(
    (sum, inv) => sum + Number(inv.total_amount || 0),
    0,
  );
  const nextDueInvoice = outstandingInvoices
    .filter((inv) => inv.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];

  const loading = projectsLoading || invoicesLoading || notificationsLoading;
  const displayName = user?.fullName || "there";
  const firstName = displayName.split(" ")[0];

  const getStatusClass = (status) => {
    const key = status?.toLowerCase().replace(/\s+/g, "-");
    const className = STATUS_CLASS_MAP[key];
    return className ? `${styles.projectStatus} ${styles[className]}` : styles.projectStatus;
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.greeting}>Welcome back, {firstName}</h1>

      {pendingConfigToast === "success" && (
        <div className={styles.toastSuccess} role="status">
          <i className="fa-solid fa-circle-check" />
          <span>Your website project has been created from the builder!</span>
        </div>
      )}

      {pendingConfigToast === "error" && (
        <div className={styles.toastError} role="alert">
          <i className="fa-solid fa-circle-exclamation" />
          <span>Could not create project from your builder config. Please try again later.</span>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>
          <div className="auth-guard-spinner" />
          <span>Loading your dashboard…</span>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className={styles.summaryCards}>
            <div className={styles.summaryCard}>
              <div className={`${styles.summaryIcon} ${styles.summaryIconProjects}`}>
                <i className="fa-solid fa-folder-open" />
              </div>
              <div className={styles.summaryInfo}>
                <span className={styles.summaryValue}>
                  {activeProjects.length}
                </span>
                <span className={styles.summaryLabel}>Active Projects</span>
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={`${styles.summaryIcon} ${styles.summaryIconBilling}`}>
                <i className="fa-solid fa-file-invoice-dollar" />
              </div>
              <div className={styles.summaryInfo}>
                <span className={styles.summaryValue}>
                  $
                  {outstandingTotal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className={styles.summaryLabel}>
                  {nextDueInvoice
                    ? `Due ${new Date(nextDueInvoice.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                    : "Outstanding Balance"}
                </span>
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={`${styles.summaryIcon} ${styles.summaryIconMessages}`}>
                <i className="fa-solid fa-comments" />
              </div>
              <div className={styles.summaryInfo}>
                <span className={styles.summaryValue}>
                  {unreadMessages}
                  {unreadMessages > 0 && (
                    <span className={styles.summaryBadge}>
                      {unreadMessages}
                    </span>
                  )}
                </span>
                <span className={styles.summaryLabel}>Unread Messages</span>
              </div>
            </div>
          </div>

          {/* Recent projects or empty state */}
          <div className={styles.recentSection}>
            <div className={styles.recentHeader}>
              <h2 className={styles.recentTitle}>Recent Projects</h2>
              {activeProjects.length > 0 && (
                <Link
                  to="/dashboard/projects"
                  className={styles.recentLink}
                >
                  View all <i className="fa-solid fa-arrow-right" />
                </Link>
              )}
            </div>

            {projects.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <i className="fa-solid fa-rocket" />
                </div>
                <h3 className={styles.emptyTitle}>No projects yet</h3>
                <p className={styles.emptyText}>
                  Ready to bring your idea to life? Pick a service tier and
                  let's get started.
                </p>
                <Link to="/services" className={styles.emptyCta}>
                  Start a new project <i className="fa-solid fa-arrow-right" />
                </Link>
              </div>
            ) : (
              <div className={styles.projectsList}>
                {projects.slice(0, 5).map((project) => (
                  <Link
                    key={project.id}
                    to={`/dashboard/projects/${project.id}`}
                    className={styles.projectRow}
                  >
                    <div className={styles.projectName}>{project.name}</div>
                    <div className={styles.projectMeta}>
                      <span className={getStatusClass(project.status)}>
                        {project.status}
                      </span>
                      <span className={styles.projectDate}>
                        {project.updated_at
                          ? new Date(project.updated_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )
                          : "—"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
