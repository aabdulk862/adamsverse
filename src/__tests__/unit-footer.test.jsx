import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "../components/Footer";

describe("15.4 Footer", () => {
  const renderFooter = () =>
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

  it("has GitHub, LinkedIn, Email links", () => {
    renderFooter();
    expect(screen.getByLabelText("GitHub")).toBeInTheDocument();
    expect(screen.getByLabelText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("does not have YouTube, Twitch, TikTok, Twitter, Instagram links", () => {
    renderFooter();
    expect(screen.queryByLabelText(/YouTube/i)).toBeNull();
    expect(screen.queryByLabelText(/Twitch/i)).toBeNull();
    expect(screen.queryByLabelText(/TikTok/i)).toBeNull();
    expect(screen.queryByLabelText(/Twitter/i)).toBeNull();
    expect(screen.queryByLabelText(/Instagram/i)).toBeNull();
  });

  it("has copyright text", () => {
    renderFooter();
    expect(screen.getByText(/©/)).toBeInTheDocument();
  });

  it('has "Contact" nav link', () => {
    renderFooter();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });
});
