import { useRef, useState } from "react";
import emailjs from "emailjs-com";

export default function ContactPage() {
  const formRef = useRef();
  const [status, setStatus] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        formRef.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      )
      .then(
        (result) => {
          console.log(result.text);
          setStatus("Message sent successfully!");
          formRef.current.reset();
        },
        (error) => {
          console.error(error.text);
          setStatus("Failed to send message. Please try again later.");
        },
      );
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Contact</h1>
        <p className="page-subtitle">
          Got a project or question? Let's talk.
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

        <a
          href="https://github.com/aabdulk862"
          target="_blank"
          rel="noopener noreferrer"
          className="contact-info-card"
        >
          <div className="contact-info-icon">
            <i className="fab fa-github"></i>
          </div>
          <div className="contact-info-details">
            <span className="contact-info-label">GitHub</span>
            <span className="contact-info-value">aabdulk862</span>
          </div>
        </a>
      </div>

      {/* Contact Form */}
      <div className="email-form-card-wrapper">
        <form ref={formRef} className="email-form" onSubmit={handleSubmit}>
          <h2 className="contact-heading">Get in Touch</h2>
          <p className="contact-intro">
            Drop a message and I'll get back to you.
          </p>

          <div className="form-row">
            <label>
              Name
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
              />
            </label>
          </div>

          <label>
            Reason
            <select name="Reason" required>
              <option value="">Select a reason</option>
              <option value="Work-Inquiry">Work Inquiry</option>
              <option value="Collaboration">Collaboration</option>
              <option value="Feedback">Feedback</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label>
            Message
            <textarea
              name="message"
              placeholder="Write your message here..."
              rows={4}
              required
            />
          </label>

          <button type="submit">
            <i className="fas fa-paper-plane"></i> Send Message
          </button>

          {status && (
            <div
              className={
                status.includes("success")
                  ? "form-status-success"
                  : "form-status-error"
              }
            >
              <i
                className={
                  status.includes("success")
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
