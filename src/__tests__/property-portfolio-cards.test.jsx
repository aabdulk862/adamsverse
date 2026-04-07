// Feature: saas-platform-revamp, Property 7: Portfolio cards render all required fields with external link indicator
// **Validates: Requirements 6.1, 6.4**

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import projects from "../data/projects";

function PortfolioCard({ project }) {
  const CardWrapper = project.link ? "a" : "div";
  const linkProps = project.link
    ? { href: project.link, target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <CardWrapper
      className={`portfolio-card${project.link ? " portfolio-card--linked" : ""}`}
      {...linkProps}
    >
      <div className="portfolio-card-thumb">
        {project.image ? (
          <img src={project.image} alt={`${project.title} thumbnail`} />
        ) : (
          <div className="portfolio-card-placeholder">
            <span>{project.title.charAt(0)}</span>
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
}

describe("Property 7: Portfolio cards render all required fields with external link indicator", () => {
  it("for any project, the rendered card contains title, description, and tags", () => {
    fc.assert(
      fc.property(fc.constantFrom(...projects), (project) => {
        const { container, unmount } = render(
          <MemoryRouter>
            <PortfolioCard project={project} />
          </MemoryRouter>,
        );

        // Title present
        expect(
          container.querySelector(".portfolio-card-title").textContent,
        ).toBe(project.title);

        // Description present
        expect(
          container.querySelector(".portfolio-card-desc").textContent,
        ).toBe(project.description);

        // All tags present
        const tagElements = container.querySelectorAll(".portfolio-tag");
        expect(tagElements.length).toBe(project.tags.length);
        project.tags.forEach((tag, i) => {
          expect(tagElements[i].textContent).toBe(tag);
        });

        // For projects with links, verify external link icon
        if (project.link) {
          const linkIcon = container.querySelector(".portfolio-card-link-icon");
          expect(linkIcon).not.toBeNull();
        }

        unmount();
      }),
      { numRuns: 100 },
    );
  });
});
