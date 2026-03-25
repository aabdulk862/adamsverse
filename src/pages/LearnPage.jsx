const resources = [
  {
    category: "My Guides",
    items: [
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
    ],
  },
  {
    category: "Algorithms & Data Structures",
    items: [
      {
        label: "VisualAlgo",
        href: "https://visualgo.net/en",
        icon: "fas fa-project-diagram",
        desc: "Visualize algorithms and data structures",
      },
      {
        label: "Big-O Cheat Sheet",
        href: "https://www.bigocheatsheet.com",
        icon: "fas fa-chart-line",
        desc: "Time and space complexity reference",
      },
      {
        label: "Tech Interview Handbook",
        href: "https://www.techinterviewhandbook.org/algorithms/study-cheatsheet/",
        icon: "fas fa-book",
        desc: "Algorithm study cheatsheets for coding interviews",
      },
      {
        label: "GeeksforGeeks DSA",
        href: "https://www.geeksforgeeks.org/data-structures/",
        icon: "fas fa-database",
        desc: "Comprehensive data structures tutorial",
      },
    ],
  },
  {
    category: "Backend & DevOps",
    items: [
      {
        label: "Spring Academy",
        href: "https://spring.academy/courses/spring-framework-essentials",
        icon: "fas fa-leaf",
        desc: "Spring Framework Essentials — official course",
      },
      {
        label: "KodeKloud",
        href: "https://kodekloud.com",
        icon: "fas fa-server",
        desc: "Hands-on labs for Docker, Kubernetes, and DevOps",
      },
      {
        label: "SQLBolt",
        href: "https://sqlbolt.com",
        icon: "fas fa-table",
        desc: "Interactive SQL lessons from scratch",
      },
    ],
  },
  {
    category: "Practice & Growth",
    items: [
      {
        label: "HackerRank",
        href: "https://www.hackerrank.com/dashboard",
        icon: "fas fa-terminal",
        desc: "Coding challenges across languages and domains",
      },
      {
        label: "OSSU Computer Science",
        href: "https://github.com/ossu/computer-science",
        icon: "fas fa-graduation-cap",
        desc: "Free, self-taught CS curriculum",
      },
      {
        label: "Zero to Mastery Resources",
        href: "https://zerotomastery.io/resources",
        icon: "fas fa-rocket",
        desc: "Curated free dev resources",
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
                target={r.href.startsWith("/") ? undefined : "_blank"}
                rel={r.href.startsWith("/") ? undefined : "noopener noreferrer"}
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
