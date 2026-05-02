import { useEffect } from "react";

const resources = [
  {
    category: "For Developers",
    items: [
      {
        label: "DSA Study Guide",
        href: "/dsa",
        icon: "fas fa-sitemap",
        desc: "Big O notation, core data structures, and 18 LeetCode patterns broken down with explanations and Java examples. Written for developers preparing for technical interviews or brushing up on fundamentals.",
        meta: "Intermediate · ~12 min read",
      },
      {
        label: "LeetCode Java Companion",
        href: "/leetcode",
        icon: "fas fa-code",
        desc: "The 20 most common coding interview problems solved in Java with step-by-step breakdowns. Each solution includes time/space complexity analysis and notes on common edge cases.",
        meta: "Intermediate · 20 problems",
      },
      {
        label: "GitHub Developer Guide",
        href: "/github",
        icon: "fab fa-github",
        desc: "A practical walkthrough of Git fundamentals, branching strategies, pull request workflows, and IntelliJ IDEA integration. Designed for developers who use Git daily but want to tighten their workflow.",
        meta: "Beginner–Intermediate · ~13 min read",
      },
      {
        label: "Learn Angular 18",
        href: "https://learn-angular18.netlify.app/",
        icon: "fab fa-angular",
        desc: "Hands-on guide to Angular 18 — standalone components, signal-based reactivity, new control flow syntax (@if, @for, @switch), reactive forms, and dependency injection. Build a working app by the end.",
        meta: "Beginner–Intermediate · Interactive",
      },
    ],
  },
  {
    category: "For Non-Technical Folks",
    items: [
      {
        label: "Build a Website with AI",
        href: "/ai-website",
        icon: "fas fa-robot",
        desc: "A step-by-step guide to creating a basic webpage using AI tools — no coding experience needed. Covers prompting, editing, and publishing. Great for understanding what goes into a site before hiring someone to build a real one.",
        meta: "Beginner · ~8 min read",
      },
    ],
  },
];

export default function LearnPage() {
  useEffect(() => {
    document.title = "Learn — Adverse Solutions | Developer Guides & Resources";
  }, []);

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Learn with Adverse</h1>
        <p className="page-subtitle">
          Guides and resources from Adverse Solutions — for developers learning
          the stack and clients understanding the process.
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
                  {r.meta && <span className="learn-link-meta">{r.meta}</span>}
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
