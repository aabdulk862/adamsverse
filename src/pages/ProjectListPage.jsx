import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
import styles from "./ProjectListPage.module.css";

const TIER_LABELS = {
  "landing-page": "Landing Page",
  "full-stack-application": "Full-Stack Application",
  consulting: "Consulting",
};

export default function ProjectListPage() {
  const { projects, loading, error, fetchProjects } = useProjects();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Projects</h1>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className="auth-guard-spinner" />
          <span>Loading projects…</span>
        </div>
      ) : error ? (
        <div className={styles.error}>
          <i className="fa-solid fa-circle-exclamation" />
          <span>Failed to load projects. Please try again.</span>
        </div>
      ) : projects.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <i className="fa-solid fa-folder-open" />
          </div>
          <h3>No projects yet</h3>
          <p>
            Ready to get started? Pick a service tier and we'll take it from
            there.
          </p>
          <Link to="/services" className={styles.emptyCta}>
            Browse services <i className="fa-solid fa-arrow-right" />
          </Link>
        </div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span className={styles.colName}>
              Name
            </span>
            <span>
              Status
            </span>
            <span className={styles.colTier}>
              Service Tier
            </span>
            <span className={styles.colDate}>
              Last Updated
            </span>
          </div>
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/dashboard/projects/${project.id}`}
              className={styles.row}
            >
              <span className={styles.colName}>
                {project.name}
              </span>
              <span>
                <span
                  className={`dashboard-project-status dashboard-project-status--${project.status?.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {project.status}
                </span>
              </span>
              <span className={styles.colTier}>
                {TIER_LABELS[project.service_tier] || project.service_tier}
              </span>
              <span className={styles.colDate}>
                {project.updated_at
                  ? new Date(project.updated_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
