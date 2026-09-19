const BASE_URL = "https://api.monid.ai/v1";

function authHeaders(): Record<string, string> {
  const key = process.env.MONOID_KEY;
  if (!key) throw new Error("MONOID_KEY is not set");
  return { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

async function monidFetch<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok && response.status !== 202) {
    throw new Error(`Monid ${path} failed: ${response.status} ${JSON.stringify(data)}`);
  }
  return data as T;
}

export type DiscoverResult = {
  provider: string;
  providerName: string;
  endpoint: string;
  description: string;
  score: number;
};

/** POST /v1/discover — plain-English query -> ranked candidate endpoints. */
export async function discover(query: string, limit = 5): Promise<DiscoverResult[]> {
  const { results } = await monidFetch<{ results: DiscoverResult[] }>("/discover", { query, limit });
  return results;
}

type RunResponse = {
  runId: string;
  status: "COMPLETED" | "RUNNING" | "READY" | "FAILED" | "BLOCKED" | "STOPPED" | "TIMED_OUT";
  output?: unknown;
};

/** POST /v1/run — execute a discovered endpoint. Body must be nested under `input.body`. */
async function run(provider: string, endpoint: string, body: unknown): Promise<RunResponse> {
  return monidFetch<RunResponse>("/run", { provider, endpoint, input: { body } });
}

/** GET /v1/runs/{runId} — poll an async run started by `run`. */
async function pollRun(runId: string): Promise<RunResponse> {
  const response = await fetch(`${BASE_URL}/runs/${runId}`, { headers: authHeaders() });
  return response.json();
}

const TERMINAL = new Set(["COMPLETED", "FAILED", "BLOCKED", "STOPPED", "TIMED_OUT"]);

/**
 * Run an endpoint and wait for a terminal state, whether Monid answered
 * synchronously (200 COMPLETED) or asynchronously (202 RUNNING, needs polling).
 * Image generation on minimax/image_generation runs ~20-25s.
 */
export async function runAndWait(
  provider: string,
  endpoint: string,
  body: unknown,
  { intervalMs = 5000, timeoutMs = 120_000 } = {},
): Promise<RunResponse> {
  let result = await run(provider, endpoint, body);
  const deadline = Date.now() + timeoutMs;

  while (!TERMINAL.has(result.status)) {
    if (Date.now() > deadline) throw new Error(`Monid run ${result.runId} timed out after ${timeoutMs}ms`);
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    result = await pollRun(result.runId);
  }

  if (result.status !== "COMPLETED") {
    throw new Error(`Monid run ${result.runId} ended in ${result.status}`);
  }

  return result;
}

/**
 * Generate one square-ish image from a text prompt via Monid -> MiniMax image-01.
 * Returns a data URL (base64, no expiry — the alternative `url` mode's links
 * expire after 24h, which is a bad fit for anything we might persist).
 */
export async function generateImage(prompt: string, aspectRatio = "1:1"): Promise<string> {
  const result = await runAndWait("minimax", "/v1/image_generation", {
    model: "image-01",
    prompt: prompt.slice(0, 1500), // provider hard limit
    aspect_ratio: aspectRatio,
    response_format: "base64",
    prompt_optimizer: true, // provider-side cleanup; helps most when our prompt is loose
    n: 1,
  });

  const output = result.output as { data?: { image_base64?: string[] } } | undefined;
  const base64 = output?.data?.image_base64?.[0];
  if (!base64) throw new Error(`Monid image_generation returned no image: ${JSON.stringify(result.output)}`);

  return `data:image/jpeg;base64,${base64}`;
}
