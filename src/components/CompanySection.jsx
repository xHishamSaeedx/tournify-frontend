import React, { useState, useEffect } from "react";

// Company Section Component - Single Responsibility Principle
const CompanySection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById("company");
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      className={`company-section ${isVisible ? "visible" : ""}`}
      id="company"
    >
      <div className="company-background">
        <div className="company-grid-pattern"></div>
        <div className="company-glow-effect"></div>
      </div>

      <div className="company-container">
        <div className="company-header">
          <div className="section-badge">
            <span className="badge-icon">🏢</span>
            <span className="badge-text">About Us</span>
          </div>
          <h2 className="company-title">Powered by Xpert Games</h2>
          <p className="company-subtitle">
            A leading gaming technology company dedicated to creating exceptional tournament experiences
          </p>
        </div>

        <div className="company-showcase">
          <div className="company-card-modern">
            <div className="company-card-background">
              <div className="company-card-glow"></div>
              <div className="company-card-pattern"></div>
            </div>

            <div className="company-content">
              <div className="company-logo-container">
                <div className="company-logo">
                  <img 
                    src="/assets/xpert_logo.png" 
                    alt="Xpert Games Logo" 
                    className="logo-image"
                  />
                </div>
                <div className="company-logo-glow"></div>
              </div>

              <div className="company-info">
                <h3 className="company-name">Xpert Games</h3>
                <p className="company-tagline">Gaming Excellence</p>
                <p className="company-description">
                  We are passionate about revolutionizing the gaming tournament experience. 
                  Our cutting-edge platform combines advanced technology with user-friendly design 
                  to create seamless, engaging, and competitive gaming environments.
                </p>

                <div className="company-benefits">
                  <div className="company-benefit">
                    <span className="benefit-check">✓</span>
                    <span className="benefit-text">Industry Expertise</span>
                  </div>
                  <div className="company-benefit">
                    <span className="benefit-check">✓</span>
                    <span className="benefit-text">Innovation Driven</span>
                  </div>
                  <div className="company-benefit">
                    <span className="benefit-check">✓</span>
                    <span className="benefit-text">Player Focused</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanySection;
