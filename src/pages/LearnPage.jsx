const resources = [
  {
    category: "My Guides & Resources",
    items: [
      {
        label: "Build a Website with AI",
        href: "/ai-website.html",
        icon: "fas fa-robot",
        desc: "Learn how to create a webpage using AI — no coding experience required",
      },
      {
        label: "Github Developer Guide",
        href: "/github.html",
        icon: "fab fa-github",
        desc: "A comprehensive guide covering Git fundamentals, GitHub workflows, and IntelliJ IDEA integration",
      },
      {
        label: "DSA Study Guide",
        href: "/dsa.html",
        icon: "fas fa-sitemap",
        desc: "Big O, data structures, and 18 LeetCode patterns",
      },
      {
        label: "LeetCode Java Companion",
        href: "/leetcode.html",
        icon: "fas fa-code",
        desc: "20 most common coding interview questions in Java",
      },
      {
        label: "Learn Angular",
        href: "https://learn-angular18.netlify.app/",
        icon: "fab fa-angular",
        desc: "A guide to Angular fundamentals, components, and building modern web apps",
      },
    ],
  },
];

export default function LearnPage() {
  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Learn</h1>
        <p className="page-subtitle">
          Resources I use and recommend for leveling up as a developer.
        </p>
      </div>

      {resources.map((group) => (
        <div key={group.category} className="learn-group">
          <h2 className="learn-group-title">{group.category}</h2>
          <div className="learn-list">
            {group.items.map((r) => (
              <a
                key={r.label}
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                className="learn-link"
              >
                <i className={r.icon}></i>
                <div className="learn-link-text">
                  <span className="learn-link-label">{r.label}</span>
                  {r.desc && <span className="learn-link-desc">{r.desc}</span>}
                </div>
                <i className="fas fa-arrow-right learn-arrow"></i>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
