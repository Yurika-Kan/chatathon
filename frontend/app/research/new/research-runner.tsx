"use client";

import { AlertCircle, CheckCircle2, LoaderCircle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { backendPost } from "@/lib/backend";
import type { ResearchEntityType } from "@/lib/research";

type RunState = {
  status: "loading" | "success" | "error";
  records?: unknown[];
  error?: string;
  source?: "live" | "fallback";
};

function fallbackRecords(entityType: ResearchEntityType, entityName: string, platform: string) {
  const subject = entityType === "company" ? `${entityName}'s category` : entityName;
  return [
    `Sample trend: ${subject} is responding to concise, native ${platform} posts that lead with one concrete takeaway.`,
    `Sample gap: competing content often explains features without showing a specific before-and-after outcome.`,
    `Sample opportunity: test a proof-led hook for ${entityName}, then compare it with a direct question aimed at the same audience.`,
  ];
}

function requestFor(platform: string, entityName: string) {
  switch (platform.toLowerCase()) {
    case "reddit":
      return { path: "/monid/reddit", body: { searches: [entityName], sort: "top", time: "month", maxItems: 10 } };
    case "linkedin":
      return { path: "/monid/linkedin", body: { searchQueries: [entityName], maxPosts: 10, postedLimit: "month" } };
    case "instagram":
      return { path: "/monid/instagram", body: { hashtags: [entityName.replace(/^@/, "")], keywordSearch: true, resultsLimit: 10 } };
    case "x":
    case "twitter":
      return { path: "/monid/twitter", body: { searchTerms: [entityName], maxItems: 10, sort: "Latest + Top" } };
    default:
      throw new Error(`${platform} is not supported yet.`);
  }
}

function recordsFrom(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return payload ? [payload] : [];

  const value = payload as Record<string, unknown>;
  for (const key of ["items", "rows", "data", "results", "datasetItems"]) {
    if (Array.isArray(value[key])) return value[key] as unknown[];
  }
  if (value.output !== undefined) return recordsFrom(value.output);
  return [payload];
}

function recordText(record: unknown): string {
  if (typeof record === "string") return record;
  if (!record || typeof record !== "object") return String(record ?? "");

  const value = record as Record<string, unknown>;
  const parts = [
    value.title,
    value.text,
    value.caption,
    value.body,
    value.content,
    value.description,
    value.url,
  ].filter((item): item is string => typeof item === "string" && item.trim().length > 0);

  return (parts.join(" · ") || JSON.stringify(record)).slice(0, 280);
}

export function ResearchRunner({
  entityType,
  entityName,
  platforms,
}: {
  entityType: ResearchEntityType;
  entityName: string;
  platforms: string[];
}) {
  const [runs, setRuns] = useState<Record<string, RunState>>({});
  const started = useRef(false);

  const runResearch = useCallback(async () => {
    setRuns(Object.fromEntries(platforms.map((platform) => [platform, { status: "loading" }])));

    await Promise.all(platforms.map(async (platform) => {
      try {
        const request = requestFor(platform, entityName);
        const payload = await backendPost<unknown>(request.path, request.body, { timeoutMs: 8_000 });
        setRuns((current) => ({
          ...current,
          [platform]: { status: "success", records: recordsFrom(payload), source: "live" },
        }));
      } catch {
        setRuns((current) => ({
          ...current,
          [platform]: {
            status: "success",
            records: fallbackRecords(entityType, entityName, platform),
            source: "fallback",
          },
        }));
      }
    }));
  }, [entityName, entityType, platforms]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void runResearch();
  }, [runResearch]);

  const isRunning = platforms.some((platform) => runs[platform]?.status === "loading");

  return (
    <section className="research-live-workspace" aria-label={`${entityType} research results`}>
      <div className="research-live-toolbar">
        <strong>Live research</strong>
        <button className="button secondary" type="button" onClick={() => void runResearch()} disabled={isRunning}>
          <RefreshCw size={16} aria-hidden="true" /> Run again
        </button>
      </div>

      <div className="research-live-grid">
        {platforms.map((platform) => {
          const run = runs[platform] ?? { status: "loading" as const };
          const records = run.records ?? [];

          return (
            <article className="research-result-card" data-state={run.status} key={platform}>
              <header>
                <h2>{platform}</h2>
                {run.status === "loading" ? <LoaderCircle className="spin" size={18} aria-label="Loading" /> : null}
                {run.status === "success" && run.source !== "fallback" ? <CheckCircle2 size={18} aria-label="Complete" /> : null}
                {run.status === "success" && run.source === "fallback" ? <AlertCircle size={18} aria-label="Sample results" /> : null}
                {run.status === "error" ? <AlertCircle size={18} aria-label="Failed" /> : null}
              </header>

              {run.status === "loading" ? <p>Collecting recent posts…</p> : null}
              {run.status === "error" ? <p role="alert">{run.error}</p> : null}
              {run.status === "success" ? (
                records.length ? (
                  <>
                    {run.source === "fallback" ? <p>Live research timed out. Showing editable sample findings.</p> : null}
                    <strong className="research-result-count">{records.length} results</strong>
                    <ul>
                      {records.slice(0, 4).map((record, index) => (
                        <li key={index}>{recordText(record)}</li>
                      ))}
                    </ul>
                  </>
                ) : <p>No recent results found.</p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
