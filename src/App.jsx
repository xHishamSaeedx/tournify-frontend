import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import "./styles/tournament-browser.css";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import GamesSection from "./components/GamesSection";
import InfoSection from "./components/InfoSection";
import CompanySection from "./components/CompanySection";

import RefreshScreen from "./components/RefreshScreen";
import Login from "./components/Login";
import AuthHandler from "./components/AuthHandler";
import UserProfile from "./components/UserProfile";
import PlayerForm from "./components/PlayerForm";
import ProfileForm from "./components/ProfileForm";
import Settings from "./components/Settings";
import BackButton from "./components/BackButton";
import ProtectedRoute from "./components/ProtectedRoute";
import ValorantPage from "./components/ValorantPage";
import TournamentBrowser from "./components/TournamentBrowser";
import JoinedTournaments from "./components/JoinedTournaments";
import TournamentRoom from "./components/TournamentRoom";
import TournamentAccessControl from "./components/TournamentAccessControl";
import HostTournamentRoom from "./components/HostTournamentRoom";
import AdminManageHosts from "./components/AdminManageHosts";
import AdminDashboard from "./components/AdminDashboard";
import HostDashboard from "./components/HostDashboard";
import GameHostDashboard from "./components/GameHostDashboard";
import Wallet from "./components/Wallet";
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
                path="/profile-form"
                element={
                  <ProtectedRoute>
                    <ProfileForm mode="create" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile-form/edit"
                element={
                  <ProtectedRoute>
                    <ProfileForm mode="edit" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              {/* Game-specific tournament routes */}
              <Route
                path="/valorant/browse-tournaments"
                element={<TournamentBrowser game="valorant" />}
              />
              <Route
                path="/valorant/my-tournaments"
                element={
                  <ProtectedRoute>
                    <JoinedTournaments game="valorant" />
                  </ProtectedRoute>
                }
              />

              {/* Legacy routes - redirect to valorant-specific ones for backward compatibility */}
              <Route
                path="/browse-tournaments"
                element={<Navigate to="/valorant/browse-tournaments" replace />}
              />
              <Route
                path="/my-tournaments"
                element={<Navigate to="/valorant/my-tournaments" replace />}
              />

              <Route
                path="/tournament/:tournamentId"
                element={
                  <ProtectedRoute>
                    <TournamentAccessControl>
                      <TournamentRoom />
                    </TournamentAccessControl>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/host/tournament/:tournamentId"
                element={
                  <ProtectedRoute>
                    <HostTournamentRoom />
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
                path="/host-dashboard"
                element={
                  <ProtectedRoute>
                    <HostDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/:game/host-dashboard"
                element={
                  <ProtectedRoute>
                    <GameHostDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wallet"
                element={
                  <ProtectedRoute>
                    <Wallet />
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
                    <CompanySection />
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
