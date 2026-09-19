# Chatathon 2026

## Architecture

Monorepo with two top-level directories:

- `frontend/` — Next.js app (App Router, JavaScript, no Tailwind). Deployed to Firebase Hosting. SSR is handled by a Firebase-managed Cloud Function behind the scenes (via the `webframeworks` experiment).
- `backend/` — Firebase Cloud Functions (Node.js 22, `firebase-functions` v2). Deployed as standalone HTTPS functions.

Firebase project ID: `chatathon-2026`

`firebase.json` at the root ties both together — hosting points to `frontend/`, functions point to `backend/`.

## Local development

```bash
# Frontend (runs on http://localhost:3000)
cd frontend && npm install && npm run dev

# Backend (runs on http://localhost:5001)
cd backend && npm install
firebase emulators:start --only functions
```

Frontend and backend are developed independently. To call a backend function from the frontend locally, use the emulator URL (`http://localhost:5001/chatathon-2026/us-central1/<functionName>`).

## Production

On deploy (`firebase deploy`), Firebase:
1. Builds the Next.js app and deploys it to Firebase Hosting with SSR support via an auto-provisioned Cloud Function.
2. Deploys `backend/index.js` as separate Cloud Functions accessible at `https://us-central1-chatathon-2026.cloudfunctions.net/<functionName>`.

The GitHub Actions workflow at `.github/workflows/firebase-hosting-deploy.yml` is set up to deploy hosting on push to `main` (requires the `FIREBASE_SERVICE_ACCOUNT_CHATATHON_2026` secret to be configured — see README).

## Key commands

- `firebase deploy` — deploy everything
- `firebase deploy --only hosting` — deploy frontend only
- `firebase deploy --only functions` — deploy backend only
- `firebase emulators:start` — run both locally via emulators
- `firebase use` — confirm active project

## Monid integration

The backend uses the Monid CLI (`@monid-ai/cli`) as a data layer for scraping social platforms and SEO data. The wrapper lives in `backend/monid.js` and shells out to the locally installed binary.

- **API key**: stored as a Firebase secret (`MONID_KEY`). Set via `firebase functions:secrets:set MONID_KEY`. For local dev, use `backend/.secret.local`.
- **Credentials bootstrap**: on first call in Cloud Functions, the wrapper writes `~/.config/monid/credentials.yaml` from the `MONID_KEY` env var.
- **Available providers**: Ahrefs (SEO/competitors), Apify (Reddit, Instagram), TikHub (Twitter, LinkedIn), MrScraper (website extraction).

## Firestore (database)

Database module lives in `backend/db.js`. Uses `firebase-admin` — no client SDK.

**Collection: `clients`**

```js
{
  id: "auto-generated",
  name: "Campco Coffee",
  website: "https://campcocoffee.com",
  socials: {
    linkedin:  { url: "https://www.linkedin.com/company/campco", handle: "campco" } | null,
    instagram: { url: "https://www.instagram.com/campcocoffee", handle: "campcocoffee" } | null,
    twitter:   { url: "https://x.com/campcocoffee", handle: "campcocoffee" } | null,
    reddit:    { url: "https://www.reddit.com/r/coffee", handle: "coffee" } | null
  },
  competitors: [],
  icps: [],
  createdAt: Timestamp
}
```

**Usage in backend code:**
```js
const { createClient, getClient, updateClient, listClients } = require("./db");
const client = await createClient({ name, website, socials });
const client = await getClient(id);
const client = await updateClient(id, { competitors: [...] });
const all = await listClients();
```

Firestore rules (`firestore.rules`) are fully open read/write for the hackathon. Deploy rules with `firebase deploy --only firestore:rules`.

## Backend API endpoints

Base URL (production): `https://us-central1-chatathon-2026.cloudfunctions.net/api`

| Method | Path | Input | Returns |
|--------|------|-------|---------|
| GET | `/health` | — | `{ status: "ok" }` |
| POST | `/onboard` | `{ name, website, socials? }` | Creates client with normalized social links `{ url, handle }` |
| POST | `/clients` | `{ name, website, socials? }` | Creates a client (raw, no normalization) |
| GET | `/clients` | — | List all clients |
| GET | `/clients/:id` | — | Get one client |
| PATCH | `/clients/:id` | any fields | Update a client |
| POST | `/monid/competitors` | `{ domain, country? }` | Ahrefs organic competitors (top 5, filtered) |
| POST | `/monid/reddit` | `{ searches[], sort?, time?, maxItems? }` | Reddit posts by keyword |
| POST | `/monid/linkedin` | `{ searchQueries[], maxPosts?, postedLimit? }` | LinkedIn posts by keyword |
| POST | `/monid/twitter` | `{ searchTerms[], maxItems?, sort? }` | Tweets by keyword |
| POST | `/monid/instagram` | `{ hashtags[], keywordSearch?, resultsLimit? }` | Instagram posts by hashtag/keyword |

## Rules

- Do not commit `.env` files, `.secret.local`, or service account keys.
- Backend functions use v2 (`firebase-functions/v2/https`), not v1.
- Frontend is Next.js with TypeScript (migrated from JS).
