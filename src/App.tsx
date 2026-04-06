import { useState, useEffect, useCallback } from "react";
import { Filters } from "./components/Filters";
import { VoteTable } from "./components/VoteTable";
import { VoterProfile } from "./components/VoterProfile";
import { PlayerProfile } from "./components/PlayerProfile";
import { fetchAwardData } from "./utils/api";
import type { AwardData } from "./types";
import "./App.css";

type View = { type: "explorer" } | { type: "voter"; name: string } | { type: "player"; name: string };

function getInitialView(): View {
  const hash = window.location.hash;
  if (hash.startsWith("#voter/")) {
    return { type: "voter", name: decodeURIComponent(hash.replace("#voter/", "")) };
  }
  if (hash.startsWith("#player/")) {
    return { type: "player", name: decodeURIComponent(hash.replace("#player/", "")) };
  }
  return { type: "explorer" };
}

function App() {
  const [year, setYear] = useState("2025");
  const [award, setAward] = useState("MVP");
  const [voterSearch, setVoterSearch] = useState("");
  const [playerSearch, setPlayerSearch] = useState("");
  const [data, setData] = useState<AwardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>(getInitialView);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAwardData(year, award).then((result) => {
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [year, award]);

  const handleFilterChange = useCallback((field: string, value: string) => {
    switch (field) {
      case "year": setYear(value); break;
      case "award": setAward(value); break;
      case "voterSearch": setVoterSearch(value); break;
      case "playerSearch": setPlayerSearch(value); break;
    }
  }, []);

  const handleVoterClick = (voter: string) => {
    setView({ type: "voter", name: voter });
    window.location.hash = `voter/${encodeURIComponent(voter)}`;
  };

  const handlePlayerClick = (player: string) => {
    setView({ type: "player", name: player });
    window.location.hash = `player/${encodeURIComponent(player)}`;
  };

  const handleBack = () => {
    setView({ type: "explorer" });
    window.location.hash = "";
  };

  const filteredVotes = data?.votes.filter((vote) => {
    const voterMatch = vote.voter.toLowerCase().includes(voterSearch.toLowerCase());
    const playerMatch = playerSearch === "" || vote.picks.some((pick) =>
      pick.player.toLowerCase().includes(playerSearch.toLowerCase())
    );
    return voterMatch && playerMatch;
  }) ?? [];

  if (view.type === "voter") {
    return (
      <VoterProfile voter={view.name} onBack={handleBack} onPlayerClick={handlePlayerClick} />
    );
  }

  if (view.type === "player") {
    return (
      <PlayerProfile player={view.name} onBack={handleBack} onVoterClick={handleVoterClick} />
    );
  }

  return (
    <div className="app">
      <div className="app-container">
        <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
          <h1>NBA Award Voter Database</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 0 }}>
            Explore voting patterns from 2018 to present
          </p>
        </div>

        <Filters 
          year={year} 
          award={award} 
          voterSearch={voterSearch} 
          playerSearch={playerSearch} 
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
              <div style={{ 
                background: 'var(--bg-primary)',
                padding: 'var(--spacing-2xl)',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
                color: 'var(--text-tertiary)'
              }}>
                <p style={{ marginBottom: 0 }}>No votes match your search criteria.</p>
              </div>
            )}
          </>
        ) : (
          <div style={{ 
            background: 'var(--bg-primary)',
            padding: 'var(--spacing-2xl)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            color: 'var(--text-tertiary)'
          }}>
            <p style={{ marginBottom: 0 }}>Unable to load data. Please try again.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;