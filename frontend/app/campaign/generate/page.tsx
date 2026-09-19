"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { readStoredValue, writeStoredValue } from "@/lib/browser-storage";
import { campaignSuggestions } from "@/lib/campaigns";
import type { MediaDoc, StyleProfile, Wave } from "@/lib/postGenerator";
import type { Research, Suggestion } from "@/lib/suggestions";
import { isCachedGeneration, storageKeys, type CachedGeneration, type GenerationDraft } from "@/lib/storage-schema";
import { PageHeader } from "@/app/ui/page-header";

const SIGNAL_TYPE: Record<string, Suggestion["signalType"]> = {
  Trend: "trend",
  Gap: "gap",
  "Viral gap": "viral",
};

// Fixture standing in for the not-yet-built research pipeline (see lib/research.ts).
// EVIDENCE below cites these same names/platforms so resolveEvidence in
// postGenerator.ts actually resolves something to ground the copy in.
const RESEARCH: Research = {
  companies: {
    Duolingo: {
      instagram: {
        summary: "Fun mascot content.",
        wins: ["Playful tone"],
        gaps: ["Never acknowledges users who quit"],
        content_examples: [],
      },
    },
  },
  audiences: {
    "Gen Z language learners": {
      instagram: {
        trending_topics: ["streak loss"],
        tone: "casual",
        engaging_formats: ["photos"],
        content_examples: [],
      },
    },
  },
};

const STYLE_PROFILE: StyleProfile = {
  tone: "casual",
};

const EVIDENCE: Suggestion["evidence"] = [
  { source: "company", name: "Duolingo", platform: "instagram" },
  { source: "audience", name: "Gen Z language learners", platform: "instagram" },
];

function draftsMatch(left: GenerationDraft, right: GenerationDraft) {
  return left.suggestion === right.suggestion
    && left.research === right.research
    && left.styleProfile === right.styleProfile;
}

export default function GeneratePage() {
  return (
    <Suspense fallback={null}>
      <GenerateView />
    </Suspense>
  );
}

function GenerateView() {
  const searchParams = useSearchParams();
  const suggestionId = searchParams.get("suggestion");
  const opportunity = campaignSuggestions.find((item) => item.id === suggestionId) ?? campaignSuggestions[0];

  const suggestion: Suggestion = {
    signalType: SIGNAL_TYPE[opportunity.type],
    platform: opportunity.platforms[0].toLowerCase(),
    angle: opportunity.angle,
    rationale: opportunity.rationale,
    evidence: EVIDENCE,
  };

  const draft: GenerationDraft = {
    suggestion: JSON.stringify(suggestion),
    research: JSON.stringify(RESEARCH),
    styleProfile: JSON.stringify(STYLE_PROFILE),
  };

  const [wave, setWave] = useState<Wave | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setWave(null);
    void readStoredValue(storageKeys.generationLastWave, isCachedGeneration).then((cached) => {
      if (cached && draftsMatch(cached.draft, draft)) setWave(cached.wave);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opportunity.id]);

  async function generate() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestion, research: RESEARCH, styleProfile: STYLE_PROFILE }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const cached: CachedGeneration = { draft, wave: data as Wave, generatedAt: new Date().toISOString() };
      setWave(cached.wave);
      await writeStoredValue(storageKeys.generationLastWave, cached);
    } catch (err) {
      const cached = await readStoredValue(storageKeys.generationLastWave, isCachedGeneration);
      if (cached && draftsMatch(cached.draft, draft)) {
        setWave(cached.wave);
        setError(`${(err as Error).message} Showing the last saved wave.`);
      } else {
        setError((err as Error).message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <Link className="back-link" href="/campaign">
        <ArrowLeft size={16} aria-hidden="true" /> Campaign
      </Link>

      <PageHeader
        eyebrow="Wave generator"
        title={opportunity.title}
        description={opportunity.angle}
        action={(
          <button className="button primary" onClick={generate} disabled={loading} type="button">
            {loading ? "Drafting copy + rendering images (~30-60s)…" : "Generate wave"}
          </button>
        )}
      />

      {error && <p style={{ color: "#c00", marginTop: "1rem" }}>{error}</p>}

      {wave && (
        <>
          <p style={{ marginTop: "1.5rem", fontSize: "0.9rem" }}>
            Testing lever: <strong>{wave.testedLever}</strong> — A and B differ on this and agree on everything else.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem", marginTop: "1rem" }}>
            {wave.media.map((piece, i) => (
              <MediaCard key={i} piece={piece} />
            ))}
          </div>

          <details style={{ marginTop: "2rem" }}>
            <summary style={{ cursor: "pointer", fontSize: "0.9rem" }}>Raw media docs</summary>
            <pre style={{ fontSize: "0.7rem", overflowX: "auto", background: "rgba(128,128,128,0.08)", padding: "1rem", borderRadius: 8 }}>
              {JSON.stringify(wave.media, null, 2)}
            </pre>
          </details>
        </>
      )}
    </div>
  );
}

function MediaCard({ piece }: { piece: MediaDoc }) {
  return (
    <article style={{ border: "1px solid rgba(128,128,128,0.3)", borderRadius: 12, padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.6 }}>
        <span>
          {piece.variant} · {piece.platform}
        </span>
        <span>{piece.type}</span>
      </div>

      {piece.mediaUrls.length > 0 ? (
        <div style={{ display: "flex", gap: "0.4rem", overflowX: "auto" }}>
          {piece.mediaUrls.map((url, i) => (
            <img
              key={i}
              src={url}
              alt=""
              style={{ width: piece.mediaUrls.length > 1 ? "60%" : "100%", flexShrink: 0, borderRadius: 8 }}
            />
          ))}
        </div>
      ) : (
        piece.type !== "text" && (
          <div
            style={{
              padding: "1.5rem 1rem",
              textAlign: "center",
              background: "rgba(128,128,128,0.1)",
              borderRadius: 8,
              fontSize: "0.75rem",
              opacity: 0.6,
            }}
          >
            No render — check server logs
          </div>
        )
      )}

      <strong>{piece.copy.hook}</strong>
      <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{piece.copy.body}</p>
      {piece.copy.hashtags.length > 0 && (
        <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.6 }}>{piece.copy.hashtags.join(" ")}</p>
      )}

      <p style={{ margin: 0, fontSize: "0.7rem", opacity: 0.55, fontFamily: "var(--font-geist-mono), monospace" }}>
        {Object.entries(piece.levers)
          .map(([lever, value]) => `${lever}:${value}`)
          .join("  ")}
      </p>

      <details style={{ fontSize: "0.8rem", opacity: 0.7 }}>
        <summary style={{ cursor: "pointer" }}>Visual prompts &amp; rationale</summary>
        <p style={{ marginTop: "0.5rem" }}>{piece.rationale}</p>
        {piece.visualPrompts.map((prompt, i) => (
          <p key={i} style={{ marginTop: "0.5rem", fontStyle: "italic" }}>
            {prompt}
          </p>
        ))}
      </details>
    </article>
  );
}
