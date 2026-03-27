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

const features = [
  { icon: "fas fa-code", label: "Full-Stack Development" },
  { icon: "fas fa-cloud", label: "Cloud Architecture" },
  { icon: "fas fa-lightbulb", label: "Technical Consulting" },
];

const trustIndicators = [
  { value: "20+", label: "Technologies" },
  { value: "3+", label: "Years Experience" },
  { value: "50+", label: "Projects Delivered" },
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
      {/* Eyebrow */}
      <motion.p
        className="hero-eyebrow"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: dur }}
      >
        <i className="fas fa-bolt"></i> Adverse — Available for new projects
      </motion.p>

      {/* Headline */}
      <motion.h1
        className="hero-headline"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: dur }}
      >
        Software Solutions That{" "}
        <span className="hero-accent">Drive Results</span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        className="hero-sub"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: dur }}
      >
        At Adverse, we help startups and businesses build reliable, scalable web
        applications with modern full-stack development, cloud architecture, and
        hands-on technical consulting.
      </motion.p>

      {/* CTAs */}
      <motion.div
        className="hero-ctas"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: dur }}
      >
        <a href="/#contact" className="hero-btn hero-btn--primary">
          Get Started <i className="fas fa-arrow-right"></i>
        </a>
        <a href="/services" className="hero-btn hero-btn--ghost">
          View Services
        </a>
      </motion.div>

      {/* Product-oriented feature highlights */}
      <motion.div
        className="hero-capabilities"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: dur }}
      >
        {features.map((f) => (
          <div key={f.label} className="hero-cap">
            <i className={f.icon}></i>
            <span>{f.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Professional trust indicators */}
      <motion.div
        className="hero-stats"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: dur }}
      >
        {trustIndicators.map((s) => (
          <div key={s.label} className="hero-stat">
            <span className="hero-stat-value">{s.value}</span>
            <span className="hero-stat-label">{s.label}</span>
          </div>
        ))}
      </motion.div>
    </motion.section>
  );
}
