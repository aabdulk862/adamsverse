const resources = [
  { label: "DSA Study Guide", href: "/dsa.html", icon: "fas fa-sitemap" },
  { label: "LeetCode Companion", href: "/leetcode.html", icon: "fas fa-code" },
  { label: "MDN Web Docs", href: "https://developer.mozilla.org", icon: "fab fa-firefox-browser" },
  { label: "freeCodeCamp", href: "https://www.freecodecamp.org", icon: "fab fa-free-code-camp" },
  { label: "The Odin Project", href: "https://www.theodinproject.com", icon: "fas fa-graduation-cap" },
  { label: "JavaScript.info", href: "https://javascript.info", icon: "fab fa-js-square" },
  { label: "CSS-Tricks", href: "https://css-tricks.com", icon: "fab fa-css3-alt" },
  { label: "React Docs", href: "https://react.dev", icon: "fab fa-react" },
  { label: "LeetCode", href: "https://leetcode.com", icon: "fas fa-laptop-code" },
  { label: "NeetCode", href: "https://neetcode.io", icon: "fas fa-brain" },
];

export default function LearnPage() {
  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Learn</h1>
        <p className="page-subtitle">
          Resources I recommend for leveling up as a developer.
        </p>
      </div>

      <div className="learn-list">
        {resources.map((r) => (
          <a
            key={r.label}
            href={r.href}
            target={r.href.startsWith("/") ? undefined : "_blank"}
            rel={r.href.startsWith("/") ? undefined : "noopener noreferrer"}
            className="learn-link"
          >
            <i className={r.icon}></i>
            <span>{r.label}</span>
            <i className="fas fa-arrow-right learn-arrow"></i>
          </a>
        ))}
      </div>
    </div>
  );
}
