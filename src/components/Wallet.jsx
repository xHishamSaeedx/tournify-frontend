import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";
import "./Wallet.css";

const Wallet = () => {
  const { user } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreditPackages, setShowCreditPackages] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

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

  const fetchWalletBalance = async () => {
    try {
      const userId = user.player_id || user.id;
      const response = await api.getWalletBalance(userId);

      if (response.success) {
        setWalletBalance(response.data.balance);
      } else {
        setError("Failed to fetch wallet balance");
      }
    } catch (err) {
      console.error("Error fetching wallet balance:", err);
      setError("Failed to load wallet balance");
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const userId = user.player_id || user.id;
      const response = await api.getWalletTransactions(userId, currentPage, 10);

      if (response.success) {
        setTransactions(response.data);
        setTotalPages(response.pagination.totalPages);
      } else {
        setError("Failed to fetch transactions");
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load transaction history");
    } finally {
      setLoading(false);
    }
  };

  const handlePackageSelection = (selectedPackage) => {
    setShowComingSoon(true);
    setShowCreditPackages(false);

    // Auto-hide the coming soon notification after 3 seconds
    setTimeout(() => {
      setShowComingSoon(false);
    }, 3000);
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
      case "refund":
        return "↩️";
      default:
        return "📊";
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case "credit":
      case "tournament_prize":
        return "positive";
      case "debit":
      case "tournament_entry":
        return "negative";
      case "refund":
        return "neutral";
      default:
        return "neutral";
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

  const formatAmount = (amount) => {
    return amount.toLocaleString();
  };

  if (!user) {
    return (
      <div className="wallet-container">
        <div className="wallet-header">
          <h2>💰 Wallet</h2>
          <p>Please sign in to view your wallet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-container">
      <div className="wallet-header">
        <h2>💰 Wallet</h2>
        <button
          className="add-credits-btn"
          onClick={() => setShowCreditPackages(true)}
        >
          ➕ Add Credits
        </button>
      </div>

      {/* Wallet Balance Card */}
      <div className="wallet-balance-card">
        <div className="balance-header">
          <span className="balance-icon">💳</span>
          <h3>Current Balance</h3>
        </div>
        <div className="balance-amount">
          {formatAmount(walletBalance)} Credits
        </div>
        <div className="balance-info">
          Last updated: {walletBalance > 0 ? "Recently" : "Never"}
        </div>
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

      {/* Transaction History */}
      <div className="transaction-history">
        <div className="history-header">
          <h3>Transaction History</h3>
          <div className="history-stats">
            {transactions.length} transactions
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={fetchTransactions} className="retry-btn">
              Try Again
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h4>No Transactions Yet</h4>
            <p>
              Your transaction history will appear here once you start using
              credits.
            </p>
          </div>
        ) : (
          <>
            <div className="transactions-list">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`transaction-item ${getTransactionColor(
                    transaction.type
                  )}`}
                >
                  <div className="transaction-icon">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-description">
                      {transaction.tournament_name
                        ? transaction.description.replace(
                            transaction.ref_id,
                            transaction.tournament_name
                          )
                        : transaction.description}
                    </div>
                    <div className="transaction-meta">
                      <span className="transaction-type">
                        {transaction.type.replace("_", " ").toUpperCase()}
                      </span>
                      <span className="transaction-date">
                        {formatDate(transaction.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="transaction-amount">
                    {transaction.type === "debit" ||
                    transaction.type === "tournament_entry"
                      ? "-"
                      : "+"}
                    {formatAmount(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  ← Previous
                </button>
                <span className="page-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Wallet;
