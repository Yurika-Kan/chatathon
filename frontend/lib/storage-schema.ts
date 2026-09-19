export const storageKeys = {
  onboardingDraft: "campco:v1:onboarding:draft",
  researchDraft: "campco:v1:research:draft",
  researchLastResult: "campco:v1:research:last-result",
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
    && isStringArray(draft.platforms);
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
