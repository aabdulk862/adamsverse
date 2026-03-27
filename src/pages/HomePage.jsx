import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import emailjs from "emailjs-com";
import ProfileHeader from "../components/ProfileHeader";
import Section from "../components/Section";
import services from "../data/services";
import projects from "../data/projects";

export default function HomePage() {
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

  const serviceIcons = {
    "web-app-development": "fas fa-code",
    "content-creation": "fas fa-pen-nib",
    consulting: "fas fa-lightbulb",
    "add-ons": "fas fa-puzzle-piece",
  };

  const topServices = services.slice(0, 4);
  const topProjects = projects.slice(0, 4);

  return (
    <div className="container">
      <ProfileHeader />

      {/* Services Overview */}
      <Section title="Services" id="services-overview">
        <div className="home-services-grid">
          {topServices.map((service) => (
            <div key={service.id} className="home-service-card">
              <div className="home-service-icon">
                <i
                  className={
                    service.icon || serviceIcons[service.id] || "fas fa-cog"
                  }
                ></i>
              </div>
              <h3 className="home-service-title">{service.title}</h3>
              <p className="home-service-desc">{service.description}</p>
              <Link to="/services" className="home-service-link">
                Learn More <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          ))}
        </div>
      </Section>

      {/* Portfolio Highlights */}
      <Section title="Projects" id="portfolio-highlights">
        <div className="home-portfolio-grid">
          {topProjects.map((project) => (
            <a
              key={project.id}
              href={project.link}
              target={project.link?.startsWith("http") ? "_blank" : undefined}
              rel={
                project.link?.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined
              }
              className="home-portfolio-card"
            >
              <div className="home-portfolio-thumb">
                {project.image ? (
                  <img src={project.image} alt={project.title} />
                ) : (
                  <div className="home-portfolio-placeholder">
                    <i className="fas fa-folder-open"></i>
                  </div>
                )}
              </div>
              <div className="home-portfolio-body">
                <h3 className="home-portfolio-title">
                  {project.title}
                  {project.link && (
                    <i className="fas fa-external-link-alt home-portfolio-link-icon"></i>
                  )}
                </h3>
                <p className="home-portfolio-desc">{project.description}</p>
                <div className="home-portfolio-tags">
                  {project.tags.map((tag) => (
                    <span key={tag} className="home-portfolio-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      </Section>

      {/* Contact Section */}
      <Section title="Contact" id="contact">
        <div className="email-form-card-wrapper">
          <form ref={formRef} className="email-form" onSubmit={handleSubmit}>
            <h2 className="contact-heading">Get in Touch</h2>
            <p className="contact-intro">
              Have a project in mind or need technical expertise? Share your
              requirements and I'll get back to you with a tailored solution.
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
      </Section>
    </div>
  );
}
