import React from "react";
import { HERO_STATS, HERO_CONTENT } from "../constants/data";
import Button from "./Button";

// Hero Section Component - Single Responsibility Principle
const HeroSection = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">{HERO_CONTENT.title}</h1>
        <p className="hero-subtitle">{HERO_CONTENT.subtitle}</p>

        <div className="hero-buttons">
          <Button variant="primary">{HERO_CONTENT.primaryButton}</Button>
          <Button variant="secondary">{HERO_CONTENT.secondaryButton}</Button>
        </div>

        <div className="hero-stats">
          {HERO_STATS.map((stat, index) => (
            <div key={index} className="stat-item">
              <span className="stat-number">{stat.number}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
