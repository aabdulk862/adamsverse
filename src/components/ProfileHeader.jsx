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
        <i className="fas fa-circle" style={{ fontSize: "6px", color: "var(--success-color)" }}></i> Open to work
      </p>

      {/* Headline */}
      <h1 className="hero-headline">
        We build <span className="hero-accent">web apps</span> that work.
      </h1>

      {/* Subheadline */}
      <p className="hero-sub">
        Adverse is a small dev shop focused on full-stack development, cloud
        infrastructure, and honest consulting. We keep things simple and ship
        things that last.
      </p>

      {/* CTAs */}
      <div className="hero-ctas">
        <a href="/contact" className="hero-btn hero-btn--primary">
          Say hello <i className="fas fa-arrow-right"></i>
        </a>
        <a href="/services" className="hero-btn hero-btn--ghost">
          What we do
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
