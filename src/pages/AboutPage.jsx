import logo from "../assets/images/logo.png";
import usa from "../assets/images/usa.png";
import eritrea from "../assets/images/eritrea.png";

const skills = [
  "React",
  "JavaScript",
  "CSS",
  "Node.js",
  "Python",
  "HTML",
  "Git",
  "Vite",
  "REST APIs",
  "Video Editing",
  "Graphic Design",
  "Community Building",
];

const experience = [
  {
    year: "2024",
    title: "Founded AdamsVerse LLC",
    description:
      "Launched a personal brand and creator hub offering web development, content creation, and consulting services.",
  },
  {
    year: "2023",
    title: "Full-Stack Web Development",
    description:
      "Built multiple client projects using React, Node.js, and modern web technologies.",
  },
  {
    year: "2022",
    title: "Content Creation & Community",
    description:
      "Started creating content on YouTube and Twitch, growing an engaged community of creators and developers.",
  },
];

export default function AboutPage() {
  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">About Me</h1>
      </div>

      {/* Bio Section */}
      <div className="about-bio">
        <div className="about-bio-header">
          <img
            src={logo}
            alt="AdamsVerse logo"
            className="about-avatar"
          />
          <div className="about-bio-info">
            <h2 className="about-name">
              Adam Abdulkadir
              <img src={usa} alt="United States flag" className="flag" />
              <img src={eritrea} alt="Eritrean flag" className="flag" />
            </h2>
            <p className="about-role">Creator • Developer • Entrepreneur</p>
          </div>
        </div>
        <div className="about-bio-text">
          <p>
            I'm Adam — a developer, content creator, and community builder based
            in the United States with Eritrean heritage. I'm passionate about
            building digital experiences that connect people and solve real
            problems.
          </p>
          <p>
            Through AdamsVerse, I combine web development, creative content, and
            community engagement to help brands and individuals grow their online
            presence. Whether it's a custom website, a content strategy, or
            technical consulting, I bring a hands-on, detail-oriented approach to
            every project.
          </p>
        </div>
      </div>

      {/* Skills Section */}
      <div className="about-section">
        <h2 className="about-section-title">Skills</h2>
        <div className="skills-grid">
          {skills.map((skill) => (
            <span key={skill} className="skill-pill">
              {skill}
            </span>
          ))}
        </div>
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
