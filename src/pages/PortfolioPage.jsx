import projects from "../data/projects";

const typeLabels = {
  client: "Client Work",
  personal: "Personal Project",
  training: "Professional Training",
};

const typeOrder = ["client", "training", "personal"];

export default function PortfolioPage() {
  const grouped = typeOrder
    .map((type) => ({
      type,
      label: typeLabels[type],
      projects: projects.filter((p) => p.type === type),
    }))
    .filter((g) => g.projects.length > 0);

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Portfolio</h1>
        <p className="page-subtitle">
          Real projects — client work, open-source tools, and technical deep
          dives. More available on request.
        </p>
      </div>

      {grouped.map((group) => (
        <div key={group.type} className="portfolio-group">
          <h2 className="portfolio-group-title">{group.label}</h2>
          <div className="portfolio-grid">
            {group.projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                featured={project.featured}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectCard({ project, featured = false }) {
  const CardWrapper = project.link ? "a" : "div";
  const linkProps = project.link
    ? {
        href: project.link,
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : {};

  return (
    <CardWrapper
      className={`portfolio-card${project.link ? " portfolio-card--linked" : ""}${featured ? " portfolio-card--featured" : ""}`}
      {...linkProps}
    >
      <div className="portfolio-card-thumb">
        {project.image ? (
          <img src={project.image} alt={`${project.title} thumbnail`} loading="lazy" decoding="async" />
        ) : (
          <div className="portfolio-card-placeholder">
            <span>{project.title.charAt(0)}</span>
          </div>
        )}
      </div>

      <div className="portfolio-card-body">
        <div className="portfolio-card-meta">
          {project.type && (
            <span className={`portfolio-type-badge portfolio-type-badge--${project.type}`}>
              {typeLabels[project.type] || project.type}
            </span>
          )}
        </div>
        <h3 className="portfolio-card-title">{project.title}</h3>
        <p className="portfolio-card-desc">{project.description}</p>
        <div className="portfolio-card-tags">
          {project.tags.map((tag) => (
            <span key={tag} className="portfolio-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {project.link && (
        <span className="portfolio-card-link-icon">
          <i className="fas fa-external-link-alt"></i>
        </span>
      )}
    </CardWrapper>
  );
}
