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

/**
 * Fill in mediaUrls for image-format pieces (single_image, carousel) via Monid.
 * video and text_only are left alone — no image renderer applies to either.
 * A failed render doesn't fail the wave: the copy is the expensive half, so a
 * piece comes back with mediaUrls: [] and a console error rather than losing
 * the whole batch.
 */
export async function renderWaveImages(media: MediaDoc[]): Promise<MediaDoc[]> {
  return Promise.all(
    media.map(async (piece) => {
      const count = ASSET_COUNT[piece.levers.format];
      if (count === 0 || piece.levers.format === "video") return piece;

      const aspectRatio = aspectFor(piece.platform);

      try {
        const urls = await Promise.all(
          piece.visualPrompts.slice(0, count).map((prompt) => generateImage(prompt, aspectRatio)),
        );
        return { ...piece, mediaUrls: urls };
      } catch (error) {
        console.error(`render failed for ${piece.variant}/${piece.platform}:`, (error as Error).message);
        return piece;
      }
    }),
  );
}
