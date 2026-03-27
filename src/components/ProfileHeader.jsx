import React, { useEffect, useState } from "react";
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

const capabilities = [
  { icon: "fas fa-code", label: "Web Development" },
  { icon: "fas fa-video", label: "Content Creation" },
  { icon: "fas fa-users", label: "Community Building" },
];

const stats = [
  { value: "50+", label: "Projects" },
  { value: "3+", label: "Years" },
  { value: "100%", label: "Commitment" },
];

export default function ProfileHeader() {
  const isMobile = useIsMobile();
  const dur = isMobile ? 0.3 : 0.5;

  return (
    <motion.section
      className="hero"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: dur, ease: "easeOut" }}
    >
      {/* Decorative glow */}
      <span className="hero-glow hero-glow--1" aria-hidden="true" />
      <span className="hero-glow hero-glow--2" aria-hidden="true" />

      {/* Eyebrow */}
      <motion.p
        className="hero-eyebrow"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: dur }}
      >
        <i className="fas fa-bolt"></i> Available for new projects
      </motion.p>

      {/* Headline */}
      <motion.h1
        className="hero-headline"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: dur }}
      >
        I build digital experiences
        <br />
        that <span className="hero-accent">connect</span> &amp;{" "}
        <span className="hero-accent">convert</span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        className="hero-sub"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: dur }}
      >
        Full-stack developer, content creator, and community builder helping
        brands ship faster and grow audiences.
      </motion.p>

      {/* CTAs */}
      <motion.div
        className="hero-ctas"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: dur }}
      >
        <a href="/#contact" className="hero-btn hero-btn--primary">
          Start a Project <i className="fas fa-arrow-right"></i>
        </a>
        <a href="/#pricing" className="hero-btn hero-btn--ghost">
          View Pricing
        </a>
      </motion.div>

      {/* Capabilities */}
      <motion.div
        className="hero-capabilities"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: dur }}
      >
        {capabilities.map((cap) => (
          <div key={cap.label} className="hero-cap">
            <i className={cap.icon}></i>
            <span>{cap.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Social proof stats */}
      <motion.div
        className="hero-stats"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: dur }}
      >
        {stats.map((s) => (
          <div key={s.label} className="hero-stat">
            <span className="hero-stat-value">{s.value}</span>
            <span className="hero-stat-label">{s.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Powered by */}
      <motion.div
        className="hero-powered"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: dur }}
      >
        <span className="hero-powered-label">Powered by</span>
        <span className="hero-powered-brand">Adverse LLC</span>
      </motion.div>
    </motion.section>
  );
}
