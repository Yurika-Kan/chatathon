import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
import { LEVERS, LEVER_NAMES, mediaTypeFor } from "@/lib/levers";
import type {
  AudiencePlatformData,
  CompanyPlatformData,
  Research,
  Suggestion,
} from "@/lib/suggestions";

const client = new OpenAI();

const MODEL = "gpt-5.6-sol";

const LeversSchema = z.object({
  hook: z.enum(LEVERS.hook),
  format: z.enum(LEVERS.format),
  tone: z.enum(LEVERS.tone),
  cta: z.enum(LEVERS.cta),
  length: z.enum(LEVERS.length),
});

const MediaSchema = z.object({
  variant: z.enum(["A", "B"]),
  platform: z.string(),
  copy: z.object({
    hook: z.string(),
    body: z.string(),
    hashtags: z.array(z.string()),
  }),
  visualPrompts: z.array(z.string()),
  levers: LeversSchema,
  rationale: z.string(),
});

// LEVER_NAMES is a literal tuple, not string[] — z.enum needs the tuple, and the
// enum is what keeps lever values safe to key leverStats on.
const WaveSchema = z.object({
  testedLever: z.enum(LEVER_NAMES),
  media: z.array(MediaSchema),
});

export type StyleProfile = {
  tone?: string;
  sentenceLength?: string;
  emojiUsage?: string;
  hashtagUsage?: string;
  openingPatterns?: string[];
  vocabulary?: string[];
};

/** lever -> value -> meanLift, derived from the leverStats collection. */
export type LeverBias = Record<string, Record<string, number>>;

/** One `media` document. campaignId and waveId are added by the caller. */
export type MediaDoc = z.infer<typeof MediaSchema> & {
  suggestionId: string | null;
  type: string;
  mediaUrls: string[];
  status: "draft";
};

export type Wave = {
  testedLever: z.infer<typeof WaveSchema>["testedLever"];
  media: MediaDoc[];
};

export type GenerateWaveArgs = {
  /** A suggestion from /api/suggestions. id is set once it is persisted. */
  suggestion: Suggestion & { id?: string };
  /** Needed to resolve suggestion.evidence refs back into the research behind them. */
  research: Research;
  styleProfile?: StyleProfile;
  leverBias?: LeverBias;
  count?: number;
};

type ResolvedEvidence = {
  source: "company" | "audience";
  name: string;
  platform: string;
  data: CompanyPlatformData | AudiencePlatformData;
};

/**
 * suggestion.evidence only carries refs (source/name/platform). Look each one up
 * so generation sees the wins, gaps, trending_topics and engaging_formats that
 * justified the suggestion, rather than the bare name of a company.
 */
function resolveEvidence(suggestion: Suggestion, research: Research): ResolvedEvidence[] {
  return suggestion.evidence.flatMap((ref) => {
    const data =
      ref.source === "company"
        ? research.companies[ref.name]?.[ref.platform]
        : research.audiences[ref.name]?.[ref.platform];

    return data ? [{ ...ref, data }] : [];
  });
}

