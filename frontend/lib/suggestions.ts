import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";

const client = new OpenAI();

const MODEL = "gpt-5.6-sol";

/**
 * Research input shape — company/audience name -> platform -> what was found there.
 * This is the raw output of the (not-yet-built) scrape + normalize + embed +
 * cluster pipeline described in the README. Until that pipeline exists, this
 * module reads the raw research directly.
 */
export type ContentExample = { url: string; note: string };

export type CompanyPlatformData = {
  summary: string;
  wins: string[];
  gaps: string[];
  content_examples: ContentExample[];
};

export type AudiencePlatformData = {
  trending_topics: string[];
  tone: string;
  engaging_formats: string[];
  content_examples: ContentExample[];
};

export type Research = {
  companies: Record<string, Record<string, CompanyPlatformData>>;
  audiences: Record<string, Record<string, AudiencePlatformData>>;
};

const EvidenceRefSchema = z.object({
  source: z.enum(["company", "audience"]),
  name: z.string(),
  platform: z.string(),
});

const SuggestionSchema = z.object({
  signalType: z.enum(["trend", "gap", "viral"]),
  platform: z.string(),
  angle: z.string(),
  rationale: z.string(),
  evidence: z.array(EvidenceRefSchema),
});

const SuggestionSetSchema = z.object({ suggestions: z.array(SuggestionSchema) });

/**
 * `suggestions` collection doc, minus the fields the caller owns:
 * campaignId (which campaign this belongs to) and selected (user's pick),
 * neither of which this generation call has enough context to set.
 * signalId is likewise absent — that references a real `signals` doc from the
 * detector pipeline, which doesn't exist yet, so `signalType` + `evidence`
 * stand in as the traceable justification until it does.
 */
export type Suggestion = z.infer<typeof SuggestionSchema>;

const SYSTEM = `You are the campaign suggestion engine for Campco, a social content platform.

The real architecture computes trend/gap/viral signals deterministically — volume and engagement scoring over embedded, clustered posts — and only asks an LLM to write the pitch for a signal that already scored above threshold. That scoring pipeline is not wired up yet, so you are doing both jobs at once: finding defensible candidates in the raw research AND writing the pitch. Compensate by being stricter about evidence than you would if a detector had already done the filtering.

You receive research shaped as:
- companies: company name -> platform -> { summary, wins[], gaps[], content_examples[] }
- audiences: audience segment name -> platform -> { trending_topics[], tone, engaging_formats[], content_examples[] }

Definitions — use these, not vibes:
- trend: a topic that shows up as a trending_topic for an audience AND is not addressed by any company's wins on that platform. Rising interest with no one owning it yet.
- gap: something a company's own gaps list names, or something audiences are engaging with (trending_topics) that appears in NO company's summary or wins on that platform. Unclaimed territory.
- viral: a specific standout moment named in a content_examples note (either side) that reads as a one-off breakout, not a sustained pattern.

Rules:
1. Every suggestion must cite at least one real name from the input in "evidence" — an actual company or audience name that appears in the research, with the platform it was found on. Do not invent companies, audiences, or platforms not present in the input.
2. angle is the creative strategy in one sentence, not a restatement of the evidence.
3. rationale names the specific gap, win, trending_topic, or content_example note it acts on — quote or closely paraphrase the research, don't generalize it into a platitude.
4. platform must be one of the platforms that appears in the input research.
5. Do not produce two suggestions with the same signalType + platform combination unless the evidence is clearly distinct.
6. If the research is thin, return fewer suggestions rather than padding with weak ones.`;

/**
 * Turn raw research into campaign suggestion candidates.
 *
 * Maps to `GET /api/campaign/:id/suggestions` in the Campco spec, minus the
 * detector pass that spec assumes already ran. The caller attaches campaignId
 * and selected when persisting these as `suggestions` docs.
 */
export async function generateSuggestions(research: Research, count = 6): Promise<Suggestion[]> {
  const response = await client.responses.parse({
    model: MODEL,
    input: [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Generate up to ${count} suggestions from this research.

<research>
${JSON.stringify(research, null, 2)}
</research>`,
      },
    ],
    text: { format: zodTextFormat(SuggestionSetSchema, "suggestions") },
  });

  const parsed = response.output_parsed;
  if (!parsed) throw new Error("Model returned no parseable suggestions");

  return parsed.suggestions;
}
