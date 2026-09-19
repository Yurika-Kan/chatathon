import { NextResponse } from "next/server";
import { generateSuggestions, type Research } from "@/lib/suggestions";

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { research: Research; count?: number };
    const suggestions = await generateSuggestions(body.research, body.count);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("suggestions failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
