import type { ComponentType } from "react";
import { MvpVoteShare } from "./charts/MvpVoteShare";

interface ChartEntry {
  id: string;
  component: ComponentType;
}

const CHART_REGISTRY: ChartEntry[] = [
  { id: "mvp-vote-share", component: MvpVoteShare },
];

export function AnalyticsPage() {
  return (
    <div>
      <div style={{ marginBottom: "var(--spacing-2xl)" }}>
        <h1>Analytics</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 0 }}>
          Visual insights into NBA award voting trends
        </p>
      </div>
      <div className="chart-gallery">
        {CHART_REGISTRY.map(({ id, component: Chart }) => (
          <Chart key={id} />
        ))}
      </div>
    </div>
  );
}
