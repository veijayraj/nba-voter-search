import { YEARS, AWARDS } from "../utils/constants";

interface FiltersProps {
  year: string;
  award: string;
  voterSearch: string;
  playerSearch: string;
  onChange: (field: string, value: string) => void;
}

export function Filters({
  year,
  award,
  voterSearch,
  playerSearch,
  onChange,
}: FiltersProps) {
  return (
    <div className="filters">
      <select value={year} onChange={(e) => onChange("year", e.target.value)}>
        {YEARS.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      <select value={award} onChange={(e) => onChange("award", e.target.value)}>
        {AWARDS.map((a) => (
          <option key={a.value} value={a.value}>{a.label}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Search voter..."
        value={voterSearch}
        onChange={(e) => onChange("voterSearch", e.target.value)}
      />

      <input
        type="text"
        placeholder="Search player..."
        value={playerSearch}
        onChange={(e) => onChange("playerSearch", e.target.value)}
      />
    </div>
  );
}