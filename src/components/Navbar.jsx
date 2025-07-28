import React, { useState, useEffect } from "react";
import Button from "./Button";
import { NAV_ITEMS, NAVBAR_CONTENT } from "../constants/data";

// Navbar Component - Single Responsibility Principle
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className={`navbar ${isScrolled ? "navbar-scrolled" : ""}`}>
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <a href="#home" className="logo-link">
            <span className="logo-text">{NAVBAR_CONTENT.logo}</span>
          </a>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-menu desktop-menu">
          <ul className="nav-list">
            {NAV_ITEMS.map((item, index) => (
              <li key={index} className="nav-item">
                <a href={item.href} className="nav-link" onClick={closeMenu}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Desktop CTA Buttons */}
        <div className="navbar-actions desktop-actions">
          <Button variant="secondary" className="nav-btn">
            {NAVBAR_CONTENT.signInButton}
          </Button>
          <Button variant="primary" className="nav-btn">
            {NAVBAR_CONTENT.getStartedButton}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`mobile-menu-btn ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        {/* Mobile Navigation */}
        <div className={`mobile-menu ${isMenuOpen ? "active" : ""}`}>
          <ul className="mobile-nav-list">
            {NAV_ITEMS.map((item, index) => (
              <li key={index} className="mobile-nav-item">
                <a
                  href={item.href}
                  className="mobile-nav-link"
                  onClick={closeMenu}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mobile-actions">
            <Button variant="secondary" className="mobile-nav-btn">
              {NAVBAR_CONTENT.signInButton}
            </Button>
            <Button variant="primary" className="mobile-nav-btn">
              {NAVBAR_CONTENT.getStartedButton}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
