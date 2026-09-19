# Chatathon 2026

## Structure

- `frontend/` — Next.js app, deployed via Firebase Hosting
- `backend/` — Firebase Cloud Functions

## Getting started

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend (requires Firebase emulator)
cd backend && npm install && npm run serve
```

# Camco

**An autonomous, self-improving organic content engine for marketing teams.**

Built for the AINU Chatathon (Sept 19, 2026) — Track 3: ProsperiFi (AI-powered content marketing).

---

## The Problem

Marketing teams spend huge amounts of time on organic social content: researching what's working, figuring out what to post, drafting it, publishing it, and then trying to learn from the results — usually manually, and usually too slowly to act on what they learn.

Camco automates that whole loop: research → campaign generation → publish → A/B test → refine, continuously.

---

## Who It's For

Anyone responsible for a company's marketing: founders, in-house marketers, or marketing teams who want organic (non-paid) content that's grounded in real data about their brand, their audience, and their competitors — not generic AI copy.

---

## How It Works

### 1. Onboarding
- User signs up and provides their **company name**.
- They select which of the four supported platforms they want to run campaigns on: **Instagram, LinkedIn, X, Reddit**.
- The system looks up their profiles on those platforms and pulls in their product page, website, and social presence.
- An LLM expands on this raw data (with **Monid** — an API/MCP tool aggregator for social scraping — doing the underlying data collection) to figure out what the company actually does.
- The user reviews/checks off what's correct before moving on.

### 2. Creating a Campaign
- User describes the campaign: what they're trying to market, the goal, and a **campaign calendar** (start/end dates).
- The system recommends:
  - **Audiences** to target
  - **Similar companies / competitors** in the space
- The user can add, remove, or manually attach new audiences and data sources at this stage.
- **Writing style** is inferred automatically from the company's own past posts and/or competitor posts — no manual style guide needed.

### 3. Campaign Suggestions
- Once research completes, the system generates **campaign suggestions**, each grounded in one of:
  - A **trend** identified in the target audience
  - A **gap** — a problem the audience is talking about that isn't being addressed
  - A **recent viral moment** that competitors haven't capitalized on
- The user picks from these suggestions (and can add more manually).
- For each selected campaign, the system drafts media suited to the platform(s) chosen for that campaign.

### 4. Approval, Publishing & A/B Testing
- Once a campaign is approved, Camco:
  1. Publishes the drafted media in waves (**simulated/mocked for this demo** — no live posting to real platforms yet).
  2. Collects performance analytics on each wave.
  3. **A/B tests**: e.g., 4 pieces of media per wave — 2 as "version A," 2 as "version B" — all four go out, analytics come back, and the next wave is refined using those insights.
- This creates an **autonomous, self-improving content loop** that keeps optimizing without manual intervention.

### 5. Dashboard
- Shows performance across all active campaigns.
- Surfaces qualitative insights (not just raw numbers).
- Includes billing/spend tracking.
- This is purely an **organic content optimization tool** — no paid ad spend or ad-platform integration.

### 6. Research Page (standalone)
- Independent of the campaign flow, built on the same underlying infrastructure.
- Lets a user select any companies or audiences and see what's trending in their content, without needing to run a campaign.
- Reuses the same "analyze a company" / "analyze an audience" building blocks as the main product.

---

## Architecture

```
Signup/Onboarding
      │
      ▼
Company + Audience Research  ──▶  Monid (API/MCP) ──▶ scrapes Instagram, LinkedIn, X, Reddit
      │
      ▼
Campaign Creation (goal, calendar, audiences, competitors, style)
      │
      ▼
Campaign Suggestion Engine (trend / gap / viral-gap detection)
      │
      ▼
Media Drafting (GPT for copy/research, image-gen model for visuals, separate model for video)
      │
      ▼
User Approval
      │
      ▼
Publish (mocked) ──▶ Analytics Collection ──▶ A/B Comparison ──▶ feeds back into Suggestion Engine
```

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js / React |
| Backend | Node + Python |
| Database | Firebase / Firestore |
| Data collection | Monid (API + MCP) — social scraping across Instagram, LinkedIn, X, Reddit and more |
| Text / research / copy LLM | GPT |
| Image generation | Dedicated image-gen model |
| Video generation | Dedicated video-gen model |
| Publishing (demo) | Simulated/mocked — no live platform posting yet |

Repo: https://github.com/Yurika-Kan/chatathon

---

## Team

4–5 people, built for the AINU Chatathon (Raytheon Amphitheatre, Egan Research Center) — demo day: **September 19, 2026**.

---

## Current Scope (Hackathon MVP)

**In scope:**
- Onboarding + company/audience research via Monid + LLM
- Campaign creation with calendar, audience/competitor selection, style inference
- Trend/gap/viral-based campaign suggestions
- Media drafting per platform
- Simulated publish + analytics + A/B refinement loop
- Performance dashboard
- Standalone research page

**Out of scope (for now):**
- Live publishing to real social platforms (Instagram/LinkedIn/X/Reddit APIs)
- Real ad spend / paid campaigns (organic only)
- Real billing/payments integration

---

## Roadmap (Post-Hackathon)

- Replace mocked publishing with real platform APIs
- Real-money billing and spend tracking
- Expand supported platforms beyond the initial four
- Deeper personalization of writing style per audience segment
