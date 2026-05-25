import projects from "../data/projects";
import styles from "./ProjectsPage.module.css";

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
        <h1 className="page-title">Projects</h1>
        <p className="page-subtitle">
          Real projects — client work, open-source tools, and technical deep
          dives. More available on request.
        </p>
      </div>

      {grouped.map((group) => (
        <div key={group.type} className={styles.group}>
          <h2 className={styles.groupTitle}>{group.label}</h2>
          <div className={styles.grid}>
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
      className={`${styles.card}${project.link ? ` ${styles.cardLinked}` : ""}${featured ? ` ${styles.cardFeatured}` : ""}`}
      {...linkProps}
    >
      <div className={styles.cardThumb}>
        {project.image ? (
          <img
            src={project.image}
            alt={`${project.title} thumbnail`}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className={styles.cardPlaceholder}>
            <span>{project.title.charAt(0)}</span>
          </div>
        )}
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          {project.type && (
            <span
              className={`${styles.typeBadge} ${styles[`typeBadge${project.type.charAt(0).toUpperCase() + project.type.slice(1)}`] || ""}`}
            >
              {typeLabels[project.type] || project.type}
            </span>
          )}
        </div>
        <h3 className={styles.cardTitle}>{project.title}</h3>
        <p className={styles.cardDesc}>{project.description}</p>
        <div className={styles.cardTags}>
          {project.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {project.link && (
        <span className={styles.cardLinkIcon}>
          <i className="fas fa-external-link-alt"></i>
        </span>
      )}
    </CardWrapper>
  );
}
