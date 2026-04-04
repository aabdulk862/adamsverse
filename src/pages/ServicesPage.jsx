import { useNavigate } from "react-router-dom";
import services from "../data/services";
import { useAuth } from "../hooks/useAuth";

export default function ServicesPage() {
  const { session, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  function handleGetStarted(tierId) {
    if (session) {
      navigate(`/dashboard/intake/${tierId}`);
    } else {
      sessionStorage.setItem("selectedTier", tierId);
      signInWithGoogle();
    }
  }

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
            <div className="service-card-price">{service.priceRange}</div>
            <ul className="service-card-deliverables">
              {service.deliverables.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <button
              type="button"
              className="service-cta"
              onClick={() => handleGetStarted(service.id)}
            >
              Get Started <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
