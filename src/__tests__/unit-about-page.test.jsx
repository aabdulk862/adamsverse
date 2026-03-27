import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AboutPage from "../pages/AboutPage";

describe("15.5 About Page", () => {
  const renderAbout = () =>
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

  it('has "Software Engineer • Full-Stack Developer" role descriptor', () => {
    renderAbout();
    expect(
      screen.getByText("Software Engineer • Full-Stack Developer"),
    ).toBeInTheDocument();
  });

  it('does NOT have "Creator • Developer • Entrepreneur"', () => {
    renderAbout();
    expect(screen.queryByText("Creator • Developer • Entrepreneur")).toBeNull();
  });
});
