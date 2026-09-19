import type { Wave } from "@/lib/postGenerator";

export const storageKeys = {
  onboardingDraft: "campco:v1:onboarding:draft",
  researchDraft: "campco:v1:research:draft",
  researchLastResult: "campco:v1:research:last-result",
  campaignWorkspace: "campco:v1:campaign:workspace",
  generationDraft: "campco:v1:generation:draft",
  generationLastWave: "campco:v1:generation:last-wave",
  campaigns: "campco:v1:campaigns",
  outbox: "campco:v1:outbox",
} as const;

export type OnboardingDraft = {
  step: number;
  discovered: boolean;
  website: string;
  linkedinUrl: string;
  instagramUrl: string;
  redditUrl: string;
  xUrl: string;
  companyContext: string;
  competitors: string[];
  audiences: string[];
  competitorInput: string;
  audienceInput: string;
  goalTitle: string;
  goalDescription: string;
  platforms: string[];
  clientId?: string;
  onboardedWebsite?: string;
  discoverySource?: "live" | "fallback";
};

export type ResearchDraft = {
  platforms: string[];
  companies: string[];
  audiences: string[];
  companyInput: string;
  audienceInput: string;
  goalTitle: string;
  goalDescription: string;
  submitted: boolean;
  initializedFromOnboarding: boolean;
};

export type CampaignWorkspaceDraft = {
  view: "opportunities" | "source" | "results";
  selectedOpportunityId: string;
  selectedTopicId: string;
};

export type GenerationDraft = {
  suggestion: string;
  research: string;
  styleProfile: string;
};

export type CachedGeneration = {
  draft: GenerationDraft;
  wave: Wave;
  generatedAt: string;
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

export function isOnboardingDraft(value: unknown): value is OnboardingDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Record<string, unknown>;
  return Number.isInteger(draft.step)
    && typeof draft.discovered === "boolean"
    && ["website", "linkedinUrl", "instagramUrl", "redditUrl", "xUrl", "companyContext", "competitorInput", "audienceInput", "goalTitle", "goalDescription"].every((key) => typeof draft[key] === "string")
    && isStringArray(draft.competitors)
    && isStringArray(draft.audiences)
    && isStringArray(draft.platforms)
    && (draft.clientId === undefined || typeof draft.clientId === "string")
    && (draft.onboardedWebsite === undefined || typeof draft.onboardedWebsite === "string")
    && (draft.discoverySource === undefined || ["live", "fallback"].includes(String(draft.discoverySource)));
}

export function isResearchDraft(value: unknown): value is ResearchDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Record<string, unknown>;
  return isStringArray(draft.platforms)
    && isStringArray(draft.companies)
    && isStringArray(draft.audiences)
    && ["companyInput", "audienceInput", "goalTitle", "goalDescription"].every((key) => typeof draft[key] === "string")
    && typeof draft.submitted === "boolean"
    && typeof draft.initializedFromOnboarding === "boolean";
}

export function isCampaignWorkspaceDraft(value: unknown): value is CampaignWorkspaceDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Record<string, unknown>;
  return ["opportunities", "source", "results"].includes(String(draft.view))
    && typeof draft.selectedOpportunityId === "string"
    && typeof draft.selectedTopicId === "string";
}

export function isGenerationDraft(value: unknown): value is GenerationDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Record<string, unknown>;
  return typeof draft.suggestion === "string"
    && typeof draft.research === "string"
    && typeof draft.styleProfile === "string";
}

export function isCachedGeneration(value: unknown): value is CachedGeneration {
  if (!value || typeof value !== "object") return false;
  const cached = value as Record<string, unknown>;
  const wave = cached.wave as Record<string, unknown> | undefined;
  return isGenerationDraft(cached.draft)
    && typeof cached.generatedAt === "string"
    && Boolean(wave)
    && typeof wave?.testedLever === "string"
    && Array.isArray(wave?.media);
}
