import React from "react";
import Button from "./Button";

const InfoSection = () => {
  const infoSections = [
    {
      id: 1,
      title: "What is Tournify?",
      icon: "🏆",
      description: "Tournify is the ultimate platform for organizing and participating in competitive gaming tournaments. We provide a seamless experience for tournament organizers and players alike, with advanced features for match management, prize distribution, and community building.",
      features: [
        "Automated tournament brackets",
        "Real-time match tracking",
        "Secure prize pool management",
        "Anti-cheat integration"
      ]
    },
    {
      id: 2,
      title: "Why Choose Tournify?",
      icon: "⭐",
      description: "Built by gamers, for gamers. Our platform combines cutting-edge technology with deep understanding of competitive gaming needs to deliver the best tournament experience possible.",
      features: [
        "User-friendly interface",
        "24/7 customer support",
        "Fair play enforcement",
        "Community-driven features"
      ]
    },
    {
      id: 3,
      title: "Contact Us",
      icon: "📞",
      description: "Have questions or need support? Our team is here to help you succeed in your gaming journey.",
      contactInfo: {
        email: "support@tournify.com",
        discord: "discord.gg/tournify",
        twitter: "@tournify",
        phone: "+1 (555) 123-4567"
      }
    }
  ];

  return (
    <section className="info-section" id="info">
      <div className="info-container">
        <div className="info-header">
          <h2 className="info-title">About Tournify</h2>
          <p className="info-subtitle">
            Learn more about our platform and get in touch with our team
          </p>
        </div>

        <div className="info-grid">
          {infoSections.map((section) => (
            <div key={section.id} className="info-card">
              <div className="info-card-header">
                <div className="info-icon">{section.icon}</div>
                <h3 className="info-card-title">{section.title}</h3>
              </div>
              
              <p className="info-card-description">{section.description}</p>
              
              {section.features && (
                <div className="info-features">
                  {section.features.map((feature, index) => (
                    <div key={index} className="info-feature">
                      <span className="feature-icon">✓</span>
                      <span className="feature-text">{feature}</span>
                    </div>
                  ))}
                </div>
              )}

              {section.contactInfo && (
                <div className="contact-info">
                  <div className="contact-item">
                    <span className="contact-icon">📧</span>
                    <span className="contact-text">{section.contactInfo.email}</span>
                  </div>
                  <div className="contact-item">
                    <span className="contact-icon">🎮</span>
                    <span className="contact-text">{section.contactInfo.discord}</span>
                  </div>
                  <div className="contact-item">
                    <span className="contact-icon">🐦</span>
                    <span className="contact-text">{section.contactInfo.twitter}</span>
                  </div>
                  <div className="contact-item">
                    <span className="contact-icon">📱</span>
                    <span className="contact-text">{section.contactInfo.phone}</span>
                  </div>
                </div>
              )}

              {section.id === 3 && (
                <div className="contact-actions">
                  <Button variant="primary" className="contact-btn">
                    Send Message
                  </Button>
                  <Button variant="secondary" className="contact-btn">
                    Join Discord
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
