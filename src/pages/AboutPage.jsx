import logo from "../assets/images/profile.JPEG";
import usa from "../assets/images/usa.png";
import eritrea from "../assets/images/eritrea.png";

const skillGroups = [
  {
    category: "Backend",
    skills: [
      "Java 21",
      "Spring Boot",
      "Spring Batch",
      "Kafka",
      "RabbitMQ",
    ],
  },
  {
    category: "Frontend",
    skills: [
      "React",
      "Angular",
      "JavaScipt",
      "TypeScript",
      "Next.js",
    ],
  },
  {
    category: "Cloud & DevOps",
    skills: ["AWS", "Azure", "Docker", "Kubernetes", "CI/CD"],
  },
  {
    category: "Architecture",
    skills: [
      "Microservices",
      "Event-Driven Architecture",
      "REST API Design",
    ],
  },
];

const experience = [
  {
    year: "2025",
    title:
      "Software Engineer — Infosys (Charter Communications/Spectrum)",
    description:
      "Building UCC Hub, a large-scale customer communications platform. Delivered Appointment Service as a standalone Spring Boot microservice (Java 21), designed REST + RabbitMQ integrations, and led architectural analysis for third-party integrations.",
  },
  {
    year: "2024",
    title: "Full Stack Developer — Revature (Training Contract)",
    description:
      "Built a full-stack Employee Reimbursement System using Spring Boot, React, and PostgreSQL with RBAC and approval workflows. Deployed via Docker/Jenkins CI/CD pipelines.",
  },
  {
    year: "2023",
    title: "Co-Founder & Technical Lead — GAMEC (Nonprofit, Ongoing)",
    description:
      "Co-founded the Global Association of Muslim Eritrean Communities, a 501(c)(3) nonprofit, alongside family. Built the official website from scratch and continue to manage hosting, maintenance, and updates.",
  },
  {
    year: "2023",
    title: "Frontend Developer — Crocodile Solutions (Contract)",
    description:
      "Modernized legacy apps into responsive React and Next.js SPAs. Built performance-focused UIs with Material UI and integrated with backend REST APIs.",
  },
];

export default function AboutPage() {
  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">The Story</h1>
      </div>

      {/* Bio Section */}
      <div className="about-bio">
        <div className="about-bio-header">
          <img src={logo} alt="Adverse LLC logo" className="about-avatar" />
          <div className="about-bio-info">
            <h2 className="about-name">
              Adam Abdulkadir
              <img src={usa} alt="United States flag" className="flag" />
              <img src={eritrea} alt="Eritrean flag" className="flag" />
            </h2>
            <p className="about-role">Founder, Adverse LLC</p>
          </div>
        </div>
        <div className="about-bio-text">
          <p>
            I've been online longer than I've been doing anything else. I grew
            up in Northern Virginia — one of the biggest tech corridors in the
            country — and the computer was where I lived. I'd notice when
            Facebook changed something and I would try to figure out how they did it. My
            first CS class was at Battlefield High School in Haymarket, VA,
            where I took Java with Mr. Meermans. Something clicked, and I never
            stopped.
          </p>
          <p>
            College is where web development and the entrepreneurial side both
            kicked in. I was building real projects while doing DoorDash and
            stocking produce at Walmart — always working, always figuring out
            how to make my own money. After graduating I went straight into
            enterprise work: microservices, full-stack platforms, production
            code at scale. I got comfortable operating across the entire stack,
            but I always cared about the creative side too — how things looked,
            how they felt to use.
          </p>
          <p>
            Adverse came out of that. The name is intentional — "adverse" means
            going against the current. Most agencies either do engineering or
            creative and outsource the other half. I wanted to build something
            that treats both as the same discipline, because to me they are.
            Good software isn't just code that works. It's something people
            actually want to use.
          </p>
          <p>
            I'm based in Charlotte. If you need a full-stack application built
            from scratch, a legacy system modernized, or a technical partner who
            actually picks up the phone — that's what Adverse is for. No
            account managers, no handoffs, no layers between you and the person
            writing the code.
          </p>
        </div>
      </div>

      {/* Skills Section */}
      <div className="about-section">
        <h2 className="about-section-title">Skills</h2>
        <p className="about-section-intro">
          Here's what I work with day to day — the stack behind the projects above.
        </p>
        {skillGroups.map((group) => (
          <div key={group.category} className="skill-group">
            <p className="skill-group-label">{group.category}</p>
            <div className="skills-grid">
              {group.skills.map((skill) => (
                <span key={skill} className="skill-pill">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Experience Timeline */}
      <div className="about-section">
        <h2 className="about-section-title">Experience</h2>
        <div className="timeline">
          {experience.map((entry) => (
            <div key={entry.year} className="timeline-entry">
              <div className="timeline-year">{entry.year}</div>
              <div className="timeline-content">
                <h3 className="timeline-title">{entry.title}</h3>
                <p className="timeline-desc">{entry.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
