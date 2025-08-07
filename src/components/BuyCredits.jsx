import React, { useState } from "react";
import Button from "./Button";

const BuyCredits = () => {
  const [selectedPackage, setSelectedPackage] = useState(null);

  const creditPackages = [
    {
      id: 1,
      name: "Starter",
      credits: 100,
      price: 9.99,
      popular: false,
      features: [
        "100 Credits",
        "Basic tournament features",
        "Email support",
        "Standard processing"
      ]
    },
    {
      id: 2,
      name: "Pro",
      credits: 500,
      price: 39.99,
      popular: true,
      features: [
        "500 Credits",
        "Advanced tournament features",
        "Priority support",
        "Fast processing",
        "Custom branding"
      ]
    },
    {
      id: 3,
      name: "Enterprise",
      credits: 1000,
      price: 69.99,
      popular: false,
      features: [
        "1000 Credits",
        "All features included",
        "24/7 support",
        "Instant processing",
        "Custom branding",
        "API access"
      ]
    }
  ];

  const handlePackageSelect = (packageId) => {
    setSelectedPackage(packageId);
  };

  const handlePurchase = () => {
    if (selectedPackage) {
      // Handle purchase logic here
      console.log(`Purchasing package: ${selectedPackage}`);
      alert(`Redirecting to payment for ${creditPackages.find(p => p.id === selectedPackage)?.name} package`);
    }
  };

  return (
    <section className="buy-credits-section" id="credits">
      <div className="credits-container">
        <div className="credits-header">
          <h2 className="credits-title">Buy Credits</h2>
          <p className="credits-subtitle">
            Purchase credits to create tournaments, access premium features, and unlock advanced functionality
          </p>
        </div>

        <div className="credits-info">
          <div className="credits-benefits">
            <h3>What can you do with credits?</h3>
            <ul>
              <li>🎯 Create tournaments with custom rules</li>
              <li>🏆 Set up prize pools and rewards</li>
              <li>⚡ Access premium tournament features</li>
              <li>🔒 Enable advanced security options</li>
              <li>📊 Get detailed analytics and reports</li>
            </ul>
          </div>
        </div>

        <div className="packages-grid">
          {creditPackages.map((pkg) => (
            <div 
              key={pkg.id} 
              className={`package-card ${pkg.popular ? 'popular' : ''} ${selectedPackage === pkg.id ? 'selected' : ''}`}
              onClick={() => handlePackageSelect(pkg.id)}
            >
              {pkg.popular && (
                <div className="popular-badge">Most Popular</div>
              )}
              
              <div className="package-header">
                <h3 className="package-name">{pkg.name}</h3>
                <div className="package-price">
                  <span className="price-amount">${pkg.price}</span>
                  <span className="price-period">one-time</span>
                </div>
                <div className="package-credits">{pkg.credits} Credits</div>
              </div>

              <div className="package-features">
                {pkg.features.map((feature, index) => (
                  <div key={index} className="package-feature">
                    <span className="feature-check">✓</span>
                    <span className="feature-text">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                variant={selectedPackage === pkg.id ? "primary" : "secondary"}
                className="package-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePackageSelect(pkg.id);
                }}
              >
                {selectedPackage === pkg.id ? "Selected" : "Select Package"}
              </Button>
            </div>
          ))}
        </div>

        {selectedPackage && (
          <div className="purchase-section">
            <div className="selected-package-info">
              <h3>Selected Package: {creditPackages.find(p => p.id === selectedPackage)?.name}</h3>
              <p>Total: ${creditPackages.find(p => p.id === selectedPackage)?.price}</p>
            </div>
            <Button 
              variant="primary" 
              className="purchase-button"
              onClick={handlePurchase}
            >
              Purchase Credits
            </Button>
          </div>
        )}

        <div className="credits-note">
          <p>
            <strong>Note:</strong> Credits are non-refundable and expire after 12 months. 
            Unused credits can be transferred to other users.
          </p>
        </div>
      </div>
    </section>
  );
};

export default BuyCredits;
