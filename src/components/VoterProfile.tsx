import { useState, useEffect } from "react";

interface VoterData {
  affiliations: string[];
  votes: {
    year: string;
    award: string;
    picks: Array<{
      place?: string;
      allNbaTeam?: string;
      player: string;
      playerTeam: string;
    }>;
  }[];
}

interface VoterProfileProps {
  voter: string;
  onBack: () => void;
  onPlayerClick: (player: string) => void;
}

export function VoterProfile({ voter, onBack, onPlayerClick }: VoterProfileProps) {
  const [data, setData] = useState<VoterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/voters.json")
      .then((res) => res.json())
      .then((allVoters) => setData(allVoters[voter] || null))
      .finally(() => setLoading(false));
  }, [voter]);

  if (loading) return <p>Loading...</p>;

  if (!data) {
    return (
      <div>
        <button className="back-button" onClick={onBack}>← Back</button>
        <p>Voter not found: {voter}</p>
      </div>
    );
  }

  const votesByYear: Record<string, typeof data.votes> = {};
  for (const vote of data.votes) {
    if (!votesByYear[vote.year]) votesByYear[vote.year] = [];
    votesByYear[vote.year].push(vote);
  }

  const years = Object.keys(votesByYear).sort().reverse();

  return (
    <div className="voter-profile">
      <button className="back-button" onClick={onBack}>← Back to Explorer</button>
      <h1>{voter}</h1>
      <p className="voter-affiliations">{data.affiliations.filter(a => a).join(", ") || "Unknown affiliation"}</p>
      <p className="voter-stats">{data.votes.length} ballots across {years.length} seasons ({years[years.length - 1]}–{years[0]})</p>

      <div className="voter-history">
        {years.map((year) => (
          <div key={year} className="voter-year">
            <h2>{year}</h2>
            <div className="voter-year-votes">
              {votesByYear[year].map((vote, i) => (
                <div key={i} className="voter-ballot">
                  <h3>{vote.award}</h3>
                  <div className="voter-picks">
                    {vote.picks.map((pick, j) => (
                      <div key={j} className="voter-pick">
                        <span className="voter-pick-place">{pick.place || pick.allNbaTeam}</span>
                        <span className="player-link" onClick={() => onPlayerClick(pick.player)}>{pick.player}</span>
                        <span className="voter-pick-team">{pick.playerTeam}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
