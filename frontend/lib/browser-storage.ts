const memoryFallback = new Map<string, string>();

type StorageEnvelope<T> = {
  schemaVersion: 1;
  updatedAt: string;
  value: T;
};

function getLocalStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export async function readStoredValue<T>(
  key: string,
  validate: (value: unknown) => value is T,
): Promise<T | null> {
  const storage = getLocalStorage();
  let raw: string | null = null;

  try {
    raw = storage?.getItem(key) ?? memoryFallback.get(key) ?? null;
  } catch {
    raw = memoryFallback.get(key) ?? null;
  }

  if (!raw) return null;

  try {
    const envelope = JSON.parse(raw) as Partial<StorageEnvelope<unknown>>;
    if (envelope.schemaVersion !== 1 || !validate(envelope.value)) throw new Error("Invalid cache record");
    return envelope.value;
  } catch {
    memoryFallback.delete(key);
    try {
      storage?.removeItem(key);
    } catch {
      // Storage can be unavailable or quota-restricted. The UI must still work.
    }
    return null;
  }
}

export async function writeStoredValue<T>(key: string, value: T): Promise<boolean> {
  const envelope: StorageEnvelope<T> = {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    value,
  };
  const raw = JSON.stringify(envelope);
  memoryFallback.set(key, raw);

  try {
    const storage = getLocalStorage();
    if (!storage) return false;
    storage.setItem(key, raw);
    return true;
  } catch {
    return false;
  }
}

export async function removeStoredValue(key: string): Promise<void> {
  memoryFallback.delete(key);
  try {
    getLocalStorage()?.removeItem(key);
  } catch {
    // Best-effort cleanup only.
  }
}

export async function readThroughCache<T>(
  key: string,
  validate: (value: unknown) => value is T,
  request: () => Promise<T>,
): Promise<{ value: T; source: "network" | "cache"; stale: boolean }> {
  const cached = await readStoredValue(key, validate);

  try {
    const value = await request();
    if (!validate(value)) throw new Error("Invalid response");
    await writeStoredValue(key, value);
    return { value, source: "network", stale: false };
  } catch (error) {
    if (cached !== null) return { value: cached, source: "cache", stale: true };
    throw error;
  }
}
