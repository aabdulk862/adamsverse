const projects = [
  {
    id: "gamec",
    title: "GAMEC",
    description:
      "Co-founded this 501(c)(3) nonprofit serving Muslim Eritrean communities worldwide. Built the official website from scratch, launched within 4 weeks, and continue to manage hosting and updates.",
    tags: ["HTML", "CSS", "JavaScript", "Netlify"],
    link: "https://igamec.org",
    image: new URL("../assets/images/gamec-desktop-view.png", import.meta.url)
      .href,
    type: "client",
    featured: true,
  },
  {
    id: "jasons-enterprises",
    title: "Jason's Enterprises",
    description:
      "Business website for a home installation and repair company serving the DC, Maryland, and Virginia area. Includes service listings, appointment booking, customer testimonials, and a 90-day warranty guarantee. Built and launched as a client project.",
    tags: ["HTML", "CSS", "JavaScript", "GitHub Pages"],
    link: "https://aabdulk862.github.io/jasons-enterprises/",
    image: new URL(
      "../assets/images/jasons-enterprise-desktop-view.png",
      import.meta.url,
    ).href,
    type: "client",
    featured: false,
  },
  {
    id: "better-budget",
    title: "Better Budget",
    description:
      "Full-stack envelope budgeting app where users allocate money to virtual envelopes and track spending in real time. Includes secure auth, admin controls, and cloud deployment on AWS.",
    tags: ["Spring Boot", "React", "TypeScript", "PostgreSQL", "Docker", "AWS"],
    link: "https://github.com/aabdulk862/BetterBudget",
    image: new URL(
      "../assets/images/betterbudget-dekstop-view.png",
      import.meta.url,
    ).href,
    type: "training",
    featured: false,
  },
  {
    id: "learn-kafka",
    title: "Kafka Learning Platform",
    description:
      "Open-source reference project covering Kafka producer/consumer patterns, transactional messaging, Kafka Streams, Avro schemas, and real-world patterns like event sourcing and CQRS.",
    tags: [
      "Spring Boot",
      "Kafka",
      "Kafka Streams",
      "Avro",
      "Docker",
      "Java 17",
    ],
    link: "https://github.com/aabdulk862/learn-kafka",
    image: new URL(
      "../assets/images/kafka-learning-desktop-view.png",
      import.meta.url,
    ).href,
    type: "personal",
    featured: false,
  },
  {
    id: "learn-angular",
    title: "Learn Angular 18",
    description:
      "Interactive learning resource demonstrating Angular 18 fundamentals — standalone components, signal-based reactivity, new control flow syntax, reactive forms, and dependency injection.",
    tags: ["Angular 18", "TypeScript", "Signals", "RxJS"],
    link: "https://learn-angular18.netlify.app/",
    image: new URL(
      "../assets/images/learn-angular-desktop-view.png",
      import.meta.url,
    ).href,
    type: "personal",
    featured: false,
  },
  {
    id: "ers",
    title: "Expense Reimbursement System",
    description:
      "Built during professional training at Revature. Full-stack app with role-based access control, approval workflows, and secure auth — designed to mirror real enterprise reimbursement flows.",
    tags: ["Spring Boot", "React", "PostgreSQL", "REST API", "RBAC"],
    link: "https://github.com/aabdulk862/Expense-Reimbursement-System",
    image: null,
    type: "training",
    featured: false,
  },
];

export default projects;
