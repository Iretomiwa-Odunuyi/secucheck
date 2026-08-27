import { useState } from "react";
import ResultView from "./ResultView.jsx";

const CATEGORIES = [
  { id: "email", label: "Email" },
  { id: "link", label: "Link" },
  { id: "usb", label: "USB Drive" },
  { id: "message", label: "Message" },
  { id: "call", label: "Phone Call" },
];

const API_BASE = import.meta.env.VITE_API_BASE ;

export default function SubmitFlow() {
  const [category, setCategory] = useState(null);
  const [form, setForm] = useState({});
  const [alreadyInteracted, setAlreadyInteracted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function reset() {
    setCategory(null);
    setForm({});
    setAlreadyInteracted(false);
    setResult(null);
    setError(null);
  }

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, alreadyInteracted, ...form }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Couldn't reach the server. Is it running on localhost:4000?");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return <ResultView result={result} onReset={reset} />;
  }

  if (!category) {
    return (
      <div className="card">
        <h2>What did you encounter?</h2>
        <p style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
          Pick the type of thing that felt suspicious. This takes under a minute.
        </p>
        <div className="category-grid">
          {CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setCategory(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>{CATEGORIES.find((c) => c.id === category).label} check</h2>

      {category === "email" && (
        <>
          <label>Who did the email claim to be from? (e.g. "School Registrar")</label>
          <input type="text" onChange={(e) => updateField("claimedOrg", e.target.value)} />

          <label>What was the actual sender's domain? (the part after @)</label>
          <input type="text" placeholder="e.g. mail-secure123.com" onChange={(e) => updateField("senderDomain", e.target.value)} />

          <label>Paste the subject line or a bit of the body text</label>
          <textarea rows={3} onChange={(e) => updateField("subjectOrBody", e.target.value)} />

          <label>Attachment file name, if any</label>
          <input type="text" placeholder="e.g. invoice.pdf.exe" onChange={(e) => updateField("attachmentName", e.target.value)} />
        </>
      )}

      {category === "link" && (
        <>
          <label>The actual URL (hover/long-press to reveal it, don't click it)</label>
          <input type="text" placeholder="https://..." onChange={(e) => updateField("url", e.target.value)} />

          <label>What text was displayed for the link, if different from the URL?</label>
          <input type="text" onChange={(e) => updateField("displayText", e.target.value)} />
        </>
      )}

      {category === "usb" && (
        <>
          <label>Where did the USB drive come from?</label>
          <input type="text" placeholder="e.g. found on floor, unknown, colleague" onChange={(e) => updateField("source", e.target.value)} />

          <label>What happened when you plugged it in?</label>
          <textarea rows={3} placeholder="e.g. opened automatically, nothing unusual, popup appeared" onChange={(e) => updateField("behaviorDescription", e.target.value)} />
        </>
      )}
      {category === "message" && (
  <>
    <label>What platform was it sent through? (SMS, WhatsApp, Facebook, etc.)</label>
    <input type="text" onChange={(e) => updateField("platform", e.target.value)} />

    <label>Who did the sender claim to be? (e.g. "GTBank", "MTN", a friend's name)</label>
    <input type="text" onChange={(e) => updateField("claimedSender", e.target.value)} />

    <label>Paste the message text</label>
    <textarea rows={3} onChange={(e) => updateField("messageText", e.target.value)} />

    <label>Did it ask for money, your PIN/OTP, or personal details?</label>
    <input type="text" placeholder="e.g. asked for BVN, asked to send money" onChange={(e) => updateField("requestedInfo", e.target.value)} />
  </>
)}

{category === "call" && (
  <>
    <label>What number or caller ID showed up?</label>
    <input type="text" onChange={(e) => updateField("callerNumber", e.target.value)} />

    <label>Who did the caller claim to be?</label>
    <input type="text" placeholder="e.g. bank staff, NIBSS, police" onChange={(e) => updateField("claimedIdentity", e.target.value)} />

    <label>What did they ask you to do?</label>
    <textarea rows={3} placeholder="e.g. share OTP, transfer money, confirm account details" onChange={(e) => updateField("requestDescription", e.target.value)} />

    <label>Did they create urgency or pressure? (e.g. "act now or your account is blocked")</label>
    <input type="text" onChange={(e) => updateField("urgencyTactic", e.target.value)} />
  </>
)}

      <div className="checkbox-row">
        <input
          type="checkbox"
          id="interacted"
          checked={alreadyInteracted}
          onChange={(e) => setAlreadyInteracted(e.target.checked)}
        />
        <label htmlFor="interacted" style={{ margin: 0 }}>
          I already clicked / opened / plugged this in
        </label>
      </div>

      {error && <p style={{ color: "var(--high)", fontSize: "0.85rem" }}>{error}</p>}

      <button type="submit" className="primary-btn" disabled={loading}>
        {loading ? "Analyzing..." : "Analyze it"}
      </button>
      <button type="button" className="ghost-btn" onClick={reset}>
        Back
      </button>
    </form>
  );
}
