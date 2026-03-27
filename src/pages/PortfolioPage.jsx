import projects from "../data/projects";

export default function PortfolioPage() {
  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Portfolio</h1>
        <p className="page-subtitle">
          A selection of projects showcasing our development expertise and
          technical capabilities.
        </p>
      </div>

      <div className="portfolio-grid">
        {projects.map((project) => {
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
              key={project.id}
              className={`portfolio-card${project.link ? " portfolio-card--linked" : ""}`}
              {...linkProps}
            >
              <div className="portfolio-card-thumb">
                {project.image ? (
                  <img src={project.image} alt={`${project.title} thumbnail`} />
                ) : (
                  <div className="portfolio-card-placeholder">
                    <i className="fas fa-code"></i>
                  </div>
                )}
              </div>

              <div className="portfolio-card-body">
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
        })}
      </div>
    </div>
  );
}
