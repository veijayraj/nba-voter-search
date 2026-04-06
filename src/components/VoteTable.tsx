import type { Vote } from "../types";
import { RANKED_AWARDS } from "../utils/constants";
import { Highlight } from "./Highlight";

interface VoteTableProps {
  votes: Vote[];
  award: string;
  voterSearch: string;
  playerSearch: string;
  onVoterClick?: (voter: string) => void;
  onPlayerClick?: (player: string) => void;
}

export function VoteTable({ votes, award, voterSearch, playerSearch, onVoterClick, onPlayerClick }: VoteTableProps) {
  const isRanked = RANKED_AWARDS.includes(award);

  if (isRanked) {
    return (
      <>
        <div className="vote-table-wrapper">
          <table className="vote-table">
            <thead>
              <tr>
                <th>Voter</th>
                <th>Affiliation</th>
                <th>1st</th>
                <th>2nd</th>
                <th>3rd</th>
                {award === "MVP" && <th>4th</th>}
                {award === "MVP" && <th>5th</th>}
              </tr>
            </thead>
            <tbody>
              {votes.map((vote, i) => (
                <tr key={i}>
                  <td>
                    <span className="voter-link" onClick={() => onVoterClick?.(vote.voter)}>
                      <Highlight text={vote.voter} search={voterSearch} />
                    </span>
                  </td>
                  <td>{vote.affiliation}</td>
                  {vote.picks.map((pick, j) => (
                    <td key={j}>
                      {"place" in pick && (
                        <span className="player-link" onClick={() => onPlayerClick?.(pick.player)}>
                          <Highlight text={pick.player} search={playerSearch} />
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="vote-cards">
          {votes.map((vote, i) => (
            <div className="vote-card" key={i}>
              <div className="vote-card-header">
                <span className="voter-link" onClick={() => onVoterClick?.(vote.voter)}>
                  <Highlight text={vote.voter} search={voterSearch} />
                </span>
              </div>
              <div className="vote-card-affiliation">{vote.affiliation}</div>
              <div className="vote-card-picks">
                {vote.picks.map((pick, j) => (
                  "place" in pick && (
                    <div className="vote-card-pick" key={j}>
                      <span className="vote-card-pick-place">{pick.place}</span>
                      <span className="player-link" onClick={() => onPlayerClick?.(pick.player)}>
                        <Highlight text={pick.player} search={playerSearch} />
                      </span>
                    </div>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // Team awards
  return (
    <>
      <div className="vote-table-wrapper">
        <table className="vote-table">
          <thead>
            <tr>
              <th>Voter</th>
              <th>Affiliation</th>
              <th>1st Team</th>
              <th>2nd Team</th>
              {award === "All-NBA" && <th>3rd Team</th>}
            </tr>
          </thead>
          <tbody>
            {votes.map((vote, i) => {
              const firstTeam = vote.picks.filter(p => "allNbaTeam" in p && p.allNbaTeam === "1st");
              const secondTeam = vote.picks.filter(p => "allNbaTeam" in p && p.allNbaTeam === "2nd");
              const thirdTeam = vote.picks.filter(p => "allNbaTeam" in p && p.allNbaTeam === "3rd");
              
              return (
                <tr key={i}>
                  <td>
                    <span className="voter-link" onClick={() => onVoterClick?.(vote.voter)}>
                      <Highlight text={vote.voter} search={voterSearch} />
                    </span>
                  </td>
                  <td>{vote.affiliation}</td>
                  <td>{firstTeam.map((p, j) => (
                    <span key={j}>
                      {j > 0 && ", "}
                      <span className="player-link" onClick={() => onPlayerClick?.(p.player)}>
                        <Highlight text={p.player} search={playerSearch} />
                      </span>
                    </span>
                  ))}</td>
                  <td>{secondTeam.map((p, j) => (
                    <span key={j}>
                      {j > 0 && ", "}
                      <span className="player-link" onClick={() => onPlayerClick?.(p.player)}>
                        <Highlight text={p.player} search={playerSearch} />
                      </span>
                    </span>
                  ))}</td>
                  {award === "All-NBA" && (
                    <td>{thirdTeam.map((p, j) => (
                      <span key={j}>
                        {j > 0 && ", "}
                        <span className="player-link" onClick={() => onPlayerClick?.(p.player)}>
                          <Highlight text={p.player} search={playerSearch} />
                        </span>
                      </span>
                    ))}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="vote-cards">
        {votes.map((vote, i) => {
          const firstTeam = vote.picks.filter(p => "allNbaTeam" in p && p.allNbaTeam === "1st");
          const secondTeam = vote.picks.filter(p => "allNbaTeam" in p && p.allNbaTeam === "2nd");
          const thirdTeam = vote.picks.filter(p => "allNbaTeam" in p && p.allNbaTeam === "3rd");
          
          return (
            <div className="vote-card" key={i}>
              <div className="vote-card-header">
                <span className="voter-link" onClick={() => onVoterClick?.(vote.voter)}>
                  <Highlight text={vote.voter} search={voterSearch} />
                </span>
              </div>
              <div className="vote-card-affiliation">{vote.affiliation}</div>
              <div className="vote-card-picks">
                <div className="vote-card-pick">
                  <span className="vote-card-pick-place">1st</span>
                  <span>{firstTeam.map((p, j) => (
                    <span key={j}>
                      {j > 0 && ", "}
                      <span className="player-link" onClick={() => onPlayerClick?.(p.player)}>{p.player}</span>
                    </span>
                  ))}</span>
                </div>
                <div className="vote-card-pick">
                  <span className="vote-card-pick-place">2nd</span>
                  <span>{secondTeam.map((p, j) => (
                    <span key={j}>
                      {j > 0 && ", "}
                      <span className="player-link" onClick={() => onPlayerClick?.(p.player)}>{p.player}</span>
                    </span>
                  ))}</span>
                </div>
                {award === "All-NBA" && (
                  <div className="vote-card-pick">
                    <span className="vote-card-pick-place">3rd</span>
                    <span>{thirdTeam.map((p, j) => (
                      <span key={j}>
                        {j > 0 && ", "}
                        <span className="player-link" onClick={() => onPlayerClick?.(p.player)}>{p.player}</span>
                      </span>
                    ))}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}