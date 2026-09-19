export type CampaignStatus = "Needs approval" | "Active" | "Paused";

export type CampaignSummary = {
  id: string;
  name: string;
  goal: string;
  status: CampaignStatus;
  platforms: string[];
  wave: string;
  nextAction: string;
  performance: string;
  spend: string;
};

export const campaignSummaries: CampaignSummary[] = [
  {
    id: "team-plan-launch",
    name: "Team plan launch",
    goal: "Introduce the new plan to operations leaders at growing teams.",
    status: "Needs approval",
    platforms: ["LinkedIn", "Reddit"],
    wave: "Research complete",
    nextAction: "Review 3 suggestions",
    performance: "Not published",
    spend: "$8.42",
  },
  {
    id: "customer-stories",
    name: "Customer stories",
    goal: "Turn customer outcomes into an ongoing social proof series.",
    status: "Active",
    platforms: ["LinkedIn", "Reddit"],
    wave: "Wave 2 of 3",
    nextAction: "Review 3 directions",
    performance: "+18% lift",
    spend: "$24.18",
  },
  {
    id: "founder-notes",
    name: "Founder notes",
    goal: "Build trust through concise behind-the-scenes product decisions.",
    status: "Paused",
    platforms: ["X", "LinkedIn"],
    wave: "Wave 1 complete",
    nextAction: "Resume when ready",
    performance: "+6% lift",
    spend: "$11.36",
  },
];

export type SuggestionStatus = "pending" | "approved" | "passed";

export type CampaignSuggestion = {
  id: string;
  type: "Trend" | "Gap" | "Viral gap";
  title: string;
  angle: string;
  rationale: string;
  score: number;
  platforms: string[];
  audience: string;
  evidence: {
    summary: string;
    detail: string;
  }[];
};

export const campaignSuggestions: CampaignSuggestion[] = [
  {
    id: "monday-reset",
    type: "Trend",
    title: "Own the Monday reset ritual",
    angle: "Show a calm five-minute team reset instead of another productivity overhaul.",
    rationale: "Weekly reset content is rising with operations audiences, while competitors still frame the problem as more process and more reporting.",
    score: 91,
    platforms: ["LinkedIn", "Reddit"],
    audience: "Operations leads at teams under 100",
    evidence: [
      { summary: "Topic volume +38%", detail: "Compared with the previous 30-day baseline." },
      { summary: "Mean engagement +24%", detail: "Across 18 recent audience posts." },
      { summary: "Low competitor coverage", detail: "Only 2 of 31 competitor posts address weekly reset behavior." },
    ],
  },
  {
    id: "show-the-work",
    type: "Gap",
    title: "Show the work behind calm operations",
    angle: "Turn one messy project handoff into a before-and-after story with the exact decisions that removed noise.",
    rationale: "The audience rewards practical transformation stories, but the comparison set mostly publishes feature announcements and generic advice.",
    score: 87,
    platforms: ["LinkedIn"],
    audience: "In-house operations and project leads",
    evidence: [
      { summary: "Audience engagement 1.8× baseline", detail: "For transformation and teardown topics." },
      { summary: "Competitor coverage 6%", detail: "Very few posts show a real workflow before and after." },
      { summary: "12 supporting posts", detail: "From audience discussions and adjacent brands." },
    ],
  },
  {
    id: "anti-productivity",
    type: "Viral gap",
    title: "Respond to the anti-productivity backlash",
    angle: "Agree that more tools are not the answer, then demonstrate what a smaller operating rhythm looks like.",
    rationale: "A breakout Reddit discussion is gaining unusual engagement and no tracked competitor has responded to the underlying frustration yet.",
    score: 82,
    platforms: ["Reddit", "LinkedIn"],
    audience: "Tool-fatigued startup operators",
    evidence: [
      { summary: "Breakout post z-score 3.1", detail: "Unusually strong relative to the account's own baseline." },
      { summary: "Posted 18 hours ago", detail: "Still inside the current response window." },
      { summary: "No competitor response", detail: "No matching topic post since the breakout appeared." },
    ],
  },
];
