"use client";

import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import type { MediaDoc, Wave } from "@/lib/postGenerator";

const SAMPLE_SUGGESTION = JSON.stringify(
  {
    id: "sug_001",
    signalType: "gap",
    platform: "instagram",
    angle: "Claim the streak-loss moment nobody in the category will touch",
    rationale:
      "Duolingo's gaps name that they never acknowledge users who quit, while streak-loss grief is a live trending topic for Gen Z learners on the same platform.",
    evidence: [
      { source: "company", name: "Duolingo", platform: "instagram" },
      { source: "audience", name: "Gen Z language learners", platform: "instagram" },
    ],
  },
  null,
  2,
);

const SAMPLE_RESEARCH = JSON.stringify(
  {
    companies: {
      Duolingo: {
        instagram: {
          summary: "Unhinged mascot content. Owl does absurd office-humor skits.",
          wins: ["Mascot as a character with opinions", "Trend audio within hours"],
          gaps: ["Never shows the product", "Never acknowledges users who quit"],
          content_examples: [{ url: "https://instagram.com/p/123", note: "Owl menaces an intern, 4M views" }],
        },
      },
    },
    audiences: {
      "Gen Z language learners": {
        instagram: {
          trending_topics: ["streak loss grief", "study-with-me but chaotic"],
          tone: "self-deprecating, fast, in on the joke",
          engaging_formats: ["reels", "carousels"],
          content_examples: [{ url: "https://instagram.com/p/456", note: "Streak-loss meme, 900k likes" }],
        },
      },
    },
  },
  null,
  2,
);

const SAMPLE_STYLE = JSON.stringify(
  {
    tone: "dry, self-aware, never salesy",
    sentenceLength: "short — usually under 12 words",
    emojiUsage: "rare, never more than one",
    hashtagUsage: "2-3 on instagram, none on linkedin or reddit",
    openingPatterns: ["states a blunt fact", "opens mid-thought"],
    vocabulary: ["streak", "day one", "actually"],
  },
  null,
  2,
);

export default function CampaignPage() {
  const [suggestion, setSuggestion] = useState(SAMPLE_SUGGESTION);
  const [research, setResearch] = useState(SAMPLE_RESEARCH);
  const [styleProfile, setStyleProfile] = useState(SAMPLE_STYLE);

  const [wave, setWave] = useState<Wave | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setWave(null);

    try {
      const response = await fetch("/api/generate-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suggestion: JSON.parse(suggestion),
          research: JSON.parse(research),
          styleProfile: JSON.parse(styleProfile),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setWave(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 1.5rem", fontFamily: "var(--font-geist-sans), sans-serif" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Wave media generator</h1>
      <p style={{ opacity: 0.6, marginTop: "0.25rem" }}>
        Approved suggestion in, lever-assigned A/B wave of <code>media</code> docs out.
      </p>

      <div style={{ display: "grid", gap: "1rem", marginTop: "2rem" }}>
        <Field label="Suggestion — one item from POST /api/suggestions">
          <textarea value={suggestion} onChange={(e) => setSuggestion(e.target.value)} rows={8} style={monoInputStyle} />
        </Field>
        <Field label="Research — evidence refs on the suggestion are resolved against this">
          <textarea value={research} onChange={(e) => setResearch(e.target.value)} rows={12} style={monoInputStyle} />
        </Field>
        <Field label="Style profile — extracted from the company's own top posts">
          <textarea value={styleProfile} onChange={(e) => setStyleProfile(e.target.value)} rows={8} style={monoInputStyle} />
        </Field>
      </div>

      <button onClick={generate} disabled={loading} style={buttonStyle}>
        {loading ? "Drafting copy + rendering images (~30-60s)…" : "Generate wave"}
      </button>

      {error && <p style={{ color: "#c00", marginTop: "1rem" }}>{error}</p>}

      {wave && (
        <>
          <p style={{ marginTop: "2rem", fontSize: "0.9rem" }}>
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
    </main>
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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.85rem" }}>
      <span style={{ opacity: 0.7 }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "0.6rem 0.75rem",
  borderRadius: 8,
  border: "1px solid rgba(128,128,128,0.35)",
  background: "transparent",
  color: "inherit",
  font: "inherit",
  resize: "vertical",
};

const monoInputStyle: CSSProperties = {
  ...inputStyle,
  fontFamily: "var(--font-geist-mono), monospace",
  fontSize: "0.75rem",
};

const buttonStyle: CSSProperties = {
  marginTop: "1.5rem",
  padding: "0.7rem 1.4rem",
  borderRadius: 8,
  border: "none",
  background: "#0070f3",
  color: "white",
  font: "inherit",
  fontWeight: 600,
  cursor: "pointer",
};
