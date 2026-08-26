import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/stats`)
      .then((res) => res.json())
      .then(setStats)
      .catch(() => setError("Couldn't load stats. Is the server running?"));
  }, []);

  if (error) return <div className="card"><p style={{ color: "var(--high)" }}>{error}</p></div>;
  if (!stats) return <div className="card"><p style={{ color: "var(--muted)" }}>Loading...</p></div>;

  return (
    <div>
      <div className="card">
        <h2>School-wide overview</h2>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
          Fully anonymized — no submission is linked to any individual.
        </p>
        <div className="stat-row"><span>Total submissions</span><strong>{stats.total}</strong></div>
        <div className="stat-row"><span>High risk</span><strong style={{ color: "var(--high)" }}>{stats.byRisk.high || 0}</strong></div>
        <div className="stat-row"><span>Medium risk</span><strong style={{ color: "var(--medium)" }}>{stats.byRisk.medium || 0}</strong></div>
        <div className="stat-row"><span>Low risk</span><strong style={{ color: "var(--low)" }}>{stats.byRisk.low || 0}</strong></div>
      </div>

      <div className="card">
        <h3>By category</h3>
        {Object.entries(stats.byCategory).length === 0 && <p style={{ color: "var(--muted)" }}>No data yet.</p>}
        {Object.entries(stats.byCategory).map(([cat, count]) => (
          <div className="stat-row" key={cat}>
            <span style={{ textTransform: "capitalize" }}>{cat}</span>
            <strong>{count}</strong>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Most common indicators</h3>
        {Object.entries(stats.flagCounts).length === 0 && <p style={{ color: "var(--muted)" }}>No data yet.</p>}
        {Object.entries(stats.flagCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([flag, count]) => (
            <div className="stat-row" key={flag}>
              <span>{flag.replace(/_/g, " ")}</span>
              <strong>{count}</strong>
            </div>
          ))}
      </div>
    </div>
  );
}
