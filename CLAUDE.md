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

## Rules

- Do not commit `.env` files or service account keys.
- Backend functions use v2 (`firebase-functions/v2/https`), not v1.
- Frontend has no build tooling beyond Next.js — no Tailwind, no TypeScript.
