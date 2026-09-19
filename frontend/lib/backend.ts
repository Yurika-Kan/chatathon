export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "https://us-central1-chatathon-2026.cloudfunctions.net/api";

type BackendRequestOptions = {
  timeoutMs?: number;
};

async function backendRequest<T>(
  path: string,
  method: "POST" | "PATCH",
  body: unknown,
  { timeoutMs = 10_000 }: BackendRequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const data = (await response.json()) as T & { error?: string };
    if (!response.ok) {
      throw new Error(data.error || `Request failed (${response.status})`);
    }

    return data;
  } catch (error) {
    if (controller.signal.aborted) throw new Error("The live service timed out.");
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function backendPost<T>(path: string, body: unknown, options?: BackendRequestOptions): Promise<T> {
  return backendRequest(path, "POST", body, options);
}

export function backendPatch<T>(path: string, body: unknown, options?: BackendRequestOptions): Promise<T> {
  return backendRequest(path, "PATCH", body, options);
}
