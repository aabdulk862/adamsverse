import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";

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
    <div className="project-list-page">
      <div className="project-list-header">
        <h1 className="project-list-title">Projects</h1>
      </div>

      {loading ? (
        <div className="project-list-loading">
          <div className="auth-guard-spinner" />
          <span>Loading projects…</span>
        </div>
      ) : error ? (
        <div className="project-list-error">
          <i className="fa-solid fa-circle-exclamation" />
          <span>Failed to load projects. Please try again.</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="project-list-empty">
          <div className="project-list-empty-icon">
            <i className="fa-solid fa-folder-open" />
          </div>
          <h3>No projects yet</h3>
          <p>
            Ready to get started? Pick a service tier and we'll take it from
            there.
          </p>
          <Link to="/services" className="project-list-empty-cta">
            Browse services <i className="fa-solid fa-arrow-right" />
          </Link>
        </div>
      ) : (
        <div className="project-list-table">
          <div className="project-list-table-header">
            <span className="project-list-col project-list-col--name">
              Name
            </span>
            <span className="project-list-col project-list-col--status">
              Status
            </span>
            <span className="project-list-col project-list-col--tier">
              Service Tier
            </span>
            <span className="project-list-col project-list-col--date">
              Last Updated
            </span>
          </div>
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/dashboard/projects/${project.id}`}
              className="project-list-row"
            >
              <span className="project-list-col project-list-col--name">
                {project.name}
              </span>
              <span className="project-list-col project-list-col--status">
                <span
                  className={`dashboard-project-status dashboard-project-status--${project.status?.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {project.status}
                </span>
              </span>
              <span className="project-list-col project-list-col--tier">
                {TIER_LABELS[project.service_tier] || project.service_tier}
              </span>
              <span className="project-list-col project-list-col--date">
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
