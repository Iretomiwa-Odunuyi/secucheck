// src/components/Home.jsx
export default function Home({ onStart }) {
  return (
    <div>
      <div className="hero">
        <span className="badge">Free · No sign-up required</span>
        <h2>Not sure if it's safe?</h2>
        <p style={{ color: "var(--muted)" }}>
          Check the email, link, or USB drive that's making you hesitate. We'll tell you
          exactly what gave it away — or that it's clean.
        </p>
        <button className="primary-btn" style={{ marginTop: "20px" }} onClick={onStart}>
          Start a check
        </button>
      </div>

      <div className="divider" />

      <div className="steps-grid">
        <div className="card step-card">
          <div className="step-icon">1</div>
          <h4>Submit</h4>
          <p>Hand over the email, link, or drive you're unsure about.</p>
        </div>
        <div className="card step-card">
          <div className="step-icon">2</div>
          <h4>Scan</h4>
          <p>We check it against patterns real phishing attempts use.</p>
        </div>
        <div className="card step-card">
          <div className="step-icon">3</div>
          <h4>Verdict</h4>
          <p>Get a risk level and the exact reasons behind it.</p>
        </div>
      </div>
    </div>
  );
}