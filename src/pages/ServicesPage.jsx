import { Link } from "react-router-dom";
import services from "../data/services";

export default function ServicesPage() {
  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Services</h1>
        <p className="page-subtitle">
          We build web applications and consult on technical decisions. Here's
          what that looks like and what it costs.
        </p>
      </div>

      <div className="services-grid">
        {services.map((service) => (
          <div key={service.id} className="service-card">
            {service.icon && (
              <i className={`${service.icon} service-card-icon`}></i>
            )}
            <h3 className="service-card-title">{service.title}</h3>
            <p className="service-card-desc">{service.description}</p>
            <ul className="service-card-deliverables">
              {service.deliverables.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Link to="/contact" className="service-cta">
              Get in Touch <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
