import { useState, useEffect, useCallback } from "react";
import { Filters } from "./components/Filters";
import { VoteTable } from "./components/VoteTable";
import { VoterProfile } from "./components/VoterProfile";
import { PlayerProfile } from "./components/PlayerProfile";
import { AnalyticsPage } from "./components/AnalyticsPage";
import { fetchAwardData } from "./utils/api";
import type { AwardData } from "./types";
import "./App.css";

type Tab = "search" | "voters" | "players" | "analytics";

// Strip diacritics so "jokic" matches "Jokić", "doncic" matches "Dončić", etc.
const stripAccents = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

function getInitialState(): { tab: Tab; voter: string | null; player: string | null } {
  const hash = window.location.hash;
  if (hash.startsWith("#voter/")) {
    return { tab: "voters", voter: decodeURIComponent(hash.replace("#voter/", "")), player: null };
  }
  if (hash.startsWith("#player/")) {
    return { tab: "players", voter: null, player: decodeURIComponent(hash.replace("#player/", "")) };
  }
  return { tab: "search", voter: null, player: null };
}

const TAB_LABELS: Record<Tab, string> = {
  search: "Search",
  voters: "Voters",
  players: "Players",
  analytics: "Analytics",
};

type NavEntry = { tab: Tab; voter: string | null; player: string | null };

