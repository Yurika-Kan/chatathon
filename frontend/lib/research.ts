export type ResearchRequest = {
  platforms: string[];
  companies: string[];
  audiences: string[];
};

export type ResearchResponse = {
  companies: Record<string, string>;
  audiences: Record<string, string>;
  standoutData: string;
};
