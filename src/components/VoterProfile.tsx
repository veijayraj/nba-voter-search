import { useState, useEffect, useMemo } from "react";

interface VoteData {
  year: string;
  award: string;
  picks: Array<{
    place?: string;
    player: string;
    playerTeam: string;
    allNbaTeam?: string;
  }>;
}

interface VoterData {
  affiliations: string[];
  votes: VoteData[];
}

interface VoterProfileProps {
  voter: string;
  onBack: () => void;
  onPlayerClick: (player: string) => void;
}

export function VoterProfile({ voter, onBack, onPlayerClick }: VoterProfileProps) {
  const [data, setData] = useState<VoterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string | "all">("all");
  const [selectedAward, setSelectedAward] = useState<string | "all">("all");
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  const [isRankOpen, setIsRankOpen] = useState(false);

  useEffect(() => {
    fetch("/data/voters.json")
      .then((res) => res.json())
      .then((allVoters) => setData(allVoters[voter] || null))
      .finally(() => setLoading(false));
  }, [voter]);

  const years = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.votes.map(v => v.year))].sort().reverse();
  }, [data]);

  const awards = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.votes.map(v => v.award))].sort();
  }, [data]);

  const handlePlaceChange = (place: string) => {
    setSelectedPlaces(prev => 
      prev.includes(place) ? prev.filter(p => p !== place) : [...prev, place]
    );
  };

  const filteredVotes = useMemo(() => {
    if (!data) return [];
    return data.votes.map(vote => {
      const filteredPicks = vote.picks.filter(pick => {
        if (selectedPlaces.length === 0 || selectedAward !== "MVP") return true;
        return selectedPlaces.includes(pick.place || "");
      });
      return { ...vote, picks: filteredPicks };
    }).filter(vote => {
      const yearMatch = selectedYear === "all" || vote.year === selectedYear;
      const awardMatch = selectedAward === "all" || vote.award === selectedAward;
      return yearMatch && awardMatch && vote.picks.length > 0;
    });
  }, [data, selectedYear, selectedAward, selectedPlaces]);

  const groupedVotes = useMemo(() => {
    const groups: Record<string, Record<string, VoteData[]>> = {};
    for (const vote of filteredVotes) {
      if (!groups[vote.year]) groups[vote.year] = {};
      if (!groups[vote.year][vote.award]) groups[vote.year][vote.award] = [];
      groups[vote.year][vote.award].push(vote);
    }
    return groups;
  }, [filteredVotes]);

  if (loading) return <div className="app"><div className="loading">Loading...</div></div>;
  if (!data) return <div className="app"><button className="back-button" onClick={onBack}>← Back</button><p>Not found</p></div>;

  const ranks = ["1st", "2nd", "3rd", "4th", "5th"];

  return (
    <div className="app">
      <button className="back-button" onClick={onBack}>← Back to Explorer</button>
      
      <div className="voter-profile">
        <div className="voter-header">
          <h1 className="voter-name">{voter}</h1>
          <p className="voter-affiliations">{data.affiliations.filter(a => a).join(" • ")}</p>
        </div>

        <div className="voter-filters">
          <div className="filter-group">
            <label className="filter-label">Season</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              <option value="all">All Seasons</option>
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Award</label>
            <select value={selectedAward} onChange={(e) => {
              setSelectedAward(e.target.value);
              if (e.target.value !== "MVP") setSelectedPlaces([]);
            }}>
              <option value="all">All Awards</option>
              {awards.map(award => <option key={award} value={award}>{award}</option>)}
            </select>
          </div>

          {selectedAward === "MVP" && (
            <div className="filter-group">
              <label className="filter-label">Ranks</label>
              <div className="multi-select-container">
                <div className="multi-select-trigger" onClick={() => setIsRankOpen(!isRankOpen)}>
                  {selectedPlaces.length === 0 ? "All Ranks" : `${selectedPlaces.length} Selected`}
                </div>
                {isRankOpen && (
                  <div className="multi-select-dropdown">
                    {ranks.map(rank => (
                      <label key={rank} className="multi-select-item">
                        <input 
                          type="checkbox" 
                          checked={selectedPlaces.includes(rank)}
                          onChange={() => handlePlaceChange(rank)}
                        />
                        <span>{rank}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="voter-history">
          {Object.entries(groupedVotes).sort(([a], [b]) => parseInt(b) - parseInt(a)).map(([year, awardDict]) => (
            <div key={year} className="voter-year">
              <h2>{year}</h2>
              <div className="voter-year-votes">
                {Object.entries(awardDict).map(([award, votes]) => (
                  votes.map((vote, i) => (
                    <div key={`${award}-${i}`} className="voter-ballot">
                      <h3>{award}</h3>
                      <div className="voter-picks">
                        {vote.picks.map((pick, j) => (
                          <div key={j} className="voter-pick">
                            <div className="voter-pick-place">{pick.place || pick.allNbaTeam}</div>
                            <div className="voter-pick-player">
                              <span className="voter-pick-player-name player-link" onClick={() => onPlayerClick(pick.player)}>
                                {pick.player}
                              </span>
                              <span className="voter-pick-team">{pick.playerTeam}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}