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
      case "year": setYear(value); setLoading(true); break;
      case "award": setAward(value); setLoading(true); break;
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
      <div className="app">
        <VoterProfile voter={view.name} onBack={handleBack} onPlayerClick={handlePlayerClick} />
      </div>
    );
  }

  if (view.type === "player") {
    return (
      <div className="app">
        <PlayerProfile player={view.name} onBack={handleBack} onVoterClick={handleVoterClick} />
      </div>
    );
  }

  return (
    <div className="app">
      <h1>NBA Award Voter Database</h1>
      <Filters year={year} award={award} voterSearch={voterSearch} playerSearch={playerSearch} onChange={handleFilterChange} />
      {loading && <p>Loading...</p>}
      {data && (
        <>
          <p className="results-count">{filteredVotes.length} of {data.votes.length} votes</p>
          <VoteTable votes={filteredVotes} award={award} voterSearch={voterSearch} playerSearch={playerSearch} onVoterClick={handleVoterClick} onPlayerClick={handlePlayerClick} />
        </>
      )}
    </div>
  );
}

export default App;
