// Ranked award pick (MVP, DPOY, ROY, 6MOY, MIP, COY, CLUTCH)
export interface RankedPick {
  place: string;      // "1st", "2nd", "3rd", "4th", "5th"
  player: string;
  playerTeam: string;
}

// Team award pick (All-NBA, All-Defensive, All-Rookie)
export interface TeamPick {
  allNbaTeam: string; // "1st", "2nd", "3rd"
  player: string;
  playerTeam: string;
}

export type Pick = RankedPick | TeamPick;

export interface Vote {
  voter: string;
  affiliation: string;
  picks: Pick[];
}

export interface AwardData {
  year: string;
  award: string;
  awardType: "ranked" | "team";
  votes: Vote[];
}

// Filter state
export interface Filters {
  year: string;
  award: string;
  voter: string;
  affiliation: string;
  player: string;
}