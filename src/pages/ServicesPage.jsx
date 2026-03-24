import { Link } from "react-router-dom";
import services from "../data/services";

export default function ServicesPage() {
  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Services</h1>
        <p className="page-subtitle">
          Here's what I can do for you. Let's build something great together.
        </p>
      </div>

      <div className="services-grid">
        {services.map((service) => (
          <div key={service.id} className="service-card">
            <h3 className="service-card-title">{service.title}</h3>
            <p className="service-card-desc">{service.description}</p>
            <div className="service-card-price">{service.priceRange}</div>
            <ul className="service-card-deliverables">
              {service.deliverables.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Link to="/#contact" className="service-cta">
              Get Started <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