const SYSTEM = `You are a senior social creative director drafting one wave of an A/B-tested campaign.

You do not decide what the campaign is about. That has already been decided: you are handed a suggestion the upstream engine surfaced from competitor and audience research, along with the research blocks it cited as evidence. Your job is to turn that finding into publishable media.

## The A/B design

Every piece of media records which lever values it used. Results are attributed per lever VALUE, not per piece — the system learns "question hooks beat statistic hooks for this audience" and carries that into every future wave. That only works if the wave is a clean experiment.

So:

- Pick exactly ONE lever to test this wave and report it as testedLever.
- Variant A and variant B must differ on that lever and agree on every other lever. If A is a question hook and B is a statistic hook, both must share the same format, tone, cta, and length. Otherwise the result is uninterpretable and the wave is wasted.
- Within a variant, the pieces are different executions of the same lever settings, not different strategies.

Lever values:
- hook: question, bold_claim, statistic, story
- format: single_image, carousel, video, text_only
- tone: authoritative, casual, contrarian
- cta: none, soft, direct
- length: short, medium, long

## Per piece

- copy.hook: the first line, and the only line most people see. It must match the hook lever you assigned. No throat-clearing.
- copy.body: the rest of the post, picking up after the hook. Do NOT repeat the hook. The published post is the hook, a blank line, then the body. Length must match the length lever.
- copy.hashtags: grounded in the trending_topics and content_examples in the evidence. Follow the style profile's hashtag usage. Empty array is a valid answer for platforms where hashtags read as spam.
- visualPrompts: scene descriptions for the image or video model. Describe ONE clear subject, its composition, lighting, and palette in a single flowing sentence or two — write a scene, not a brief. Count must match the format: single_image and video take exactly 1, carousel takes 4, text_only takes 0.
  Image models render text on the image unreliably — a heading of 1-3 short words can work, but a list, a paragraph, or more than a few words almost always comes out garbled. So: default to NO on-image text at all, let the composition and the photographed/illustrated subject carry the idea. Only include on-image text if it is a single short phrase (3 words or fewer) that is essential to the concept, and say so as "text overlay: '...'" separate from the scene description — never ask for a list, multiple lines, or a paragraph rendered into the image.
- levers: the values this piece actually used. These are recorded and attributed, so they must describe what you really did, not what you intended.
- rationale: one or two sentences naming the specific evidence this acts on. Falsifiable, not a platitude.

## Grounding

Write in the company's voice as described by the style profile — that profile was extracted from their own top-performing posts and is the difference between this and generic AI copy. Treat it as constraints, not suggestions.

Where the evidence includes audience data, let its engaging_formats steer the format lever and its tone steer the tone lever. Those were observed, not guessed — overriding them needs a reason.

Stay inside the evidence you were given. Do not invent audience traits, competitor behaviour, or performance claims the research does not support.

Every piece targets the suggestion's platform. Reddit is text-first: text_only and single_image are usually right there, and hashtags almost never are.`;

function biasInstruction(leverBias?: LeverBias): string {
  if (!leverBias || Object.keys(leverBias).length === 0) {
    return "This is the first wave — no prior results exist. Choose lever values that give the widest useful read, and pick whichever lever you think matters most for this audience as testedLever.";
  }

  return `Prior waves measured these lever values (meanLift, higher is better):

${JSON.stringify(leverBias, null, 2)}

Bias the non-tested levers toward proven winners. Do not lock onto them completely — a lever value with few trials is unproven rather than bad, and a wave that only exploits stops learning. Prefer testing a lever that is still unresolved over re-testing a settled one.`;
}

/**
 * Draft one wave of media for a selected campaign suggestion.
 *
 * Called twice in the Campco lifecycle: by /api/campaign/:id/approve for wave 1,
 * and by /api/campaign/:id/wave/refine for every wave after, with leverBias
 * carried over from leverStats.
 */
export async function generateWaveMedia({
  suggestion,
  research,
  styleProfile,
  leverBias,
  count = 4,
}: GenerateWaveArgs): Promise<Wave> {
  const evidence = resolveEvidence(suggestion, research);

  const response = await client.responses.parse({
    model: MODEL,
    input: [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Draft exactly ${count} pieces of media, split evenly between variant A and variant B.

Platform: ${suggestion.platform}

<suggestion>
${JSON.stringify(suggestion, null, 2)}
</suggestion>

<evidence>
${JSON.stringify(evidence, null, 2)}
</evidence>

<style_profile>
${JSON.stringify(styleProfile ?? "none supplied — infer a neutral brand voice", null, 2)}
</style_profile>

${biasInstruction(leverBias)}`,
      },
    ],
    text: { format: zodTextFormat(WaveSchema, "wave") },
  });

  const wave = response.output_parsed;
  if (!wave) throw new Error("Model returned no parseable wave");

  // Shaped as `media` documents. campaignId and waveId are the caller to add;
  // mediaUrls stays empty until whoever owns rendering fills it from visualPrompts.
  return {
    testedLever: wave.testedLever,
    media: wave.media.map((piece) => ({
      suggestionId: suggestion.id ?? null,
      variant: piece.variant,
      platform: piece.platform,
      type: mediaTypeFor(piece.levers.format),
      copy: piece.copy,
      visualPrompts: piece.visualPrompts,
      levers: piece.levers,
      mediaUrls: [],
      status: "draft",
      rationale: piece.rationale,
    })),
  };
}
