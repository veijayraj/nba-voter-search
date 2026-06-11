import { useState, useEffect, useMemo } from "react";

const stripAccents = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

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
  onVoterClick: (voter: string) => void;
}

export function VoterProfile({ voter, onBack, onPlayerClick, onVoterClick }: VoterProfileProps) {
  const [data, setData] = useState<VoterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedAward, setSelectedAward] = useState<string | "all">("all");
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  const [isRankOpen, setIsRankOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [allVoterNames, setAllVoterNames] = useState<string[]>([]);
  const [voterInput, setVoterInput] = useState("");
  const [showVoterDropdown, setShowVoterDropdown] = useState(false);
  const [playerSearch, setPlayerSearch] = useState("");
  const [showPlayerDropdown, setShowPlayerDropdown] = useState(false);

  useEffect(() => {
    fetch("./data/voters.json")
      .then((res) => res.json())
      .then((allVoters) => {
        setData(allVoters[voter] || null);
        setAllVoterNames(Object.keys(allVoters).sort());
      })
      .finally(() => setLoading(false));
  }, [voter]);

  const voterSuggestions = useMemo(() => {
    if (!voterInput) return [];
    return allVoterNames.filter(n => n !== voter && n.toLowerCase().includes(voterInput.toLowerCase())).slice(0, 8);
  }, [voterInput, allVoterNames, voter]);

  const years = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.votes.map(v => v.year))].sort().reverse();
  }, [data]);

  const awards = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.votes.map(v => v.award))].sort();
  }, [data]);

  const allPlayerNames = useMemo(() => {
    if (!data) return [];
    const names = new Set<string>();
    for (const vote of data.votes) {
      for (const pick of vote.picks) names.add(pick.player);
    }
    return [...names].sort();
  }, [data]);

  const playerSuggestions = useMemo(() => {
    if (!playerSearch) return [];
    return allPlayerNames
      .filter(n => stripAccents(n.toLowerCase()).includes(stripAccents(playerSearch.toLowerCase())))
      .slice(0, 8);
  }, [playerSearch, allPlayerNames]);

  const handlePlaceChange = (place: string) => {
    setSelectedPlaces(prev => 
      prev.includes(place) ? prev.filter(p => p !== place) : [...prev, place]
    );
  };

  const isTeamAward = selectedAward === "All-NBA" || selectedAward === "All-Defensive" || selectedAward === "All-Rookie";

  const filteredVotes = useMemo(() => {
    if (!data) return [];
    const normSearch = playerSearch ? stripAccents(playerSearch.toLowerCase()) : "";
    return data.votes.map(vote => {
      const filteredPicks = vote.picks.filter(pick => {
        if (normSearch && !stripAccents(pick.player.toLowerCase()).includes(normSearch)) return false;
        if (selectedAward === "MVP" && selectedPlaces.length > 0) {
          return selectedPlaces.includes(pick.place || "");
        }
        if (isTeamAward && selectedTeams.length > 0) {
          return selectedTeams.includes(pick.allNbaTeam || "");
        }
        return true;
      });
      return { ...vote, picks: filteredPicks };
    }).filter(vote => {
      const yearMatch = selectedYears.length === 0 || selectedYears.includes(vote.year);
      const awardMatch = selectedAward === "all" || vote.award === selectedAward;
      return yearMatch && awardMatch && vote.picks.length > 0;
    });
  }, [data, selectedYears, selectedAward, selectedPlaces, selectedTeams, isTeamAward, playerSearch]);

  const groupedVotes = useMemo(() => {
    const groups: Record<string, Record<string, VoteData[]>> = {};
    for (const vote of filteredVotes) {
      if (!groups[vote.year]) groups[vote.year] = {};
      if (!groups[vote.year][vote.award]) groups[vote.year][vote.award] = [];
      groups[vote.year][vote.award].push(vote);
    }
    return groups;
  }, [filteredVotes]);

  if (loading) return <div className="loading"><div className="loader"></div>Loading voter data...</div>;
  if (!data) return <><button className="back-button" onClick={onBack}>← Back</button><p>Not found</p></>;

  const ranks = ["1st", "2nd", "3rd", "4th", "5th"];

  return (
    <>
      <button className="back-button" onClick={onBack}>← Back to Explorer</button>
      <div className="voter-profile">
        <div className="voter-header">
          <h1 className="voter-name">{voter}</h1>
          <p className="voter-affiliations">{data.affiliations.filter(a => a).join(" • ")}</p>
        </div>

        <div className="voter-filters">
          <div className="filter-group">
            <label className="filter-label">Change Voter</label>
            <div className="voter-autocomplete-wrap">
              <input
                placeholder="Search voter name..."
                value={voterInput}
                onChange={e => { setVoterInput(e.target.value); setShowVoterDropdown(true); }}
                onFocus={() => setShowVoterDropdown(true)}
                onBlur={() => setTimeout(() => setShowVoterDropdown(false), 150)}
              />
              {showVoterDropdown && voterSuggestions.length > 0 && (
                <div className="voter-autocomplete-dropdown">
                  {voterSuggestions.map(v => (
                    <div key={v} className="voter-autocomplete-item" onMouseDown={() => { onVoterClick(v); setVoterInput(""); }}>
                      {v}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Player</label>
            <div className="voter-autocomplete-wrap">
              <input
                placeholder="Search player..."
                value={playerSearch}
                onChange={e => { setPlayerSearch(e.target.value); setShowPlayerDropdown(true); }}
                onFocus={() => setShowPlayerDropdown(true)}
                onBlur={() => setTimeout(() => setShowPlayerDropdown(false), 150)}
              />
              {showPlayerDropdown && playerSuggestions.length > 0 && (
                <div className="voter-autocomplete-dropdown">
                  {playerSuggestions.map(p => (
                    <div key={p} className="voter-autocomplete-item" onMouseDown={() => { setPlayerSearch(p); setShowPlayerDropdown(false); }}>
                      {p}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

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
            <select value={selectedAward} onChange={(e) => {
              setSelectedAward(e.target.value);
              if (e.target.value !== "MVP") setSelectedPlaces([]);
              setSelectedTeams([]);
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

          {isTeamAward && (
            <div className="filter-group">
              <label className="filter-label">Team</label>
              <div className="team-filter-pills">
                {(selectedAward === "All-NBA" ? ["1st", "2nd", "3rd"] : ["1st", "2nd"]).map(team => (
                  <button
                    key={team}
                    className={`team-pill${selectedTeams.includes(team) ? " active" : ""}`}
                    onClick={() =>
                      setSelectedTeams(prev =>
                        prev.includes(team) ? prev.filter(t => t !== team) : [...prev, team]
                      )
                    }
                  >
                    {team}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="voter-history">
          {Object.entries(groupedVotes).sort(([a], [b]) => parseInt(b) - parseInt(a)).map(([year, awardDict]) => (
            <div key={year} className="voter-year">
              <h2>{year} — {voter}</h2>
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
    </>
  );
}