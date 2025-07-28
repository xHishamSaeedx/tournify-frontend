import React from "react";
import FeatureCard from "./FeatureCard";
import CallToAction from "./CallToAction";
import { FEATURES, ABOUT_CONTENT } from "../constants/data";

// About Section Component - Single Responsibility Principle
const AboutSection = () => {
  return (
    <section className="about">
      <div className="about-container">
        <div className="about-header">
          <h2 className="about-title">{ABOUT_CONTENT.title}</h2>
          <p className="about-subtitle">{ABOUT_CONTENT.subtitle}</p>
        </div>

        <div className="features-grid">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>

        <CallToAction />
      </div>
    </section>
  );
};

export default AboutSection; 