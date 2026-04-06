import { useMemo } from "react";

interface FiltersProps {
  year: string;
  award: string;
  voterSearch: string;
  playerSearch: string;
  onChange: (field: string, value: string) => void;
  availableYears?: string[];
  availableAwards?: string[];
}

export function Filters({ 
  year, 
  award, 
  voterSearch, 
  playerSearch, 
  onChange,
  availableYears = ["2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018"],
  availableAwards = ["MVP", "DPOY", "SMOY", "6MOY", "ROY", "MIP", "All-NBA", "All-Defensive"]
}: FiltersProps) {
  
  const sortedYears = useMemo(() => 
    [...availableYears].sort().reverse(),
    [availableYears]
  );

  return (
    <div className="filters">
      <div className="filter-group">
        <label htmlFor="year-select" className="filter-label">Season</label>
        <select
          id="year-select"
          value={year}
          onChange={(e) => onChange("year", e.target.value)}
        >
          {sortedYears.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="award-select" className="filter-label">Award</label>
        <select
          id="award-select"
          value={award}
          onChange={(e) => onChange("award", e.target.value)}
        >
          {availableAwards.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="voter-search" className="filter-label">Voter</label>
        <input
          id="voter-search"
          type="text"
          placeholder="Search voter name..."
          value={voterSearch}
          onChange={(e) => onChange("voterSearch", e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="player-search" className="filter-label">Player</label>
        <input
          id="player-search"
          type="text"
          placeholder="Search player name..."
          value={playerSearch}
          onChange={(e) => onChange("playerSearch", e.target.value)}
        />
      </div>
    </div>
  );
}