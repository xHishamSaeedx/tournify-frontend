import React, { useState, useEffect } from "react";
import FeatureCard from "./FeatureCard";
import CallToAction from "./CallToAction";
import { FEATURES, ABOUT_CONTENT } from "../constants/data";

// About Section Component - Single Responsibility Principle
const AboutSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById("about");
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      className={`about-section ${isVisible ? "visible" : ""}`}
      id="about"
    >
      <div className="about-background">
        <div className="about-grid-pattern"></div>
        <div className="about-glow-effect"></div>
      </div>

      <div className="about-container">
        <div className="about-header">
          <div className="section-badge">
            <span className="badge-icon">🚀</span>
            <span className="badge-text">Our Features</span>
          </div>
          <h2 className="about-title">{ABOUT_CONTENT.title}</h2>
          <p className="about-subtitle">{ABOUT_CONTENT.subtitle}</p>
        </div>

        <div className="features-showcase">
          {FEATURES.map((feature, index) => (
            <div
              key={feature.id}
              className={`feature-card-modern ${
                hoveredCard === feature.id ? "hovered" : ""
              }`}
              onMouseEnter={() => setHoveredCard(feature.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                "--animation-delay": `${index * 0.2}s`,
              }}
            >
              <div className="feature-card-background">
                <div className="feature-card-glow"></div>
                <div className="feature-card-pattern"></div>
              </div>

              <div className="feature-content">
                <div className="feature-card-header">
                  <div className="feature-icon-container">
                    <div className="feature-icon">{feature.icon}</div>
                    <div className="feature-icon-glow"></div>
                  </div>

                  <div className="feature-card-info">
                    <h3 className="feature-card-title">{feature.title}</h3>
                    <p className="feature-card-tagline">Premium Feature</p>
                  </div>
                </div>

                <p className="feature-card-description">
                  {feature.description}
                </p>

                <div className="feature-benefits">
                  <div className="feature-benefit">
                    <span className="benefit-check">✓</span>
                    <span className="benefit-text">Advanced Technology</span>
                  </div>
                  <div className="feature-benefit">
                    <span className="benefit-check">✓</span>
                    <span className="benefit-text">User-Friendly</span>
                  </div>
                  <div className="feature-benefit">
                    <span className="benefit-check">✓</span>
                    <span className="benefit-text">24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <CallToAction />
      </div>
    </section>
  );
};

export default AboutSection;
