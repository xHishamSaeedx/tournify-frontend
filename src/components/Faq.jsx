import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import BackButton from "./BackButton";
import "../styles/faq.css";

const Faq = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      id: "general",
      title: "General",
      items: [
        {
          question: "What is this website about?",
          answer: (
            <p>
              This platform hosts Valorant tournaments (currently Deathmatch
              mode) where players can join using credits, compete, and win
              prizes.
            </p>
          ),
        },
        {
          question: "How do I join a tournament?",
          answer: (
            <p>
              Create an account, update your profile with your Valorant ID,
              platform, and region, buy credits, and then use those credits to
              enter a tournament of your choice.
            </p>
          ),
        },
        {
          question: "How are winnings paid out?",
          answer: (
            <p>
              Tournament prizes are credited to your account in credits. You can
              later redeem credits for real money.
            </p>
          ),
        },
      ],
    },
    {
      id: "joining-refunds",
      title: "Tournament Joining & Refunds",
      items: [
        {
          question: "Can I leave a tournament after joining?",
          answer: (
            <div>
              <p>Yes, but with conditions:</p>
              <ul>
                <li>
                  If you leave more than 5 minutes before the start time →
                  you’ll get
                  <strong>50% of your joining fee refunded</strong>.
                </li>
                <li>
                  If you leave within 5 minutes of match start → you cannot
                  leave and will not be refunded.
                </li>
              </ul>
            </div>
          ),
        },
        {
          question: "What happens if the host doesn’t share the party code?",
          answer: (
            <p>
              The tournament will be cancelled, the host will be flagged, and
              all players will get their joining fee refunded.
            </p>
          ),
        },
      ],
    },
    {
      id: "match-rules",
      title: "Match Rules",
      items: [
        {
          question: "When do I get the party code to join the match?",
          answer: (
            <p>
              10 minutes before the match start time, the host will share the
              code.
            </p>
          ),
        },
        {
          question: "What happens if I don’t join the match?",
          answer: (
            <p>
              The host can report you with proof (screenshot). If verified,
              you’ll receive an
              <strong>AFK offense</strong>.
            </p>
          ),
        },
        {
          question: "What if the host prevents me from joining the match?",
          answer: (
            <p>
              You can report the host with a screenshot. Your AFK offense will
              be removed, and your joining fee will be refunded.
            </p>
          ),
        },
        {
          question: "Do I need to wait for late players?",
          answer: (
            <p>
              No. Hosts must start the match at the scheduled time (or close to
              it) and with the correct map.
            </p>
          ),
        },
      ],
    },
    {
      id: "results-winnings",
      title: "Results & Winnings",
      items: [
        {
          question: "How are winners decided?",
          answer: (
            <p>
              15 minutes after the match starts, our automated systems will
              verify the results and distribute credits to the winners.
            </p>
          ),
        },
        {
          question: "Why did my prize pool change?",
          answer: (
            <p>
              For tournaments with a joining fee, the final prize pool adjusts
              based on how many players have joined
              <strong> 5 minutes before the match starts</strong>. If players
              join or leave before that cutoff, the displayed prize pool may
              change to reflect the confirmed player count.
            </p>
          ),
        },
        {
          question:
            "What if outsiders (non-registered players) join the match?",
          answer: (
            <p>
              Don’t worry — only registered players will be considered in the
              leaderboard and prize distribution.
            </p>
          ),
        },
      ],
    },
  ];

  const [query, setQuery] = useState("");
  const [openMap, setOpenMap] = useState({});

  const normalized = (text) => text.toLowerCase();
  const matchesQuery = (text) => normalized(text).includes(normalized(query));

  const filteredSections = sections
    .map((section) => ({
      ...section,
      items: query
        ? section.items.filter((item) => matchesQuery(item.question))
        : section.items,
    }))
    .filter((section) => section.items.length > 0);

  const toggleItem = (key) => {
    setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => {
    const next = {};
    filteredSections.forEach((section) => {
      section.items.forEach((item) => {
        const key = `${section.id}-${item.question}`;
        next[key] = true;
      });
    });
    setOpenMap(next);
  };

  const collapseAll = () => setOpenMap({});

  return (
    <>
      <Navbar />
      <div className="faq-page">
        <BackButton />
        <div className="faq-container">
          <h1>Frequently Asked Questions</h1>

          <div className="faq-toolbar">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions..."
              className="faq-search"
              aria-label="Search questions"
            />
            <div className="faq-bulk-toggles">
              <button className="faq-toggle-btn" onClick={expandAll}>
                Expand All
              </button>
              <button className="faq-toggle-btn" onClick={collapseAll}>
                Collapse All
              </button>
            </div>
          </div>

          <div className="faq-categories">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="faq-category-link"
              >
                {section.title}
              </a>
            ))}
          </div>

          {filteredSections.map((section) => (
            <section key={section.id} id={section.id} className="faq-section">
              <h2>{section.title}</h2>
              <div className="faq-items">
                {section.items.map((item) => {
                  const key = `${section.id}-${item.question}`;
                  const isOpen = !!openMap[key];
                  return (
                    <div
                      key={key}
                      className={`faq-item ${isOpen ? "open" : ""}`}
                    >
                      <button
                        className="faq-question"
                        onClick={() => toggleItem(key)}
                        aria-expanded={isOpen}
                        aria-controls={`${key}-answer`}
                      >
                        <span className="faq-q-text">{item.question}</span>
                        <span
                          className={`faq-caret ${isOpen ? "rotated" : ""}`}
                        >
                          ▾
                        </span>
                      </button>
                      <div
                        id={`${key}-answer`}
                        className="faq-answer"
                        role="region"
                        aria-hidden={!isOpen}
                      >
                        {item.answer}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
};

export default Faq;
