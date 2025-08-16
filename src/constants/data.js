// Data Constants - Dependency Inversion Principle
// Components depend on abstractions (data structure) not concrete implementations

export const HERO_STATS = [
  { number: "1,247", label: "Active Tournaments" },
  { number: "45.2K", label: "Players Registered" },
  { number: "89.5K", label: "Credits Awarded" },
  { number: "98.7%", label: "Success Rate" },
];

export const FEATURES = [
  {
    id: 1,
    icon: "🎯",
    title: "Tournament Creation",
    description:
      "Create custom tournaments with flexible formats, rules, and prize pools tailored to your community.",
  },
  {
    id: 2,
    icon: "⚡",
    title: "Real-time Updates",
    description:
      "Live match tracking, instant notifications, and dynamic bracket updates keep everyone informed.",
  },
  {
    id: 3,
    icon: "🏆",
    title: "Prize Management",
    description:
      "Secure prize pool distribution with automated payouts and transparent transaction tracking.",
  },
  {
    id: 4,
    icon: "🔒",
    title: "Anti-Cheat System",
    description:
      "Advanced detection and reporting tools to maintain fair play and competitive integrity.",
  },
];

export const HERO_CONTENT = {
  title: "TOURNIFY",
  subtitle:
    "The ultimate platform for organizing and participating in Valorant tournaments. Create, join, and dominate the competition with seamless tournament management.",
  primaryButton: "Create Tournament",
  secondaryButton: "Browse Tournaments",
};

export const ABOUT_CONTENT = {
  title: "Our Features",
  subtitle:
    "Discover the powerful tools and features that make Tournify the ultimate platform for competitive gaming tournaments.",
};

export const CTA_CONTENT = {
  title: "Ready to Start Your Tournament?",
  subtitle:
    "Join thousands of players and organizers who trust Tournify for their competitive gaming needs.",
  buttonText: "Get Started Now",
};

export const NAV_ITEMS = [
  { label: "Home", href: "#home" },
  { label: "Tournaments", href: "#tournaments" },
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export const NAVBAR_CONTENT = {
  logo: "TOURNIFY",
  signInButton: "Sign In",
  getStartedButton: "Get Started",
};
