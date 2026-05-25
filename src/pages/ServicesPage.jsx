import { Link } from "react-router-dom";
import { useEffect } from "react";
import services from "../data/services";
import styles from "./ServicesPage.module.css";

export default function ServicesPage() {
  useEffect(() => {
    document.title = "Services — Adverse Solutions | Web Development, Cloud & Consulting";
  }, []);

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Services</h1>
        <p className="page-subtitle">
          Adverse builds web applications and consults on technical decisions.
          Here's what that looks like and what it costs.
        </p>
      </div>

      <div className={styles.servicesGrid}>
        {services.map((service) => (
          <div key={service.id} className={styles.serviceCard}>
            {service.icon && (
              <i className={`${service.icon} ${styles.serviceCardIcon}`}></i>
            )}
            <h3 className={styles.serviceCardTitle}>{service.title}</h3>
            <p className={styles.serviceCardDesc}>{service.description}</p>
            <ul className={styles.serviceCardDeliverables}>
              {service.deliverables.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Link to="/contact" className={styles.serviceCta}>
              Get in Touch <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
