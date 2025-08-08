import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import GamesSection from "./components/GamesSection";
import InfoSection from "./components/InfoSection";

import RefreshScreen from "./components/RefreshScreen";
import Login from "./components/Login";
import AuthHandler from "./components/AuthHandler";
import UserProfile from "./components/UserProfile";
import PlayerForm from "./components/PlayerForm";
import BackButton from "./components/BackButton";
import ProtectedRoute from "./components/ProtectedRoute";
import ValorantPage from "./components/ValorantPage";
import AdminManageHosts from "./components/AdminManageHosts";
import AdminDashboard from "./components/AdminDashboard";
import { AuthProvider } from "./contexts/AuthContext";
import { UserRolesProvider } from "./contexts/UserRolesContext";

// Main App Component - Single Responsibility Principle
// Open/Closed Principle - Easy to extend with new sections
const App = () => {
  return (
    <AuthProvider>
      <UserRolesProvider>
        <Router>
          <div className="App">
            <AuthHandler />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/player-form"
                element={
                  <ProtectedRoute>
                    <PlayerForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <div className="settings-page">
                      <Navbar />
                      <div className="settings-container">
                        <BackButton />
                        <h1>Settings</h1>
                        <p>Settings page coming soon...</p>
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-tournaments"
                element={
                  <ProtectedRoute>
                    <div className="my-tournaments-page">
                      <Navbar />
                      <div className="tournaments-container">
                        <BackButton />
                        <h1>My Tournaments</h1>
                        <p>My tournaments page coming soon...</p>
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route path="/valorant" element={<ValorantPage />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/manage-hosts"
                element={
                  <ProtectedRoute>
                    <AdminManageHosts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/"
                element={
                  <>
                    <RefreshScreen />
                    <Navbar />
                    <HeroSection />
                    <GamesSection />
                    <AboutSection />
                    <InfoSection />
                  </>
                }
              />
            </Routes>
          </div>
        </Router>
      </UserRolesProvider>
    </AuthProvider>
  );
};

export default App;
