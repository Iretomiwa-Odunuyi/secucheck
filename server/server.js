import "dotenv/config";
import express from "express";
import cors from "cors";
import { analyzeSubmission } from "./services/mistralService.js";
import { logSubmission, getAggregateStats } from "./store.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const SUPPORTED_CATEGORIES = ["email", "link", "usb", "message", "call"];

app.post("/api/submit", async (req, res) => {
  const { category, alreadyInteracted, ...details } = req.body;

  if (!SUPPORTED_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `Unsupported category: ${category}` });
  }

  try {
    const result = await analyzeSubmission(category, details, alreadyInteracted);
    const flagIds = result.flags.map((f) => f.id);

    await logSubmission({ category, riskLevel: result.riskLevel, flagIds, alreadyInteracted });

    res.json(result);
  } catch (err) {
    console.error("Analysis failed:", err.message);
    res.status(500).json({ error: "Analysis failed. Check server logs — likely a missing or invalid MISTRAL_API_KEY." });
  }
});

app.get("/api/stats", async (req, res) => {
  res.json(await getAggregateStats());
});

app.listen(PORT, () => {
  console.log(`SecuCheck server running on http://localhost:${PORT}`);
});