import React, { useState, useEffect } from "react";
import Button from "./Button";

const InfoSection = () => {
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

    const section = document.getElementById("info");
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  const infoSections = [
    {
      id: 1,
      title: "What is Tournify?",
      tagline: "Ultimate Gaming Platform",
      icon: "🏆",
      description:
        "Tournify is the ultimate platform for organizing and participating in competitive gaming tournaments. We provide a seamless experience for tournament organizers and players alike, with advanced features for match management, prize distribution, and community building.",
      features: [
        "Automated tournament brackets",
        "Real-time match tracking",
        "Secure prize pool management",
        "Anti-cheat integration",
      ],
      color: "#ff4655",
      gradient: "linear-gradient(135deg, #ff4655, #ff6b7a)",
    },
    {
      id: 2,
      title: "Why Choose Tournify?",
      tagline: "Built by Gamers, for Gamers",
      icon: "⭐",
      description:
        "Built by gamers, for gamers. Our platform combines cutting-edge technology with deep understanding of competitive gaming needs to deliver the best tournament experience possible.",
      features: [
        "User-friendly interface",
        "24/7 customer support",
        "Fair play enforcement",
        "Community-driven features",
      ],
      color: "#00f0ff",
      gradient: "linear-gradient(135deg, #00f0ff, #00d4ff)",
    },
    {
      id: 3,
      title: "Contact Us",
      tagline: "Get in Touch",
      icon: "📞",
      description:
        "Have questions or need support? Our team is here to help you succeed in your gaming journey.",
      contactInfo: {
        email: "support@tournify.com",
        discord: "discord.gg/tournify",
        twitter: "@tournify",
        phone: "+1 (555) 123-4567",
      },
      color: "#7cfc00",
      gradient: "linear-gradient(135deg, #7cfc00, #4ecdc4)",
    },
  ];

  return (
    <section className={`info-section ${isVisible ? "visible" : ""}`} id="info">
      <div className="info-background">
        <div className="info-grid-pattern"></div>
        <div className="info-glow-effect"></div>
      </div>

      <div className="info-container">
        <div className="info-header">
          <div className="section-badge">
            <span className="badge-icon">🚀</span>
            <span className="badge-text">About Tournify</span>
          </div>
          <h2 className="info-title">
            Why Choose
            <span className="title-accent"> Tournify?</span>
          </h2>
          <p className="info-subtitle">
            Discover what makes us the ultimate choice for competitive gaming
            tournaments
          </p>
        </div>

        <div className="info-showcase">
          {infoSections.map((section, index) => (
            <div
              key={section.id}
              className={`info-card ${
                hoveredCard === section.id ? "hovered" : ""
              }`}
              onMouseEnter={() => setHoveredCard(section.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                "--card-color": section.color,
                "--card-gradient": section.gradient,
                "--animation-delay": `${index * 0.2}s`,
              }}
            >
              <div className="info-card-background">
                <div className="info-card-glow"></div>
                <div className="info-card-pattern"></div>
              </div>

              <div className="info-content">
                <div className="info-card-header">
                  <div className="info-icon-container">
                    <div
                      className="info-icon"
                      style={{ background: section.gradient }}
                    >
                      {section.icon}
                    </div>
                    <div className="info-icon-glow"></div>
                  </div>

                  <div className="info-card-info">
                    <h3 className="info-card-title">{section.title}</h3>
                    <p className="info-card-tagline">{section.tagline}</p>
                  </div>
                </div>

                <p className="info-card-description">{section.description}</p>

                {section.features && (
                  <div className="info-features">
                    {section.features.map((feature, idx) => (
                      <div key={idx} className="info-feature">
                        <span className="feature-check">✓</span>
                        <span className="feature-text">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}

                {section.contactInfo && (
                  <div className="contact-info">
                    <div className="contact-item">
                      <span className="contact-icon">📧</span>
                      <span className="contact-text">
                        {section.contactInfo.email}
                      </span>
                    </div>
                    <div className="contact-item">
                      <span className="contact-icon">🎮</span>
                      <span className="contact-text">
                        {section.contactInfo.discord}
                      </span>
                    </div>
                    <div className="contact-item">
                      <span className="contact-icon">🐦</span>
                      <span className="contact-text">
                        {section.contactInfo.twitter}
                      </span>
                    </div>
                    <div className="contact-item">
                      <span className="contact-icon">📱</span>
                      <span className="contact-text">
                        {section.contactInfo.phone}
                      </span>
                    </div>
                  </div>
                )}

                {section.id === 3 && (
                  <div className="contact-actions">
                    <Button variant="primary" className="contact-btn">
                      <span className="button-text">Send Message</span>
                      <span className="button-arrow">→</span>
                    </Button>
                    <Button variant="secondary" className="contact-btn">
                      <span className="button-text">Join Discord</span>
                      <span className="button-arrow">→</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
