import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleProfile = () => {
    navigate('/profile');
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handlePlayerForm = () => {
    navigate('/player-form');
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleSettings = () => {
    navigate('/settings');
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleMyTournaments = () => {
    navigate('/my-tournaments');
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsProfileDropdownOpen(false);
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getInitials = (email) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <a href="/" className="logo-link">
            <span className="logo-text">Tournify</span>
          </a>
        </div>

        {/* Desktop Menu */}
        <div className="navbar-menu desktop-menu">
          <ul className="nav-list">
            <li className="nav-item">
              <a href="#info" className="nav-link">About</a>
            </li>
            <li className="nav-item">
              <a href="#features" className="nav-link">Features</a>
            </li>
            <li className="nav-item">
              <a href="#credits" className="nav-link">Buy Credits</a>
            </li>
          </ul>
        </div>

        {/* Desktop Actions */}
        <div className="navbar-actions desktop-actions">
          {user ? (
            <>
              <div className="profile-dropdown-container" ref={profileDropdownRef}>
                <Button
                  variant="secondary"
                  className="nav-btn profile-btn"
                  onClick={toggleProfileDropdown}
                >
                  <span className="profile-avatar">{getInitials(user.email)}</span>
                  <span className="profile-text">Profile</span>
                  <span className={`dropdown-arrow ${isProfileDropdownOpen ? 'open' : ''}`}>▼</span>
                </Button>

                {isProfileDropdownOpen && (
                  <div className="profile-dropdown">
                    <div className="dropdown-header">
                      <div className="user-info">
                        <div className="user-avatar">{getInitials(user.email)}</div>
                        <div className="user-details">
                          <div className="user-name">{user.email}</div>
                          <div className="user-role">Player</div>
                        </div>
                      </div>
                    </div>

                    <div className="dropdown-menu">
                      <div className="dropdown-item-group">
                        <button
                          className="dropdown-item"
                          onClick={handleProfile}
                        >
                          <span className="item-icon">👤</span>
                          <span className="item-text">View Profile</span>
                          <span className="submenu-arrow">▶</span>
                        </button>
                        <div className="submenu">
                          <button
                            className="submenu-item"
                            onClick={handlePlayerForm}
                          >
                            <span className="item-icon">🎮</span>
                            <span className="item-text">Player Form</span>
                          </button>
                        </div>
                      </div>

                      <button
                        className="dropdown-item"
                        onClick={handleMyTournaments}
                      >
                        <span className="item-icon">🏆</span>
                        <span className="item-text">My Tournaments</span>
                      </button>

                      <button
                        className="dropdown-item"
                        onClick={handleSettings}
                      >
                        <span className="item-icon">⚙️</span>
                        <span className="item-text">Settings</span>
                      </button>

                      <div className="dropdown-divider"></div>

                      <button
                        className="dropdown-item signout-item"
                        onClick={handleSignOut}
                      >
                        <span className="item-icon">🚪</span>
                        <span className="item-text">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                className="nav-btn"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>

              {/* Mobile Menu */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <div className="mobile-nav-list">
            <li className="mobile-nav-item">
              <a href="#info" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                About
              </a>
            </li>
            <li className="mobile-nav-item">
              <a href="#features" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                Features
              </a>
            </li>
            <li className="mobile-nav-item">
              <a href="#credits" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                Buy Credits
              </a>
            </li>
          </div>

        {user && (
          <div className="mobile-profile-section">
            <div className="mobile-user-info">
              <div className="mobile-user-avatar">{getInitials(user.email)}</div>
              <div className="mobile-user-details">
                <div className="mobile-user-name">{user.email}</div>
                <div className="mobile-user-role">Player</div>
              </div>
            </div>
            <div className="mobile-profile-actions">
              <Button
                variant="secondary"
                className="mobile-nav-btn"
                onClick={handleProfile}
              >
                👤 View Profile
              </Button>
              <Button
                variant="secondary"
                className="mobile-nav-btn"
                onClick={handlePlayerForm}
              >
                🎮 Player Form
              </Button>
              <Button
                variant="secondary"
                className="mobile-nav-btn"
                onClick={handleMyTournaments}
              >
                🏆 My Tournaments
              </Button>
              <Button
                variant="secondary"
                className="mobile-nav-btn"
                onClick={handleSettings}
              >
                ⚙️ Settings
              </Button>
              <Button
                variant="primary"
                className="mobile-nav-btn"
                onClick={handleSignOut}
              >
                🚪 Sign Out
              </Button>
            </div>
          </div>
        )}

        {!user && (
          <div className="mobile-actions">
            <Button
              variant="primary"
              className="mobile-nav-btn"
              onClick={() => {
                navigate('/login');
                setIsMobileMenuOpen(false);
              }}
            >
              Sign In
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
