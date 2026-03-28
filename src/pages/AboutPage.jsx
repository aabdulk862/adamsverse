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
    title: "Technical Lead — GAMEC (Nonprofit, Ongoing)",
    description:
      "Led design and development of the official website for the Global Association of Muslim Eritrean Communities, a 501(c)(3) nonprofit. Built from scratch and continue to manage hosting, maintenance, and updates.",
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
            I grew up in Northern Virginia. Spent most of my time on the
            computer — gaming, browsing, just being online. I've always been
            naturally curious, and I got to watch the internet evolve in real
            time. I remember seeing updates roll out on sites like Facebook and
            being fascinated by the new changes being made. I didn't have the
            vocabulary for it then, but later — once I started learning web
            development — I realized I'd been watching the shift toward modern
            dynamic web apps. The kind of complexity that eventually led to
            tools like React.
          </p>
          <p>
            My first computer science class was in high school — Java, taught by
            Mr. Meermans. Something clicked. I liked that I could write
            something and see it do exactly what I told it to. He taught me
            object-oriented programming and ways of thinking about problems that
            I still use today. That class was enough to keep me going. I kept
            learning on my own after that, picking up whatever I could.
          </p>
          <p>
            College is where web development entered the picture. I liked the
            immediacy of it — you write code, you see a page, you tweak it, it
            changes. It sat right at the intersection of logic and design, which
            appealed to both sides of how I think. I got serious about it and
            started building real projects.
          </p>
          <p>
            After graduating I went straight into professional work. Enterprise
            platforms, microservices, full-stack applications — the kind of
            stuff where you learn fast because the stakes are real. I worked on
            large-scale systems, shipped production code, and got comfortable
            operating across the entire stack from backend APIs to frontend
            interfaces.
          </p>
          <p>
            But I always had a creative side that didn't fully fit into a
            typical engineering role. I cared about how things looked, how they
            felt to use, how content was presented. I did content creation and
            design work on the side because it scratched an itch that pure
            backend code didn't.
          </p>
          <p>
            Adverse came out of wanting a place where I didn't have to pick one
            or the other. The name is intentional — "adverse" means going
            against the current. Most agencies either do engineering or
            creative, and they outsource the other half. I wanted to build
            something that treats both as the same discipline, because to me
            they are. Good software isn't just code that works. It's something
            people actually want to use.
          </p>
          <p>
            I'm based in Charlotte. If you need a full-stack application built
            from scratch, a legacy system modernized, or a technical partner who
            actually picks up the phone — that's what Adverse is for. I work
            directly with every client. No account managers, no handoffs, no
            layers between you and the person writing the code.
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
