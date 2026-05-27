import { useState, useEffect, useMemo } from "react";

interface PlayerData {
  teams: string[];
  received: {
    year: string;
    award: string;
    voter: string;
    position: string;
  }[];
}

interface PlayerProfileProps {
  player: string;
  onBack: () => void;
  onVoterClick: (voter: string) => void;
}

const TEAM_AWARD_OPTIONS: Record<string, string[]> = {
  "All-NBA":       ["1st", "2nd", "3rd"],
  "All-Defensive": ["1st", "2nd"],
};

// Awards where position means a rank (1st place vote, 2nd place vote, etc.)
const RANKED_POSITIONS = ["1st", "2nd", "3rd", "4th", "5th"];

export function PlayerProfile({ player, onBack, onVoterClick }: PlayerProfileProps) {
  const [data, setData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedAward, setSelectedAward] = useState<string>("all");
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [isYearOpen, setIsYearOpen] = useState(false);

  useEffect(() => {
    const normalize = (s: string) => s.replace(/‐/g, '-');
    fetch("./data/players.json")
      .then((res) => res.json())
      .then((allPlayers: Record<string, PlayerData>) => {
        const normalizedPlayer = normalize(player);
        const match = allPlayers[player]
          ?? Object.entries(allPlayers).find(([k]) => normalize(k) === normalizedPlayer)?.[1]
          ?? null;
        setData(match);
      })
      .finally(() => setLoading(false));
  }, [player]);

  const awards = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.received.map(v => v.award))].sort();
  }, [data]);

  const years = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.received.map(v => v.year))].sort().reverse();
  }, [data]);

  // What position pills to show for the selected award
  const positionOptions = useMemo(() => {
    if (selectedAward === "all") return [];
    if (TEAM_AWARD_OPTIONS[selectedAward]) return TEAM_AWARD_OPTIONS[selectedAward];
    // For ranked awards, show which positions this player actually received
    if (!data) return [];
    const positions = [...new Set(
      data.received.filter(v => v.award === selectedAward).map(v => v.position)
    )];
    return RANKED_POSITIONS.filter(p => positions.includes(p));
  }, [selectedAward, data]);

  const isTeamAward = TEAM_AWARD_OPTIONS[selectedAward] !== undefined;

  const filteredReceived = useMemo(() => {
    if (!data) return [];
    return data.received.filter(v => {
      const yearMatch = selectedYears.length === 0 || selectedYears.includes(v.year);
      const awardMatch = selectedAward === "all" || v.award === selectedAward;
      const posMatch = selectedPositions.length === 0 || selectedPositions.includes(v.position);
      return yearMatch && awardMatch && posMatch;
    });
  }, [data, selectedYears, selectedAward, selectedPositions]);

  // Group filtered data by year → award → position
  const groupedYears = useMemo(() => {
    const byYear: Record<string, Record<string, Record<string, string[]>>> = {};
    for (const v of filteredReceived) {
      if (!byYear[v.year]) byYear[v.year] = {};
      if (!byYear[v.year][v.award]) byYear[v.year][v.award] = {};
      if (!byYear[v.year][v.award][v.position]) byYear[v.year][v.award][v.position] = [];
      byYear[v.year][v.award][v.position].push(v.voter);
    }
    return byYear;
  }, [filteredReceived]);

  const sortedYears = Object.keys(groupedYears).sort().reverse();

  if (loading) {
    return (
      <div className="loading">
        <div className="loader"></div>
        Loading player data...
      </div>
    );
  }

  if (!data) {
    return (
      <>
        <button className="back-button" onClick={onBack}>← Back to Explorer</button>
        <div className="player-profile">
          <p>Player not found: {player}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <button className="back-button" onClick={onBack}>← Back to Explorer</button>

      <div className="player-profile">
        <div className="player-header">
          <h1 className="player-name">{player}</h1>
          <p className="player-teams">{data.teams.filter(t => t).join(" • ")}</p>
          <div className="voter-stats">
            <div className="voter-stat">
              <div className="voter-stat-value">{data.received.length}</div>
              <div className="voter-stat-label">Total Votes</div>
            </div>
            <div className="voter-stat">
              <div className="voter-stat-value">{years.length}</div>
              <div className="voter-stat-label">Seasons</div>
            </div>
            <div className="voter-stat">
              <div className="voter-stat-value">{awards.length}</div>
              <div className="voter-stat-label">Awards</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="voter-filters">
          <div className="filter-group">
            <label className="filter-label">Season</label>
            <div className="multi-select-container">
              <div className="multi-select-trigger" onClick={() => setIsYearOpen(o => !o)}>
                {selectedYears.length === 0 ? "All Seasons" : selectedYears.length === 1 ? selectedYears[0] : `${selectedYears.length} Seasons`}
              </div>
              {isYearOpen && (
                <div className="multi-select-dropdown">
                  {years.map(year => (
                    <label key={year} className="multi-select-item">
                      <input
                        type="checkbox"
                        checked={selectedYears.includes(year)}
                        onChange={() =>
                          setSelectedYears(prev =>
                            prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
                          )
                        }
                      />
                      <span>{year}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Award</label>
            <select
              value={selectedAward}
              onChange={e => {
                setSelectedAward(e.target.value);
                setSelectedPositions([]);
              }}
            >
              <option value="all">All Awards</option>
              {awards.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {selectedAward !== "all" && positionOptions.length > 0 && (
            <div className="filter-group">
              <label className="filter-label">{isTeamAward ? "Team" : "Rank"}</label>
              <div className="team-filter-pills">
                {positionOptions.map(pos => (
                  <button
                    key={pos}
                    className={`team-pill${selectedPositions.includes(pos) ? " active" : ""}`}
                    onClick={() =>
                      setSelectedPositions(prev =>
                        prev.includes(pos) ? prev.filter(p => p !== pos) : [...prev, pos]
                      )
                    }
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* History */}
        <div className="player-history">
          {sortedYears.length === 0 ? (
            <p style={{ color: "var(--slate)" }}>No votes match your filters.</p>
          ) : sortedYears.map(year => (
            <div key={year} className="player-year">
              <h2>{year} — {player}</h2>
              {Object.entries(groupedYears[year]).map(([award, byPos]) => (
                <div key={award} className="player-award">
                  <h3>{award}</h3>
                  <div className="player-positions">
                    {Object.entries(byPos).map(([pos, voters]) => (
                      <div key={pos} className="player-position">
                        <div style={{ marginBottom: "var(--spacing-sm)" }}>
                          <span className="position-label">{pos}</span>
                          <span className="position-count">{voters.length}</span>
                        </div>
                        <div className="position-voters">
                          {voters.map((voter, i) => (
                            <span key={i} className="voter-link" onClick={() => onVoterClick(voter)}>
                              {voter}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
