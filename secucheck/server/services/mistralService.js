// Sends the submission to Mistral AI and asks it to return a structured
// risk analysis + explanation, in the same shape the old rule engine used
// to return — so the rest of the app (server.js, React frontend) didn't
// need to change at all.

const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
const MODEL = "mistral-small-latest"; // swap to mistral-large-latest for stronger reasoning if your free tier allows it

const SYSTEM_PROMPT = `You are a security-awareness assistant embedded in a school tool called SecuCheck.
A student has submitted something they encountered — an email, link, USB drive, text/social media message, or phone call — that felt suspicious.

Your job:
1. Identify the specific indicators present (or absent) that suggest this is dangerous or safe. For messages and phone calls, pay particular attention to common Nigerian scam patterns: requests for BVN, OTP, PIN, or bank/mobile money transfers; impersonation of banks, telecom providers, or government agencies (e.g. NIBSS, EFCC); urgency or fear tactics ("your account will be blocked", "act now"); and unsolicited prize/investment offers.
2. Explain each indicator in plain language a student would understand — teach the reasoning, don't just label it.
3. Give an overall risk level: "low", "medium", or "high".
4. If the student says they already interacted with it (clicked, opened, plugged in, shared info, sent money), give clear, immediate next-step guidance.

Respond ONLY with valid JSON, no markdown fences, no preamble, in exactly this shape:
{
  "riskLevel": "low" | "medium" | "high",
  "flags": [
    { "id": "short_snake_case_id", "severity": "low" | "medium" | "high", "label": "Short human label", "explanation": "1-3 sentence explanation a student can learn from" }
  ],
  "incidentGuidance": ["step one", "step two", ...]  // ONLY include this key if the student already interacted with it, otherwise omit it entirely
}

Keep explanations specific to what the student actually submitted, not generic advice. If nothing suspicious is found, return an empty flags array and riskLevel "low".`;
function buildUserPrompt(category, details, alreadyInteracted) {
  const lines = [`Category: ${category}`];
  for (const [key, value] of Object.entries(details)) {
    if (value) lines.push(`${key}: ${value}`);
  }
  lines.push(`Student already interacted with it (clicked/opened/plugged in): ${alreadyInteracted ? "yes" : "no"}`);
  return lines.join("\n");
}

export async function analyzeSubmission(category, details, alreadyInteracted) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error("MISTRAL_API_KEY is not set. Add it to a .env file in /server.");
  }

  const response = await fetch(MISTRAL_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(category, details, alreadyInteracted) },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Mistral API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error("Mistral returned no content");

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Mistral returned invalid JSON: " + raw);
  }

  // Defensive defaults in case the model omits something
  parsed.flags = parsed.flags || [];
  parsed.riskLevel = parsed.riskLevel || "low";
  if (alreadyInteracted && !parsed.incidentGuidance) {
    parsed.incidentGuidance = [
      "Disconnect from the network if possible.",
      "Report it to your school IT/security desk immediately.",
      "Don't attempt to fix it yourself.",
    ];
  }

  return parsed;
}
