# SecuCheck — Malware Awareness Assistant

A school-facing tool where students submit suspicious emails, links, or USB
encounters and get an explained risk analysis — plus immediate next steps if
they've already interacted with it. Anonymized submissions feed a school-wide
dashboard so awareness efforts can target real, current threats instead of
generic training.

Maps to NIST SP 800-83's Awareness element: recognizing malware indicators,
safe practices, and incident-reporting procedures — learned through solving a
real problem, not a quiz.

## Project structure

```
secucheck/
  server/     Express backend + rule-based analysis engine
  client/     React frontend (Vite)
```

## Running it locally

**1. Start the backend**
```
cd server
npm install
npm run dev
```
Runs on http://localhost:4000. Data is stored in memory for now (see
`server/store.js`) — swap in Postgres before deploying for real, since
in-memory data disappears on restart.

**2. Start the frontend** (separate terminal)
```
cd client
npm install
npm run dev
```
Runs on http://localhost:5173 and talks to the backend automatically.

## What's implemented right now

- Email, link, and USB submission flows with conditional follow-up questions
- Rule-based indicator checks (sender mismatch, urgency language, double
  extensions, IP-address URLs, suspicious TLDs, display-text mismatches,
  unknown USB sources, autorun behavior) — see `server/rules/`
- "Already interacted with it" branch that switches to immediate incident
  guidance instead of just explaining the risk
- Anonymized in-memory logging + an aggregate dashboard (`/api/stats`)

## Before you present or deploy

- [ ] Add your school's real IT/security contact in
      `server/rules/incidentGuidance.js`
- [ ] Add a file-attachment and pop-up category if you want full coverage
      (currently email, link, USB — file and pop-up are on the roadmap)
- [ ] Swap `server/store.js` from in-memory to Postgres so data survives
      restarts and scales past a demo
- [ ] Deploy: frontend → Vercel, backend → Render (or similar). Set
      `VITE_API_BASE` in the client's environment to your deployed backend URL

## Deploying to Vercel

Create two Vercel projects from this repository:

1. Import the repository as the frontend project, set **Root Directory** to
      `client`, and add `VITE_API_BASE` with the URL of the deployed backend.
2. Import the repository again as the backend project, set **Root Directory**
      to `server`, and add `MISTRAL_API_KEY` and a production `DATABASE_URL`.
3. The backend project automatically uses `api/index.js` as its serverless
      function. Set the frontend's `VITE_API_BASE` to that backend project's URL,
      then redeploy the frontend.

The current storage fallback keeps the API usable without PostgreSQL, but
Vercel serverless instances are temporary. Use a hosted PostgreSQL database
for persistent submissions and run the Prisma migration before production use.
- [ ] Decide on your anonymization stance explicitly (fully anonymous vs.
      session-only) and document it — this is something a lecturer grading
      the Awareness/Policy overlap may ask about directly

## Why this stack

Plain rule-based JS instead of ML: every flag is explainable, which matters
because the point of the tool is teaching *why* something is risky, not just
scoring it. A black-box model would undercut that.
