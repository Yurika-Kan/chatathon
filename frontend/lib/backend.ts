export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "https://us-central1-chatathon-2026.cloudfunctions.net/api";

export async function backendPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }

  return data;
}
