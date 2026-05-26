import { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const COLORS = ["#1a5490", "#e8540f", "#10b981", "#f59e0b", "#8b5cf6"];

interface Top5Entry {
  player: string;
  vote_share: number;
}

interface MvpYearData {
  year: string;
  top_5: Top5Entry[];
}

export function MvpVoteShare() {
  const [mvpData, setMvpData] = useState<MvpYearData[]>([]);
  const [playerInput, setPlayerInput] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [yearFrom, setYearFrom] = useState<string>("");
  const [yearTo, setYearTo] = useState<string>("");

  useEffect(() => {
    fetch("./data/analytics.json")
      .then(r => r.json())
      .then(d => {
        const summary: MvpYearData[] = d.mvp_summary || [];
        setMvpData(summary);
        const years = [...new Set(summary.map(s => s.year))].sort();
        if (years.length) { setYearFrom(years[0]); setYearTo(years[years.length - 1]); }
      });
  }, []);

  const allPlayerNames = useMemo(() => {
    const names = new Set<string>();
    for (const yr of mvpData) {
      for (const entry of yr.top_5) names.add(entry.player);
    }
    return [...names].sort();
  }, [mvpData]);

  const playerDataMap = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    for (const yr of mvpData) {
      for (const entry of yr.top_5) {
        if (!map[entry.player]) map[entry.player] = {};
        map[entry.player][yr.year] = entry.vote_share;
      }
    }
    return map;
  }, [mvpData]);

  const allYears = useMemo(
    () => [...new Set(mvpData.map(d => d.year))].sort(),
    [mvpData]
  );

  const filteredYears = useMemo(
    () => allYears.filter(y => y >= yearFrom && y <= yearTo),
    [allYears, yearFrom, yearTo]
  );

  const chartData = useMemo(() => {
    return filteredYears.map(year => {
      const point: Record<string, string | number> = { year };
      for (const player of selectedPlayers) {
        point[player] = playerDataMap[player]?.[year] ?? 0;
      }
      return point;
    });
  }, [filteredYears, selectedPlayers, playerDataMap]);

  const suggestions = useMemo(() => {
    if (!playerInput) return [];
    return allPlayerNames
      .filter(n => !selectedPlayers.includes(n) && n.toLowerCase().includes(playerInput.toLowerCase()))
      .slice(0, 8);
  }, [playerInput, allPlayerNames, selectedPlayers]);

  const addPlayer = (name: string) => {
    if (selectedPlayers.length >= 5 || selectedPlayers.includes(name)) return;
    setSelectedPlayers(prev => [...prev, name]);
    setPlayerInput("");
    setShowDropdown(false);
  };

  const removePlayer = (name: string) => {
    setSelectedPlayers(prev => prev.filter(p => p !== name));
  };

  return (
    <div className="chart-card">
      <h3 className="chart-title">MVP Vote Share Over Time</h3>
      <p className="chart-subtitle">
        Compare how players' MVP vote share % changed across seasons
      </p>

      <div className="chart-controls">
        <div className="chart-player-select">
          <div className="voter-autocomplete-wrap">
            <input
              className="chart-player-input"
              placeholder={selectedPlayers.length >= 5 ? "Max 5 players selected" : "Add a player..."}
              value={playerInput}
              disabled={selectedPlayers.length >= 5}
              onChange={e => { setPlayerInput(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            />
            {showDropdown && suggestions.length > 0 && (
              <div className="voter-autocomplete-dropdown">
                {suggestions.map(s => (
                  <div key={s} className="voter-autocomplete-item" onMouseDown={() => addPlayer(s)}>
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedPlayers.length > 0 && (
            <div className="chart-player-chips">
              {selectedPlayers.map((p, i) => (
                <span key={p} className="player-chip" style={{ borderColor: COLORS[i], color: COLORS[i] }}>
                  {p}
                  <button onClick={() => removePlayer(p)} aria-label={`Remove ${p}`}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="chart-year-range">
          <div className="filter-group">
            <label className="filter-label">From</label>
            <select value={yearFrom} onChange={e => { setYearFrom(e.target.value); if (e.target.value > yearTo) setYearTo(e.target.value); }}>
              {allYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">To</label>
            <select value={yearTo} onChange={e => { setYearTo(e.target.value); if (e.target.value < yearFrom) setYearFrom(e.target.value); }}>
              {allYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {selectedPlayers.length === 0 ? (
        <div className="chart-empty">
          Add up to 5 players above to compare their MVP vote share over time.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={typeof window !== "undefined" && window.innerWidth < 600 ? 260 : 380}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="year" tick={{ fontSize: 13 }} />
            <YAxis
              tickFormatter={v => `${v}%`}
              tick={{ fontSize: 12 }}
              domain={[0, 100]}
            />
            <Tooltip formatter={(v) => [`${Number(v).toFixed(1)}%`]} />
            <Legend />
            {selectedPlayers.map((p, i) => (
              <Line
                key={p}
                type="monotone"
                dataKey={p}
                stroke={COLORS[i]}
                strokeWidth={2.5}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
