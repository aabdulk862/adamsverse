const resources = [
  {
    category: "My Guides & Resources",
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
      {
        label: "Github Developer Guide",
        href: "/github.html",
        icon: "fab fa-github",
        desc: "A comprehensive guide covering Git fundamentals, GitHub workflows, and IntelliJ IDEA integration",
      },
      {
        label: "Learn Angular",
        href: "https://learn-angular18.netlify.app/",
        icon: "fab fa-angular",
        desc: "A guide to Angular fundamentals, components, and building modern web apps",
      },
    ],
  },
  {
    category: "Algorithms & Data Structures",
    items: [
      {
        label: "LeetCode",
        href: "https://leetcode.com",
        icon: "fas fa-code",
        desc: "The go-to platform for coding interview prep and algorithm practice",
      },
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
      {
        label: "Docker Hub",
        href: "https://hub.docker.com",
        icon: "fab fa-docker",
        desc: "Container image registry — find and share Docker images",
      },
      {
        label: "Kubernetes Docs",
        href: "https://kubernetes.io/docs/home/",
        icon: "fas fa-dharmachakra",
        desc: "Official Kubernetes documentation and reference",
      },
    ],
  },
  {
    category: "Cloud & Certifications",
    items: [
      {
        label: "AWS Training",
        href: "https://www.aws.training/",
        icon: "fab fa-aws",
        desc: "Official AWS training and certification prep",
      },
      {
        label: "Microsoft Learn",
        href: "https://learn.microsoft.com/en-us/training/",
        icon: "fab fa-microsoft",
        desc: "Free Azure, DevOps, and Microsoft certification courses",
      },
    ],
  },
  {
    category: "Design & Creative Tools",
    items: [
      {
        label: "Dribbble",
        href: "https://dribbble.com",
        icon: "fab fa-dribbble",
        desc: "Design inspiration from top designers and creative professionals",
      },
      {
        label: "Unsplash",
        href: "https://unsplash.com",
        icon: "fas fa-camera",
        desc: "Beautiful, free high-resolution photos",
      },
      {
        label: "Coolors",
        href: "https://coolors.co",
        icon: "fas fa-palette",
        desc: "Color palette generator for design projects",
      },
      {
        label: "Font Awesome",
        href: "https://fontawesome.com",
        icon: "fab fa-font-awesome",
        desc: "The icon library powering most of the web",
      },
      {
        label: "AOS",
        href: "https://michalsnik.github.io/aos/",
        icon: "fas fa-magic",
        desc: "Animate on scroll library for clean page transitions",
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
        label: "MOOC.fi",
        href: "https://www.mooc.fi/en",
        icon: "fas fa-university",
        desc: "Free programming courses from the University of Helsinki",
      },
      {
        label: "OSSU Computer Science",
        href: "https://github.com/ossu/computer-science",
        icon: "fas fa-graduation-cap",
        desc: "Free, self-taught CS curriculum",
      },
      {
        label: "Zero to Mastery",
        href: "https://zerotomastery.io/",
        icon: "fas fa-rocket",
        desc: "One of the first platforms I used to learn web development — solid courses that helped me build a real foundation early on",
      },
    ],
  },
  {
    category: "AI Tools",
    items: [
      {
        label: "ChatGPT",
        href: "https://chat.openai.com",
        icon: "fas fa-robot",
        desc: "OpenAI's conversational AI — useful for brainstorming, debugging, and learning",
      },
      {
        label: "Claude",
        href: "https://claude.ai",
        icon: "fas fa-brain",
        desc: "Anthropic's AI assistant — great for code review and technical writing",
      },
      {
        label: "Perplexity",
        href: "https://www.perplexity.ai",
        icon: "fas fa-search",
        desc: "AI-powered search engine with cited sources",
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
