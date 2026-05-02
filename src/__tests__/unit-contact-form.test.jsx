import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ContactPage from "../pages/ContactPage";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    section: ({ children, ...props }) => (
      <section {...filterDomProps(props)}>{children}</section>
    ),
    p: ({ children, ...props }) => <p {...filterDomProps(props)}>{children}</p>,
    h1: ({ children, ...props }) => (
      <h1 {...filterDomProps(props)}>{children}</h1>
    ),
    div: ({ children, ...props }) => (
      <div {...filterDomProps(props)}>{children}</div>
    ),
  },
}));

// Mock global fetch for Google Sheets
const mockFetch = vi.fn();
global.fetch = mockFetch;

function filterDomProps(props) {
  const { initial, animate, transition, whileInView, viewport, ...rest } =
    props;
  return rest;
}

describe("15.6 Contact Form", () => {
  const renderContact = () => {
    vi.stubEnv(
      "VITE_GOOGLE_SHEET_URL",
      "https://script.google.com/macros/s/test/exec",
    );
    return render(
      <MemoryRouter>
        <ContactPage />
      </MemoryRouter>,
    );
  };

  it('has "Get in Touch" heading', () => {
    renderContact();
    expect(screen.getByText("Get in Touch")).toBeInTheDocument();
  });

  it("has form fields: name, email, reason (select), message (textarea)", () => {
    renderContact();
    expect(screen.getByPlaceholderText("Enter your name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    // Reason select
    expect(screen.getByText("Select a reason")).toBeInTheDocument();
    // Message textarea
    expect(
      screen.getByPlaceholderText("Write your message here..."),
    ).toBeInTheDocument();
  });

  it("has submit button", () => {
    renderContact();
    const submitBtn = screen.getByRole("button", { name: /Send Message/i });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toHaveAttribute("type", "submit");
  });
});
