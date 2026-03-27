import logo from "../assets/images/profile.JPEG";
import usa from "../assets/images/usa.png";
import eritrea from "../assets/images/eritrea.png";

const skillGroups = [
  {
    category: "Backend",
    skills: [
      "Java",
      "Java 21",
      "Spring Boot",
      "Spring Batch",
      "JDBC",
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
      "JavaScript",
      "HTML",
      "CSS",
      "Material UI",
      "Next.js",
    ],
  },
  {
    category: "Cloud & DevOps",
    skills: ["AWS", "Azure", "Docker", "Kubernetes", "Jenkins", "CI/CD"],
  },
  {
    category: "Tools",
    skills: [
      "Git",
      "GitHub",
      "Gradle",
      "Maven",
      "IntelliJ",
      "VS Code",
      "Postman",
      "Figma",
      "Tableau",
    ],
  },
  {
    category: "Methodologies",
    skills: [
      "Microservices",
      "Event-Driven Architecture",
      "REST API Design",
      "MVC",
      "OOP",
      "Agile",
    ],
  },
];

const experience = [
  {
    year: "2025",
    title:
      "Software Engineer Associate — Infosys (Charter Communications/Spectrum)",
    description:
      "Contributing to UCC Hub, a large-scale customer communications platform. Delivered Appointment Service as a standalone Spring Boot microservice (Java 21), designed REST + RabbitMQ integrations, and led architectural analysis for third-party integrations.",
  },
  {
    year: "2024",
    title: "Full Stack Developer — Revature",
    description:
      "Built a full-stack Employee Reimbursement System using Spring Boot, React, and PostgreSQL with RBAC and approval workflows. Deployed via Docker/Jenkins CI/CD pipelines.",
  },
  {
    year: "2023",
    title: "Web Developer / Technical Lead — GAMEC",
    description:
      "Led design and development of the official website for the Global Association of Muslim Eritrean Communities (GAMEC), a 501(c)(3) nonprofit serving Muslim Eritrean communities worldwide. Built in HTML, CSS, and JavaScript; managed hosting, maintenance, and updates on Netlify.",
  },
  {
    year: "2023",
    title: "Frontend Developer — Crocodile Solutions",
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
            I grew up in Northern Virginia, the kind of kid who was always on
            the computer. Gaming was my thing — I'd lose entire weekends to it —
            and somewhere along the way I started getting curious about how the
            software behind it all actually worked.
          </p>
          <p>
            That curiosity turned into something real in high school, when I
            wrote my first lines of code and realized I could make a computer do
            whatever I wanted. By the time I got to college, I'd found web
            development — and that was it. The mix of logic and visual
            creativity clicked in a way nothing else had. I could solve hard
            problems and make the solution look good at the same time.
          </p>
          <p>
            After college I jumped into the industry, working on enterprise
            platforms and startup products alike. I built microservices at
            scale, shipped full-stack apps, and led projects from architecture
            to deployment. But I always had this other side — a creative streak
            that showed up in content creation, design, and the way I thought
            about user experience.
          </p>
          <p>
            Adverse is where those two sides come together. It's the company I
            built to combine my engineering mindset — the analytical,
            problem-solving part — with the creative and artistic instincts I've
            carried since I was a kid. I'm 26, based in Charlotte now, and I'm
            building Adverse into something that reflects how I actually think:
            software should be well-crafted, not just functional.
          </p>
        </div>
      </div>

      {/* Skills Section */}
      <div className="about-section">
        <h2 className="about-section-title">Skills</h2>
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
