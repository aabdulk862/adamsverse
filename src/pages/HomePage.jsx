import { Link } from "react-router-dom";
import ProfileHeader from "../components/ProfileHeader";
import Section from "../components/Section";
import AnimatedSection from "../components/AnimatedSection";
import services from "../data/services";
import clients from "../data/clients";

const metrics = [
  { value: "10+", label: "Projects Delivered" },
  { value: "100%", label: "Client Satisfaction" },
  { value: "5+", label: "Years Experience" },
  { value: "< 48hr", label: "Response Time" },
];

const values = [
  {
    icon: "fas fa-handshake",
    title: "Honest Work",
    desc: "No fluff, no upsells. We scope it right, build it clean, and ship it on time.",
  },
  {
    icon: "fas fa-layer-group",
    title: "Full-Stack Ownership",
    desc: "From database to deploy, one team handles the whole stack. No handoff gaps.",
  },
  {
    icon: "fas fa-bolt",
    title: "Built to Last",
    desc: "We write code that scales and stays maintainable long after launch day.",
  },
  {
    icon: "fas fa-comments",
    title: "Clear Communication",
    desc: "You'll always know where things stand. No jargon, no disappearing acts.",
  },
];

export default function HomePage() {
  const serviceIcons = {
    "landing-page": "fas fa-window-maximize",
    "full-stack-application": "fas fa-code",
    consulting: "fas fa-lightbulb",
  };

  const topServices = services.slice(0, 3);

  return (
    <div className="container">
      <div className="hero-viewport">
        <ProfileHeader />
      </div>

      {/* Social Proof Metrics Bar */}
      <div className="social-proof-bar">
        {metrics.map((metric, index) => (
          <AnimatedSection key={metric.label} delay={index * 0.1} className="social-proof-metric">
            <span className="social-proof-value">{metric.value}</span>
            <span className="social-proof-label">{metric.label}</span>
          </AnimatedSection>
        ))}
      </div>

      {/* Services Overview */}
      <Section
        title="Services"
        subtitle="Straightforward pricing. No scope creep. Pick what fits."
        id="services-overview"
        className="home-section"
      >
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
              <span className="home-service-price">{service.priceRange}</span>
              <Link to="/services" className="home-service-link">
                Learn More <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          ))}
        </div>
      </Section>

      {/* AI Tooling Banner */}
      <div className="ai-cta-banner">
        <div className="ai-cta-text">
          <p className="ai-cta-headline">AI won't replace good taste.</p>
          <p className="ai-cta-sub">
            We keep up with the tools so you don't have to — and we know when to use them.
          </p>
        </div>
        <Link to="/services" className="ai-cta-link">
          See services <i className="fas fa-arrow-right"></i>
        </Link>
      </div>

      {/* Testimonials / Client Proof */}
      <AnimatedSection>
        <Section
          title="Clients"
          subtitle="Real work for real businesses. Here's who we've built for."
          id="clients"
          className="home-section"
        >
          <div className="home-portfolio-grid">
            {clients.map((client) => (
              <a
                key={client.id}
                href={client.link}
                target="_blank"
                rel="noopener noreferrer"
                className="home-portfolio-card"
              >
                <div className="home-portfolio-thumb">
                  {client.image ? (
                    <img src={client.image} alt={client.title} loading="lazy" decoding="async" />
                  ) : (
                    <div className="home-portfolio-placeholder">
                      <span>{client.title.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="home-portfolio-body">
                  <h3 className="home-portfolio-title">
                    {client.title}
                    {client.link && (
                      <i className="fas fa-external-link-alt home-portfolio-link-icon"></i>
                    )}
                  </h3>
                  <p className="home-portfolio-desc">{client.description}</p>
                  <div className="home-portfolio-tags">
                    {client.tags.map((tag) => (
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
      </AnimatedSection>

      {/* Why Adverse */}
      <Section title="Why Adverse" id="why-adverse" className="home-section">
        <div className="values-banner">
          <div className="values-banner-text">
            <h2 className="values-banner-headline">
              Software that works — built by people who care.
            </h2>
            <p className="values-banner-sub">
              We keep communication clear and code clean. No handoff gaps, no
              disappearing acts.
            </p>
            <Link to="/contact" className="hero-btn hero-btn--ghost">
              Work with us <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
          <div className="values-list">
            {values.map((v) => (
              <div key={v.title} className="values-list-item">
                <i className={v.icon}></i>
                <div>
                  <span className="values-list-title">{v.title}</span>
                  <span className="values-list-desc">{v.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Final CTA */}
      <AnimatedSection>
        <div className="final-cta">
          <h2 className="final-cta-headline">Ready to build something?</h2>
          <p className="final-cta-sub">
            We'll scope it, price it, and get to work. No surprises.
          </p>
          <Link to="/contact" className="hero-btn hero-btn--primary">
            Start a project <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </AnimatedSection>
    </div>
  );
}
