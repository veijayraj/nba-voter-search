import { useState, useEffect } from "react";

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

export function PlayerProfile({ player, onBack, onVoterClick }: PlayerProfileProps) {
  const [data, setData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/players.json")
      .then((res) => res.json())
      .then((allPlayers) => setData(allPlayers[player] || null))
      .finally(() => setLoading(false));
  }, [player]);

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="loader"></div>
          Loading player data...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="app">
        <button className="back-button" onClick={onBack}>← Back to Explorer</button>
        <div className="player-profile">
          <p>Player not found: {player}</p>
        </div>
      </div>
    );
  }

  // Group by year and award
  const byYearAward: Record<string, typeof data.received> = {};
  for (const vote of data.received) {
    const key = `${vote.year}-${vote.award}`;
    if (!byYearAward[key]) byYearAward[key] = [];
    byYearAward[key].push(vote);
  }

  const years = [...new Set(data.received.map(v => v.year))].sort().reverse();

  return (
    <div className="app">
      <button className="back-button" onClick={onBack}>← Back to Explorer</button>
      
      <div className="player-profile">
        {/* Header Section */}
        <div className="player-header">
          <h1 className="player-name">{player}</h1>
          <p className="player-teams">
            {data.teams.filter(t => t).join(" • ")}
          </p>
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
              <div className="voter-stat-value">{[...new Set(data.received.map(v => v.award))].length}</div>
              <div className="voter-stat-label">Awards</div>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="player-history">
          {years.map((year) => {
            const yearVotes = data.received.filter(v => v.year === year);
            const awards = [...new Set(yearVotes.map(v => v.award))];
            
            return (
              <div key={year} className="player-year">
                <h2>{year}</h2>
                {awards.map((award) => {
                  const awardVotes = yearVotes.filter(v => v.award === award);
                  const byPosition: Record<string, string[]> = {};
                  for (const v of awardVotes) {
                    if (!byPosition[v.position]) byPosition[v.position] = [];
                    byPosition[v.position].push(v.voter);
                  }
                  
                  return (
                    <div key={award} className="player-award">
                      <h3>{award}</h3>
                      <div className="player-positions">
                        {Object.entries(byPosition).map(([pos, voters]) => (
                          <div key={pos} className="player-position">
                            <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                              <span className="position-label">{pos}</span>
                              <span className="position-count">{voters.length}</span>
                            </div>
                            <div className="position-voters">
                              {voters.map((voter, i) => (
                                <span 
                                  key={i} 
                                  className="voter-link"
                                  onClick={() => onVoterClick(voter)}
                                >
                                  {voter}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}