import { useRef, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  canSubmit,
  recordSubmission,
  getTimeUntilReset,
} from "../lib/rateLimiter";

const RATE_LIMIT_KEY = "contact-form";
const SHEET_URL = import.meta.env.VITE_GOOGLE_SHEET_URL;

export default function ContactPage() {
  const formRef = useRef();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    document.title = "Contact Adverse Solutions — Start a Project";
  }, []);

  // Pre-fill form from URL params (e.g. from package pages)
  useEffect(() => {
    const packageName = searchParams.get("package");
    if (packageName && formRef.current) {
      const themeName = searchParams.get("theme");
      let message = `Hi, I'm interested in the ${packageName} website package`;
      if (themeName) {
        message += ` with the ${themeName} theme`;
      }
      message += ".";

      const messageEl = formRef.current.elements.message;
      if (messageEl) messageEl.value = message;

      const reasonEl = formRef.current.elements.Reason;
      if (reasonEl) reasonEl.value = "Work-Inquiry";
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Honeypot check — silently discard if filled
    const honeypot = formRef.current.elements.website;
    if (honeypot && honeypot.value) {
      setStatus("Message sent! I'll get back to you within 1–2 business days.");
      formRef.current.reset();
      return;
    }

    // Rate limit check
    if (!canSubmit(RATE_LIMIT_KEY)) {
      const waitMs = getTimeUntilReset(RATE_LIMIT_KEY);
      const waitMin = Math.ceil(waitMs / 60000);
      setStatus(
        `You've sent several messages recently. Please wait ${waitMin > 0 ? waitMin : "a few"} minute${waitMin !== 1 ? "s" : ""} before trying again.`,
      );
      return;
    }

    setLoading(true);
    setStatus("");

    const formData = new FormData(formRef.current);
    formData.delete("website"); // strip honeypot

    try {
      await fetch(SHEET_URL, {
        method: "POST",
        body: formData,
      });

      recordSubmission(RATE_LIMIT_KEY);
      setStatus("Message sent! I'll get back to you within 1–2 business days.");
      formRef.current.reset();
    } catch (error) {
      if (!navigator.onLine) {
        setStatus(
          "Network issue — please check your connection and try again.",
        );
      } else {
        setStatus("Unable to send message. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Contact Us</h1>
        <p className="page-subtitle">
          Have a project in mind or want to talk through an idea? I typically
          respond within 24 hours.
        </p>
      </div>

      {/* Contact Info Cards */}
      <div className="contact-info-grid">
        <a href="tel:+17033648616" className="contact-info-card">
          <div className="contact-info-icon">
            <i className="fas fa-phone"></i>
          </div>
          <div className="contact-info-details">
            <span className="contact-info-label">Phone</span>
            <span className="contact-info-value">(703) 364-8616</span>
          </div>
        </a>

        <a href="mailto:adamvmedia@outlook.com" className="contact-info-card">
          <div className="contact-info-icon">
            <i className="fas fa-envelope"></i>
          </div>
          <div className="contact-info-details">
            <span className="contact-info-label">Email</span>
            <span className="contact-info-value">adamvmedia@outlook.com</span>
          </div>
        </a>

        <a
          href="https://linkedin.com/in/adam-abdulkadir"
          target="_blank"
          rel="noopener noreferrer"
          className="contact-info-card"
        >
          <div className="contact-info-icon">
            <i className="fab fa-linkedin"></i>
          </div>
          <div className="contact-info-details">
            <span className="contact-info-label">LinkedIn</span>
            <span className="contact-info-value">adam-abdulkadir</span>
          </div>
        </a>
      </div>

      {/* Contact Form */}
      <div className="email-form-card-wrapper">
        <form ref={formRef} className="email-form" onSubmit={handleSubmit}>
          <h2 className="contact-heading">Get in Touch</h2>
          <p className="contact-intro">
            Fill this out and I'll get back to you within 1–2 business days.
          </p>

          {/* Honeypot field */}
          <input
            name="website"
            tabIndex={-1}
            autoComplete="off"
            style={{ display: "none" }}
            aria-hidden="true"
          />

          <div className="form-row">
            <label htmlFor="contact-name">
              Name
              <input
                id="contact-name"
                type="text"
                name="name"
                placeholder="Enter your name"
                required
                aria-required="true"
              />
            </label>

            <label htmlFor="contact-email">
              Email
              <input
                id="contact-email"
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                aria-required="true"
              />
            </label>
          </div>

          <label htmlFor="contact-phone">
            Phone{" "}
            <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span>
            <input
              id="contact-phone"
              type="tel"
              name="phone"
              placeholder="(123) 456-7890"
              autoComplete="tel"
            />
          </label>

          <label htmlFor="contact-reason">
            Reason
            <select
              id="contact-reason"
              name="Reason"
              required
              aria-required="true"
            >
              <option value="">Select a reason</option>
              <option value="Work-Inquiry">Work Inquiry</option>
              <option value="Collaboration">Collaboration</option>
              <option value="Feedback">Feedback</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label htmlFor="contact-message">
            Message
            <textarea
              id="contact-message"
              name="message"
              placeholder="Write your message here..."
              rows={4}
              required
              aria-required="true"
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Sending...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i> Send Message
              </>
            )}
          </button>

          {status && (
            <div
              role="alert"
              className={
                status.includes("sent")
                  ? "form-status-success"
                  : "form-status-error"
              }
            >
              <i
                className={
                  status.includes("sent")
                    ? "fas fa-check-circle"
                    : "fas fa-exclamation-circle"
                }
              ></i>
              <span>{status}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
