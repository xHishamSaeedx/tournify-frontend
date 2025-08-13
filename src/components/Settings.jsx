import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import BackButton from "./BackButton";
import api from "../utils/api";
import "./Settings.css";

const Settings = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [walletLoading, setWalletLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form data for profile editing
  const [formData, setFormData] = useState({
    display_name: "",
    username: "",
    DOB: "",
    selected_game: "",
    valo_name: "",
    valo_tag: "",
    VPA: "",
    platform: "",
    region: "",
  });

  // Predefined credit packages
  const creditPackages = [
    { id: 1, rupees: 70, credits: 40, popular: false },
    { id: 2, rupees: 100, credits: 60, popular: false },
    { id: 3, rupees: 200, credits: 140, popular: false },
    { id: 4, rupees: 300, credits: 200, popular: false },
    { id: 5, rupees: 400, credits: 320, popular: true },
    { id: 6, rupees: 500, credits: 435, popular: false },
  ];

  useEffect(() => {
    if (user) {
      fetchPlayerData();
      fetchWalletBalance();
      fetchTransactions();
    }
  }, [user, currentPage]);

  // Refresh balance and transactions when wallet updates elsewhere
  useEffect(() => {
    const onWalletUpdated = () => {
      if (user) {
        fetchWalletBalance();
        fetchTransactions();
      }
    };
    window.addEventListener("wallet:updated", onWalletUpdated);
    return () => window.removeEventListener("wallet:updated", onWalletUpdated);
  }, [user, currentPage]);

  const fetchPlayerData = async () => {
    if (user) {
      try {
        const response = await api.getPlayer(user.id);
        if (response.success) {
          setPlayerData(response.data);

          // Get Valorant data from the valorant_users array
          const valorantData =
            response.data.valorant_users &&
            response.data.valorant_users.length > 0
              ? response.data.valorant_users[0]
              : null;

          setFormData({
            display_name: response.data.display_name || "",
            username: response.data.username || "",
            DOB: response.data.DOB || "",
            selected_game: valorantData ? "valorant" : "",
            valo_name: valorantData?.valorant_name || "",
            valo_tag: valorantData?.valorant_tag || "",
            VPA: response.data.VPA || "",
            platform: valorantData?.platform || "",
            region: valorantData?.region || "",
          });
        }
      } catch (error) {
        console.error("Error fetching player data:", error);
      } finally {
        setLoading(false);
      }
    }
  };

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

  const fetchTransactions = async () => {
    try {
      setWalletLoading(true);
      const userId = user.player_id || user.id;
      const response = await api.getWalletTransactions(userId, currentPage, 10);

      if (response.success) {
        setTransactions(response.data);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setWalletLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const playerData = {
        player_id: user.id,
        display_name: formData.display_name.trim(),
        username: formData.username.trim(),
        DOB: formData.DOB,
        VPA: formData.VPA.trim(),
      };

      // Only include Valorant data if Valorant is selected and all fields are filled
      if (
        formData.selected_game === "valorant" &&
        formData.valo_name &&
        formData.valo_tag &&
        formData.platform &&
        formData.region
      ) {
        playerData.valo_name = formData.valo_name.trim();
        playerData.valo_tag = formData.valo_tag.trim();
        playerData.platform = formData.platform;
        playerData.region = formData.region;
      }

      const response = await api.updatePlayer(user.id, playerData);

      if (!response.success) {
        throw new Error(response.error || "Failed to update profile");
      }

      setMessage("Profile updated successfully!");
      fetchPlayerData(); // Refresh data
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getInitials = (email) => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "credit":
        return "💰";
      case "debit":
        return "💸";
      case "tournament_entry":
        return "🎮";
      case "tournament_prize":
        return "🏆";
      default:
        return "📊";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <BackButton />

        <div className="settings-header">
          <div className="settings-avatar">{getInitials(user.email)}</div>
          <div className="settings-user-info">
            <h1 className="settings-title">Settings</h1>
            <p className="settings-subtitle">
              Manage your profile, wallet, and account preferences
            </p>
          </div>
        </div>

        <div className="settings-tabs">
          <button
            className={`settings-tab ${
              activeTab === "profile" ? "active" : ""
            }`}
            onClick={() => setActiveTab("profile")}
          >
            <span className="tab-icon">👤</span>
            Profile
          </button>
          <button
            className={`settings-tab ${activeTab === "wallet" ? "active" : ""}`}
            onClick={() => setActiveTab("wallet")}
          >
            <span className="tab-icon">💰</span>
            Wallet
          </button>
          <button
            className={`settings-tab ${
              activeTab === "account" ? "active" : ""
            }`}
            onClick={() => setActiveTab("account")}
          >
            <span className="tab-icon">⚙️</span>
            Account
          </button>
        </div>

        <div className="settings-content">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="settings-tab-content">
              <div className="profile-section">
                <h2 className="section-title">Profile Information</h2>
                <p className="section-description">
                  Update your personal information and game details
                </p>

                <form onSubmit={handleProfileSubmit} className="profile-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="display_name" className="form-label">
                        Display Name *
                      </label>
                      <input
                        type="text"
                        id="display_name"
                        name="display_name"
                        value={formData.display_name}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                        placeholder="Enter your display name"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="username" className="form-label">
                        Username *
                      </label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                        placeholder="Enter your username"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="DOB" className="form-label">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        id="DOB"
                        name="DOB"
                        value={formData.DOB}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="selected_game" className="form-label">
                        Select Game
                      </label>
                      <select
                        id="selected_game"
                        name="selected_game"
                        value={formData.selected_game}
                        onChange={handleInputChange}
                        className="form-input"
                      >
                        <option value="">Select a game (optional)</option>
                        <option value="valorant">Valorant</option>
                      </select>
                    </div>

                    {formData.selected_game === "valorant" && (
                      <>
                        <div className="form-group">
                          <label htmlFor="valo_name" className="form-label">
                            Valorant Username *
                          </label>
                          <input
                            type="text"
                            id="valo_name"
                            name="valo_name"
                            value={formData.valo_name}
                            onChange={handleInputChange}
                            required
                            className="form-input"
                            placeholder="Enter your Valorant username"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="valo_tag" className="form-label">
                            Valorant Tag *
                          </label>
                          <input
                            type="text"
                            id="valo_tag"
                            name="valo_tag"
                            value={formData.valo_tag}
                            onChange={handleInputChange}
                            required
                            className="form-input"
                            placeholder="Enter your Valorant tag (e.g., #NA1)"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="platform" className="form-label">
                            Platform *
                          </label>
                          <select
                            id="platform"
                            name="platform"
                            value={formData.platform}
                            onChange={handleInputChange}
                            required
                            className="form-input"
                          >
                            <option value="">Select Platform</option>
                            <option value="pc">PC</option>
                            <option value="console">Console</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label htmlFor="region" className="form-label">
                            Region *
                          </label>
                          <select
                            id="region"
                            name="region"
                            value={formData.region}
                            onChange={handleInputChange}
                            required
                            className="form-input"
                          >
                            <option value="">Select Region</option>
                            <option value="eu">EU</option>
                            <option value="na">NA</option>
                            <option value="latam">LATAM</option>
                            <option value="br">BR</option>
                            <option value="ap">AP</option>
                            <option value="kr">KR</option>
                          </select>
                        </div>
                      </>
                    )}

                    <div className="form-group full-width">
                      <label htmlFor="VPA" className="form-label">
                        VPA *
                      </label>
                      <input
                        type="text"
                        id="VPA"
                        name="VPA"
                        value={formData.VPA}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                        placeholder="Enter your VPA"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="profile-submit-btn"
                  >
                    {loading ? (
                      <span className="loading-spinner">
                        <span className="spinner"></span>
                        Updating...
                      </span>
                    ) : (
                      "Update Profile"
                    )}
                  </button>
                </form>

                {message && (
                  <div
                    className={`message ${
                      message.includes("Error") ? "error" : "success"
                    }`}
                  >
                    {message}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Wallet Tab */}
          {activeTab === "wallet" && (
            <div className="settings-tab-content">
              <div className="wallet-section">
                <h2 className="section-title">Wallet & Credits</h2>
                <p className="section-description">
                  Manage your credits and view transaction history
                </p>

                <div className="wallet-overview">
                  <div className="wallet-balance-card">
                    <div className="balance-icon">💰</div>
                    <div className="balance-info">
                      <h3 className="balance-label">Current Balance</h3>
                      <p className="balance-amount">{walletBalance} Credits</p>
                    </div>
                  </div>
                </div>

                <div className="wallet-actions">
                  <h3 className="subsection-title">Buy Credits</h3>
                  <div className="credit-packages">
                    {creditPackages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className={`credit-package ${
                          pkg.popular ? "popular" : ""
                        }`}
                      >
                        {pkg.popular && (
                          <div className="popular-badge">Most Popular</div>
                        )}
                        <div className="package-credits">
                          {pkg.credits} Credits
                        </div>
                        <div className="package-price">₹{pkg.rupees}</div>
                        <button className="package-buy-btn" disabled>
                          Coming Soon
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="transaction-history">
                  <h3 className="subsection-title">Transaction History</h3>
                  {walletLoading ? (
                    <div className="loading-spinner">
                      <span className="spinner"></span>
                      Loading transactions...
                    </div>
                  ) : transactions.length > 0 ? (
                    <div className="transactions-list">
                      {transactions.map((transaction, index) => (
                        <div key={index} className="transaction-item">
                          <div className="transaction-icon">
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div className="transaction-details">
                            <div className="transaction-description">
                              {transaction.description}
                            </div>
                            <div className="transaction-date">
                              {formatDate(transaction.created_at)}
                            </div>
                          </div>
                          <div
                            className={`transaction-amount ${
                              transaction.type === "credit" ||
                              transaction.type === "tournament_prize"
                                ? "positive"
                                : "negative"
                            }`}
                          >
                            {transaction.type === "credit" ||
                            transaction.type === "tournament_prize"
                              ? "+"
                              : "-"}
                            {transaction.amount} Credits
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-transactions">
                      <p>No transactions yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === "account" && (
            <div className="settings-tab-content">
              <div className="account-section">
                <h2 className="section-title">Account Settings</h2>
                <p className="section-description">
                  Manage your account preferences and security
                </p>

                <div className="account-info">
                  <div className="info-item">
                    <label className="info-label">Email</label>
                    <p className="info-value">{user.email}</p>
                  </div>
                  <div className="info-item">
                    <label className="info-label">Account Type</label>
                    <p className="info-value">Player</p>
                  </div>
                  <div className="info-item">
                    <label className="info-label">Member Since</label>
                    <p className="info-value">
                      {new Date(user.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="account-actions">
                  <h3 className="subsection-title">Account Actions</h3>
                  <div className="action-buttons">
                    <button className="action-btn secondary">
                      <span className="action-icon">🔒</span>
                      Change Password
                    </button>
                    <button className="action-btn secondary">
                      <span className="action-icon">📧</span>
                      Update Email
                    </button>
                    <button className="action-btn secondary">
                      <span className="action-icon">🔔</span>
                      Notification Settings
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="action-btn danger"
                    >
                      <span className="action-icon">🚪</span>
                      Sign Out
                    </button>
                  </div>
                </div>

                <div className="account-danger-zone">
                  <h3 className="subsection-title danger">Danger Zone</h3>
                  <p className="danger-description">
                    These actions cannot be undone. Please proceed with caution.
                  </p>
                  <button className="action-btn danger" disabled>
                    <span className="action-icon">🗑️</span>
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
