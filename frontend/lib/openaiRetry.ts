/**
 * Retry a call against the shared OpenAI-compatible gateway (OPENAI_BASE_URL)
 * on a transient "gateway is at its concurrency limit" response. That gateway
 * is a personal proxy shared across the team with its own concurrency cap —
 * not OpenAI's own rate limiting — so only that specific transient shape is
 * retried; a real 400, auth failure, or anything else fails immediately.
 */
export async function withGatewayRetry<T>(fn: () => Promise<T>, attempts = 4): Promise<T> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const status = (error as { status?: number } | null)?.status;
      const code = (error as { code?: string } | null)?.code;
      const isOverloaded = status === 429 || code === "gateway_overloaded";

      if (!isOverloaded || attempt === attempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 3000));
    }
  }
  throw new Error("unreachable"); // satisfies TS; the loop above always returns or throws
}
