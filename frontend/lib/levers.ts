/**
 * The A/B levers from the Campco spec. Variants differ along these — results are
 * attributed per lever VALUE, not per variant, so a win carries into future waves.
 */
export const LEVERS = {
  hook: ["question", "bold_claim", "statistic", "story"],
  format: ["single_image", "carousel", "video", "text_only"],
  tone: ["authoritative", "casual", "contrarian"],
  cta: ["none", "soft", "direct"],
  length: ["short", "medium", "long"],
} as const;

export type Lever = keyof typeof LEVERS;
export type LeverValue<L extends Lever> = (typeof LEVERS)[L][number];
export type Format = LeverValue<"format">;

export const LEVER_NAMES = Object.keys(LEVERS) as [Lever, ...Lever[]];

/** How many visuals each format needs. text_only needs none. */
export const ASSET_COUNT: Record<Format, number> = {
  single_image: 1,
  carousel: 4,
  video: 1,
  text_only: 0,
};

/** The `type` written to the media doc, derived from the format lever. */
export function mediaTypeFor(format: Format): string {
  return format === "video" ? "video" : format === "text_only" ? "text" : format;
}
