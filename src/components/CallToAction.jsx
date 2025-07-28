import React from "react";
import { CTA_CONTENT } from "../constants/data";
import Button from "./Button";

// Call to Action Component - Single Responsibility Principle
const CallToAction = () => {
  return (
    <div className="about-cta">
      <h3 className="cta-title">{CTA_CONTENT.title}</h3>
      <p className="cta-subtitle">{CTA_CONTENT.subtitle}</p>
      <Button variant="primary">{CTA_CONTENT.buttonText}</Button>
    </div>
  );
};

export default CallToAction; 