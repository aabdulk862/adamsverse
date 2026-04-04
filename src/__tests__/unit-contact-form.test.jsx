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

// Mock emailjs-com
vi.mock("emailjs-com", () => ({
  default: { sendForm: vi.fn() },
}));

function filterDomProps(props) {
  const { initial, animate, transition, whileInView, viewport, ...rest } =
    props;
  return rest;
}

describe("15.6 Contact Form", () => {
  const renderContact = () => {
    // Set EmailJS env vars so envReady stays true and the form renders
    vi.stubEnv("VITE_EMAILJS_SERVICE_ID", "test_service");
    vi.stubEnv("VITE_EMAILJS_TEMPLATE_ID", "test_template");
    vi.stubEnv("VITE_EMAILJS_PUBLIC_KEY", "test_key");
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
