import React from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import RefreshScreen from "./components/RefreshScreen";

// Main App Component - Single Responsibility Principle
// Open/Closed Principle - Easy to extend with new sections
const App = () => {
  return (
    <div className="App">
      <RefreshScreen />
      <Navbar />
      <HeroSection />
      <AboutSection />
    </div>
  );
};

export default App;
