import { Link } from "react-router-dom";
import { useEffect } from "react";
import logo from "../assets/images/profile.JPEG";
import usa from "../assets/images/usa.png";
import eritrea from "../assets/images/eritrea.png";

const principles = [
  {
    number: "01",
    title: "Design & Engineering, Together",
    desc: "Most shops split creative and engineering into separate teams. We treat them as one discipline — every project gets the same person thinking about how it looks and how it works under the hood.",
  },
  {
    number: "02",
    title: "Direct Access",
    desc: "No account managers, no layers. You talk directly to the person writing the code and making the design decisions. Questions get answered fast, feedback gets applied immediately.",
  },
  {
    number: "03",
    title: "Ship & Support",
    desc: "We don't disappear after launch. Every project includes a support window, and we build things so they're easy to maintain long after we hand them off.",
  },
  {
    number: "04",
    title: "AI-Augmented, Human-Led",
    desc: "We use AI tools to move faster — code generation, research, automation — but every decision and every line of production code is reviewed and owned by a human.",
  },
];

export default function AboutPage() {
  useEffect(() => {
    document.title = "About Adverse Solutions — Our Story | Charlotte, NC";
  }, []);

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">About Us</h1>
      </div>

      {/* Bio Section */}
      <div className="about-bio">
        <div className="about-bio-header">
          <img
            src={logo}
            alt="Adam Abdulkadir, founder of Adverse LLC"
            className="about-avatar"
            loading="lazy"
            decoding="async"
          />
          <div className="about-bio-info">
            <h2 className="about-name">
              Adam Abdulkadir
              <img
                src={usa}
                alt="United States flag"
                className="flag"
                loading="lazy"
                decoding="async"
              />
              <img
                src={eritrea}
                alt="Eritrean flag"
                className="flag"
                loading="lazy"
                decoding="async"
              />
            </h2>
            <p className="about-role">Founder, Adverse LLC</p>
          </div>
        </div>
        <div className="about-bio-text">
          <p>
            I grew up in Northern Virginia's tech corridor and started writing
            code in high school. By the time I finished college I was already
            shipping real projects on the side while working every job I could
            find. That hustle never really turned off.
          </p>
          <p>
            After graduating I went straight into enterprise engineering:
            microservices, full-stack platforms, production systems at scale. I
            got comfortable operating across the entire stack, but I always
            paid just as much attention to the design side — how things looked
            and how they felt to use.
          </p>
          <p>
            That's why I started Adverse. The name means going against the
            current. Most agencies split engineering and creative into separate
            teams and outsource whatever they don't do in-house. I treat both
            as one discipline, because good software isn't just code that
            works — it's something people actually want to use.
          </p>
          <p>
            Based in Charlotte, NC. If you need a full-stack application built
            from scratch, a legacy system modernized, or a technical partner
            who actually picks up the phone — that's what Adverse is for.
          </p>
        </div>
      </div>

      {/* How We Work */}
      <div className="about-section">
        <h2 className="about-section-title">How We Work</h2>
        <div className="about-principles">
          {principles.map((item) => (
            <div key={item.number} className="about-principle">
              <span className="about-principle-number">{item.number}</span>
              <div className="about-principle-body">
                <h3 className="about-principle-title">{item.title}</h3>
                <p className="about-principle-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="about-cta">
        <p className="about-cta-label">Ready?</p>
        <h2 className="about-cta-headline">Let's build something together.</h2>
        <Link to="/contact" className="about-cta-btn">
          Start a conversation <i className="fas fa-arrow-right"></i>
        </Link>
      </div>
    </div>
  );
}
