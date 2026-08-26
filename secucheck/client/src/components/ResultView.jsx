export default function ResultView({ result, onReset }) {
  const { riskLevel, flags, incidentGuidance } = result;

  return (
    <div className="card">
      <h2>Here's what we found</h2>
      <span className={`risk-badge ${riskLevel}`}>{riskLevel} risk</span>

      <div style={{ marginTop: 16 }}>
        {flags.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>
            No strong warning signs matched. That doesn't guarantee it's safe — stay cautious with anything unexpected.
          </p>
        ) : (
          flags.map((f) => (
            <div className="flag" key={f.id}>
              <h4>{f.label}</h4>
              <p>{f.explanation}</p>
            </div>
          ))
        )}
      </div>

      {incidentGuidance && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ color: "var(--high)" }}>Since you already interacted with it, do this now:</h3>
          <ul className="guidance-list">
            {incidentGuidance.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ul>
        </div>
      )}

      <button className="primary-btn" onClick={onReset} style={{ marginTop: 12 }}>
        Check something else
      </button>
    </div>
  );
}
