import { NextResponse } from "next/server";
import { generateWaveMedia } from "@/lib/postGenerator";
import type { GenerateWaveArgs } from "@/lib/postGenerator";
import { renderWaveImages } from "@/lib/render";

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateWaveArgs;
    const wave = await generateWaveMedia(body);
    const media = await renderWaveImages(wave.media);
    return NextResponse.json({ ...wave, media });
  } catch (error) {
    console.error("generate-posts failed:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
