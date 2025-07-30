import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "./App.css";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import RefreshScreen from "./components/RefreshScreen";
import Login from "./components/Login";
import AuthHandler from "./components/AuthHandler";
import UserProfile from "./components/UserProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

// Main App Component - Single Responsibility Principle
// Open/Closed Principle - Easy to extend with new sections
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AuthHandler />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
            <Route path="/" element={
              <>
                <RefreshScreen />
                <Navbar />
                <HeroSection />
                <AboutSection />
              </>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