function App() {
  const initial = getInitialState();
  const [tab, setTab] = useState<Tab>(initial.tab);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState<string | null>(initial.voter);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(initial.player);
  const [navStack, setNavStack] = useState<NavEntry[]>([]);

  // Search tab state
  const [year, setYear] = useState("2026");
  const [award, setAward] = useState("MVP");
  const [voterSearch, setVoterSearch] = useState("");
  const [playerSearch, setPlayerSearch] = useState("");
  const [playerSearchMode, setPlayerSearchMode] = useState<"include" | "exclude">("include");
  const [data, setData] = useState<AwardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Autocomplete lists
  const [votersList, setVotersList] = useState<string[]>([]);
  const [playersList, setPlayersList] = useState<string[]>([]);
  const [voterInput, setVoterInput] = useState("");
  const [playerInput, setPlayerInput] = useState("");
  const [showVoterSuggestions, setShowVoterSuggestions] = useState(false);
  const [showPlayerSuggestions, setShowPlayerSuggestions] = useState(false);

  useEffect(() => {
    fetch("./data/voters.json").then(r => r.json()).then(d => setVotersList(Object.keys(d).sort()));
    fetch("./data/players.json").then(r => r.json()).then(d => setPlayersList(Object.keys(d).sort()));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAwardData(year, award).then((result) => {
      if (!cancelled) { setData(result); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [year, award]);

  const handleFilterChange = useCallback((field: string, value: string) => {
    switch (field) {
      case "year": setYear(value); break;
      case "award": setAward(value); break;
      case "voterSearch": setVoterSearch(value); break;
      case "playerSearch": setPlayerSearch(value); break;
      case "playerSearchMode": setPlayerSearchMode(value as "include" | "exclude"); break;
    }
  }, []);

  const handleVoterClick = (voter: string) => {
    setNavStack(prev => [...prev, { tab, voter: selectedVoter, player: selectedPlayer }]);
    setSelectedVoter(voter);
    setTab("voters");
    window.location.hash = `voter/${encodeURIComponent(voter)}`;
  };

  const handlePlayerClick = (player: string) => {
    setNavStack(prev => [...prev, { tab, voter: selectedVoter, player: selectedPlayer }]);
    setSelectedPlayer(player);
    setTab("players");
    window.location.hash = `player/${encodeURIComponent(player)}`;
  };

  const handleBack = () => {
    const prev = navStack[navStack.length - 1];
    setNavStack(s => s.slice(0, -1));
    if (prev) {
      setTab(prev.tab);
      setSelectedVoter(prev.voter);
      setSelectedPlayer(prev.player);
      if (prev.voter) window.location.hash = `voter/${encodeURIComponent(prev.voter)}`;
      else if (prev.player) window.location.hash = `player/${encodeURIComponent(prev.player)}`;
      else window.location.hash = "";
    } else {
      setTab("search");
      setSelectedVoter(null);
      setSelectedPlayer(null);
      window.location.hash = "";
    }
  };

  const handleTabChange = (newTab: Tab) => {
    setNavStack([]);
    setTab(newTab);
    if (newTab === "search") {
      window.location.hash = "";
    } else if (newTab === "voters" && selectedVoter) {
      window.location.hash = `voter/${encodeURIComponent(selectedVoter)}`;
    } else if (newTab === "players" && selectedPlayer) {
      window.location.hash = `player/${encodeURIComponent(selectedPlayer)}`;
    } else {
      window.location.hash = "";
    }
  };

  const filteredVotes = data?.votes.filter((vote) => {
    const voterMatch = vote.voter.toLowerCase().includes(voterSearch.toLowerCase());
    const hasPlayer = playerSearch === "" || vote.picks.some((pick) =>
      stripAccents(pick.player.toLowerCase()).includes(stripAccents(playerSearch.toLowerCase()))
    );
    const playerMatch = playerSearch === ""
      ? true
      : playerSearchMode === "include" ? hasPlayer : !hasPlayer;
    return voterMatch && playerMatch;
  }) ?? [];

  const renderVotersTab = () => {
    if (selectedVoter) {
      return (
        <VoterProfile
          key={selectedVoter}
          voter={selectedVoter}
          onBack={handleBack}
          onPlayerClick={handlePlayerClick}
          onVoterClick={handleVoterClick}
        />
      );
    }
    return (
      <div>
        <div style={{ marginBottom: "var(--spacing-2xl)" }}>
          <h1>Voter Profiles</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: 0 }}>
            Search for a voter to explore their full voting history
          </p>
        </div>
        <div className="voter-jump-card">
          <label className="filter-label">Find a voter</label>
          <div className="voter-autocomplete-wrap">
            <input
              className="voter-jump-input"
              placeholder="Search voter name..."
              value={voterInput}
              onChange={e => { setVoterInput(e.target.value); setShowVoterSuggestions(true); }}
              onFocus={() => setShowVoterSuggestions(true)}
              onBlur={() => setTimeout(() => setShowVoterSuggestions(false), 150)}
            />
            {showVoterSuggestions && voterInput && (() => {
              const matches = votersList.filter(v => v.toLowerCase().includes(voterInput.toLowerCase())).slice(0, 8);
              return matches.length > 0 ? (
                <div className="voter-autocomplete-dropdown">
                  {matches.map(v => (
                    <div key={v} className="voter-autocomplete-item" onMouseDown={() => { handleVoterClick(v); setVoterInput(""); }}>
                      {v}
                    </div>
                  ))}
                </div>
              ) : null;
            })()}
          </div>
        </div>
      </div>
    );
  };

  const renderPlayersTab = () => {
    if (selectedPlayer) {
      return (
        <PlayerProfile
          key={selectedPlayer}
          player={selectedPlayer}
          onBack={handleBack}
          onVoterClick={handleVoterClick}
        />
      );
    }
    return (
      <div>
        <div style={{ marginBottom: "var(--spacing-2xl)" }}>
          <h1>Player Profiles</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: 0 }}>
            Search for a player to see how they've been voted on across seasons
          </p>
        </div>
        <div className="voter-jump-card">
          <label className="filter-label">Find a player</label>
          <div className="voter-autocomplete-wrap">
            <input
              className="voter-jump-input"
              placeholder="Search player name..."
              value={playerInput}
              onChange={e => { setPlayerInput(e.target.value); setShowPlayerSuggestions(true); }}
              onFocus={() => setShowPlayerSuggestions(true)}
              onBlur={() => setTimeout(() => setShowPlayerSuggestions(false), 150)}
            />
            {showPlayerSuggestions && playerInput && (() => {
              const matches = playersList.filter(p => stripAccents(p.toLowerCase()).includes(stripAccents(playerInput.toLowerCase()))).slice(0, 8);
              return matches.length > 0 ? (
                <div className="voter-autocomplete-dropdown">
                  {matches.map(p => (
                    <div key={p} className="voter-autocomplete-item" onMouseDown={() => { handlePlayerClick(p); setPlayerInput(""); }}>
                      {p}
                    </div>
                  ))}
                </div>
              ) : null;
            })()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <header className="site-header">
        <div className="site-header-inner">
          <span className="site-title">NBA Award Voter Database</span>
          <nav className="tab-bar">
            {(Object.keys(TAB_LABELS) as Tab[]).map(t => (
              <button
                key={t}
                className={`tab-btn${tab === t ? " active" : ""}`}
                onClick={() => handleTabChange(t)}
              >
                {TAB_LABELS[t]}
              </button>
            ))}
          </nav>
          <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
        {menuOpen && (
          <div className="mobile-menu">
            {(Object.keys(TAB_LABELS) as Tab[]).map(t => (
              <button
                key={t}
                className={`mobile-menu-item${tab === t ? " active" : ""}`}
                onClick={() => { handleTabChange(t); setMenuOpen(false); }}
              >
                {TAB_LABELS[t]}
              </button>
            ))}
          </div>
        )}
      </header>
      <div className="app-container">

        {tab === "search" && (
          <>
            <div style={{ marginBottom: "var(--spacing-2xl)" }}>
              <p style={{ color: "var(--slate)", marginBottom: "var(--spacing-xs)" }}>
                Explore voting patterns from 2018 to present
              </p>
              <p style={{ color: "var(--slate)", fontSize: "0.8rem", marginBottom: 0, opacity: 0.7 }}>
                Note: 2023 All-NBA and All-Defensive voter data may be incomplete or incorrect.
              </p>
            </div>

            <Filters
              year={year}
              award={award}
              voterSearch={voterSearch}
              playerSearch={playerSearch}
              playerSearchMode={playerSearchMode}
              onChange={handleFilterChange}
            />

            {loading ? (
              <div className="loading">
                <div className="loader"></div>
                Loading award data...
              </div>
            ) : data ? (
              <>
                {filteredVotes.length > 0 ? (
                  <>
                    <div className="results-count">
                      <strong>{filteredVotes.length}</strong> of <strong>{data.votes.length}</strong> votes displayed
                    </div>
                    <VoteTable
                      votes={filteredVotes}
                      award={award}
                      voterSearch={voterSearch}
                      playerSearch={playerSearch}
                      onVoterClick={handleVoterClick}
                      onPlayerClick={handlePlayerClick}
                    />
                  </>
                ) : (
                  <div style={{ background: "var(--bg-primary)", padding: "var(--spacing-2xl)", borderRadius: "var(--radius-lg)", textAlign: "center", color: "var(--text-tertiary)" }}>
                    <p style={{ marginBottom: 0 }}>No votes match your search criteria.</p>
                  </div>
                )}
              </>
            ) : (
              <div style={{ background: "var(--bg-primary)", padding: "var(--spacing-2xl)", borderRadius: "var(--radius-lg)", textAlign: "center", color: "var(--text-tertiary)" }}>
                <p style={{ marginBottom: 0 }}>Unable to load data. Please try again.</p>
              </div>
            )}

            <div style={{ marginTop: "var(--spacing-3xl)", paddingTop: "var(--spacing-lg)", borderTop: "1px solid var(--border)", textAlign: "center", color: "var(--text-tertiary)", fontSize: "0.8rem" }}>
              All data courtesy of{" "}
              <a href="https://www.nba.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-tertiary)" }}>NBA.com</a>
            </div>
          </>
        )}

        {tab === "voters" && renderVotersTab()}
        {tab === "players" && renderPlayersTab()}
        {tab === "analytics" && <AnalyticsPage />}
      </div>
    </div>
  );
}

export default App;
