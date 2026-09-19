import { generateImage } from "@/lib/monid";
import { ASSET_COUNT } from "@/lib/levers";
import type { MediaDoc } from "@/lib/postGenerator";

/** Aspect ratio Monid's image model accepts, per platform. Video/carousel-only
 * platforms aren't handled here — just what single_image/carousel need. */
function aspectFor(platform: string): string {
  const p = platform.toLowerCase();
  if (p.includes("tiktok") || p.includes("reel") || p.includes("story")) return "9:16";
  if (p.includes("linkedin") || p.includes("youtube") || p === "x" || p.includes("twitter")) return "16:9";
  return "1:1";
}

// MiniMax's image endpoint has an undocumented concurrency ceiling — past it,
// requests silently come back COMPLETED with a null output (see generateImage's
// retry in lib/monid.ts). A wave with carousels can need up to
// media.length * ASSET_COUNT.carousel images; running all of them at once
// (16 for a 4-piece all-carousel wave) reliably crosses that ceiling. Capping
// concurrency here, across the whole wave rather than per-piece, keeps the
// in-flight count under it regardless of how many pieces or carousels a wave has.
const MAX_CONCURRENT_RENDERS = 3;

async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

type ImageJob = { pieceIndex: number; slotIndex: number; prompt: string; aspectRatio: string };

/**
 * Fill in mediaUrls for image-format pieces (single_image, carousel) via Monid.
 * text_only is left alone — no image renderer applies to it. generateWaveMedia's
 * schema never lets the model choose "video" (no renderer exists for it yet),
 * so that case can't reach here.
 *
 * A failed render doesn't fail the wave or even the whole piece: the copy is
 * the expensive half, so a carousel that gets 3 of 4 images back keeps those 3
 * rather than losing all of them, and a piece with zero images just ends up
 * with mediaUrls: [] and a console error.
 */
export async function renderWaveImages(media: MediaDoc[]): Promise<MediaDoc[]> {
  const jobs: ImageJob[] = media.flatMap((piece, pieceIndex) => {
    const count = ASSET_COUNT[piece.levers.format];
    if (count === 0) return [];

    const aspectRatio = aspectFor(piece.platform);
    return piece.visualPrompts
      .slice(0, count)
      .map((prompt, slotIndex) => ({ pieceIndex, slotIndex, prompt, aspectRatio }));
  });

  // Sparse per-piece slot arrays, filled by index — jobs for the same piece can
  // finish out of order across concurrent workers, and a carousel's slide order
  // matters, so this can't be built by appending as results come in.
  const slotsByPiece = new Map<number, (string | undefined)[]>();

  await mapWithConcurrency(jobs, MAX_CONCURRENT_RENDERS, async (job) => {
    try {
      const url = await generateImage(job.prompt, job.aspectRatio);
      const slots = slotsByPiece.get(job.pieceIndex) ?? [];
      slots[job.slotIndex] = url;
      slotsByPiece.set(job.pieceIndex, slots);
    } catch (error) {
      console.error(`render failed for media[${job.pieceIndex}] slot ${job.slotIndex}:`, (error as Error).message);
    }
  });

  return media.map((piece, i) => ({
    ...piece,
    mediaUrls: (slotsByPiece.get(i) ?? []).filter((url): url is string => url !== undefined),
  }));
}
