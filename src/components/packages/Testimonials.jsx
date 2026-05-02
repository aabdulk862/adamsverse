import { useState } from "react";
import styles from "./Testimonials.module.css";

const LAYOUT_CLASS_MAP = {
  professional: "testimonialsProfessional",
  beauty: "testimonialsBeauty",
  homeServices: "testimonialsHomeServices",
  foodHospitality: "testimonialsFoodHospitality",
};

const AVATAR_LEFT_LAYOUTS = new Set(["professional", "homeServices"]);

export default function Testimonials({ content, theme, layout }) {
  const { heading, items } = content || {};
  const [erroredAvatars, setErroredAvatars] = useState(new Set());

  const variantClass = LAYOUT_CLASS_MAP[layout];
  const sectionClassName = [
    styles.testimonials,
    variantClass ? styles[variantClass] : "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleAvatarError = (index) => {
    setErroredAvatars((prev) => new Set(prev).add(index));
  };

  const renderAvatar = (item, index) => {
    const hasAvatar = item.avatar && !erroredAvatars.has(index);
    const initial = item.author ? item.author.charAt(0) : "?";

    if (hasAvatar) {
      return (
        <img
          className={styles.avatar}
          src={item.avatar}
          alt={`${item.author || "Author"} avatar`}
          onError={() => handleAvatarError(index)}
        />
      );
    }

    return (
      <div
        className={styles.avatarPlaceholder}
        aria-hidden="true"
        style={{
          backgroundColor: "var(--color-accent)",
          color: "var(--color-accentText)",
        }}
      >
        {initial}
      </div>
    );
  };

  const avatarLeftOfAttribution = AVATAR_LEFT_LAYOUTS.has(layout);

  return (
    <section className={sectionClassName}>
      <div className={styles.inner}>
        {heading && <h2 className={styles.heading}>{heading}</h2>}
        {items && items.length > 0 && (
          <div className={styles.grid}>
            {items.map((item, index) => (
              <blockquote key={index} className={styles.card}>
                {layout === "homeServices" && (
                  <div className={styles.stars} aria-label="5 out of 5 stars">
                    ★★★★★
                  </div>
                )}
                {item.quote && <p className={styles.quote}>{item.quote}</p>}
                {avatarLeftOfAttribution ? (
                  <div className={styles.attributionRow}>
                    {renderAvatar(item, index)}
                    <footer className={styles.attribution}>
                      {item.author && (
                        <span className={styles.author}>{item.author}</span>
                      )}
                      {item.role && (
                        <span className={styles.role}>{item.role}</span>
                      )}
                    </footer>
                  </div>
                ) : (
                  <>
                    <div className={styles.avatarCentered}>
                      {renderAvatar(item, index)}
                    </div>
                    <footer className={styles.attribution}>
                      {item.author && (
                        <span className={styles.author}>{item.author}</span>
                      )}
                      {item.role && (
                        <span className={styles.role}>{item.role}</span>
                      )}
                    </footer>
                  </>
                )}
              </blockquote>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
