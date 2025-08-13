import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";
import Button from "./Button";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showCreditPackages, setShowCreditPackages] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [userData, setUserData] = useState(null);
  const profileDropdownRef = useRef(null);

  // Predefined credit packages
  const creditPackages = [
    { id: 1, rupees: 70, credits: 40, popular: false },
    { id: 2, rupees: 100, credits: 60, popular: false },
    { id: 3, rupees: 200, credits: 140, popular: false },
    { id: 4, rupees: 300, credits: 200, popular: false },
    { id: 5, rupees: 400, credits: 320, popular: true },
    { id: 6, rupees: 500, credits: 435, popular: false },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch wallet balance and user data when user changes
  useEffect(() => {
    if (user) {
      fetchWalletBalance();
      fetchUserData();
    }
  }, [user]);

  // Listen for global wallet updates (join/leave/prize/refund)
  useEffect(() => {
    const onWalletUpdated = () => {
      if (user) fetchWalletBalance();
    };
    window.addEventListener("wallet:updated", onWalletUpdated);
    return () => window.removeEventListener("wallet:updated", onWalletUpdated);
  }, [user]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchWalletBalance = async () => {
    try {
      const userId = user.player_id || user.id;
      const response = await api.getWalletBalance(userId);

      if (response.success) {
        setWalletBalance(response.data.balance);
      }
    } catch (err) {
      console.error("Error fetching wallet balance:", err);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await api.getUser(user.id);
      if (response.success) {
        setUserData(response.data);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleSettings = () => {
    navigate("/settings");
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleMyTournaments = () => {
    navigate("/my-tournaments");
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleWallet = () => {
    navigate("/wallet");
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsProfileDropdownOpen(false);
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getInitials = (email) => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  };

  const formatCredits = (amount) => {
    return amount.toLocaleString();
  };

  const handlePackageSelection = (selectedPackage) => {
    setShowComingSoon(true);
    setShowCreditPackages(false);

    // Auto-hide the coming soon notification after 3 seconds
    setTimeout(() => {
      setShowComingSoon(false);
    }, 3000);
  };

  return (
    <nav className={`navbar ${isScrolled ? "navbar-scrolled" : ""}`}>
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
              <a href="#info" className="nav-link">
                About
              </a>
            </li>
            <li className="nav-item">
              <a href="#features" className="nav-link">
                Features
              </a>
            </li>
          </ul>
        </div>

        {/* Desktop Actions */}
        <div className="navbar-actions desktop-actions">
          {user ? (
            <>
              {/* Credits Display */}
              <div
                className="credits-display"
                onClick={() => setShowCreditPackages(true)}
                style={{ cursor: "pointer" }}
              >
                <span className="credits-icon">💰</span>
                <span className="credits-amount">
                  {formatCredits(walletBalance)}
                </span>
                <span className="credits-label">Credits</span>
              </div>

              <div
                className="profile-dropdown-container"
                ref={profileDropdownRef}
              >
                <Button
                  variant="secondary"
                  className="nav-btn profile-btn"
                  onClick={toggleProfileDropdown}
                >
                  <span className="profile-avatar">
                    {userData?.avatar_url ? (
                      <img
                        src={userData.avatar_url}
                        alt="Profile picture"
                        className="profile-avatar-image"
                      />
                    ) : (
                      getInitials(user.email)
                    )}
                  </span>
                  <span className="profile-text">Profile</span>
                  <span
                    className={`dropdown-arrow ${
                      isProfileDropdownOpen ? "open" : ""
                    }`}
                  >
                    ▼
                  </span>
                </Button>

                {isProfileDropdownOpen && (
                  <div className="profile-dropdown">
                    <div className="dropdown-header">
                      <div className="user-info">
                        <div className="user-avatar">
                          {userData?.avatar_url ? (
                            <img
                              src={userData.avatar_url}
                              alt="Profile picture"
                              className="user-avatar-image"
                            />
                          ) : (
                            getInitials(user.email)
                          )}
                        </div>
                        <div className="user-details">
                          <div className="user-name">{user.email}</div>
                          <div className="user-role">Player</div>
                        </div>
                      </div>
                    </div>

                    <div className="dropdown-menu">
                      <button
                        className="dropdown-item"
                        onClick={handleMyTournaments}
                      >
                        <span className="item-icon">🏆</span>
                        <span className="item-text">My Tournaments</span>
                      </button>

                      <button className="dropdown-item" onClick={handleWallet}>
                        <span className="item-icon">💰</span>
                        <span className="item-text">Wallet</span>
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
                onClick={() => navigate("/login")}
              >
                Sign In
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`mobile-menu-btn ${isMobileMenuOpen ? "active" : ""}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? "active" : ""}`}>
        <div className="mobile-nav-list">
          <li className="mobile-nav-item">
            <a
              href="#info"
              className="mobile-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </a>
          </li>
          <li className="mobile-nav-item">
            <a
              href="#features"
              className="mobile-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </a>
          </li>
        </div>

        {user && (
          <div className="mobile-profile-section">
            <div className="mobile-user-info">
              <div className="mobile-user-avatar">
                {userData?.avatar_url ? (
                  <img
                    src={userData.avatar_url}
                    alt="Profile picture"
                    className="mobile-user-avatar-image"
                  />
                ) : (
                  getInitials(user.email)
                )}
              </div>
              <div className="mobile-user-details">
                <div className="mobile-user-name">{user.email}</div>
                <div className="mobile-user-role">Player</div>
              </div>
            </div>

            {/* Mobile Credits Display */}
            <div
              className="mobile-credits-display"
              onClick={() => setShowCreditPackages(true)}
              style={{ cursor: "pointer" }}
            >
              <span className="mobile-credits-icon">💰</span>
              <span className="mobile-credits-amount">
                {formatCredits(walletBalance)} Credits
              </span>
            </div>

            <div className="mobile-profile-actions">
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
                onClick={handleWallet}
              >
                💰 Wallet
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
                navigate("/login");
                setIsMobileMenuOpen(false);
              }}
            >
              Sign In
            </Button>
          </div>
        )}
      </div>

      {/* Credit Packages Modal */}
      {showCreditPackages && (
        <div className="modal-overlay">
          <div className="modal-content credit-packages-modal">
            <div className="modal-header">
              <h3>Select Credit Package</h3>
              <button
                className="close-btn"
                onClick={() => setShowCreditPackages(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="packages-grid">
                {creditPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="package-card"
                    onClick={() => handlePackageSelection(pkg)}
                  >
                    <div className="package-header">
                      <div className="package-credits">
                        {pkg.credits} Credits
                      </div>
                      <div className="package-price">₹{pkg.rupees}</div>
                    </div>
                    <button className="select-package-btn">
                      Select Package
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coming Soon Notification */}
      {showComingSoon && (
        <div className="coming-soon-overlay">
          <div className="coming-soon-modal">
            <div className="coming-soon-icon">🚀</div>
            <h3>Coming Soon!</h3>
            <p>Credit purchase functionality will be available soon.</p>
            <p>Stay tuned for updates!</p>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
