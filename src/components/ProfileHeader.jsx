import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function useIsMobile(breakpoint = 600) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    setIsMobile(mql.matches);
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [breakpoint]);

  return isMobile;
}

const features = [
  { icon: "fas fa-code", label: "Full-Stack Dev" },
  { icon: "fas fa-cloud", label: "Cloud & Infra" },
  { icon: "fas fa-lightbulb", label: "Consulting" },
];

export default function ProfileHeader() {
  const isMobile = useIsMobile();
  const dur = isMobile ? 0.25 : 0.4;

  return (
    <motion.section
      className="hero"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: dur, ease: "easeOut" }}
    >
      {/* Eyebrow */}
      <p className="hero-eyebrow">
        <i className="fas fa-circle" style={{ fontSize: "6px", color: "var(--success-color)" }}></i> Available for projects
      </p>

      {/* Headline */}
      <h1 className="hero-headline">
        We build the <span className="hero-accent">software</span>. You run the business.
      </h1>

      {/* Subheadline */}
      <p className="hero-sub">
        Full-stack applications, cloud infrastructure, and technical consulting
        for small businesses and startups that need reliable software without
        the agency overhead.
      </p>

      {/* CTAs */}
      <div className="hero-ctas">
        <a href="/contact" className="hero-btn hero-btn--primary">
          Start a project <i className="fas fa-arrow-right"></i>
        </a>
        <a href="/portfolio" className="hero-btn hero-btn--ghost">
          See my work
        </a>
      </div>

      {/* Feature highlights */}
      <div className="hero-capabilities">
        {features.map((f) => (
          <div key={f.label} className="hero-cap">
            <i className={f.icon}></i>
            <span>{f.label}</span>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
