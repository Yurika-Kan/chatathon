"use client";

import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { readStoredValue, writeStoredValue } from "@/lib/browser-storage";

export function usePersistedState<T>(
  key: string,
  initialValue: T,
  validate: (value: unknown) => value is T,
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [value, setValue] = useState(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    void readStoredValue(key, validate).then((stored) => {
      if (!active) return;
      if (stored) setValue(stored);
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, [key, validate]);

  useEffect(() => {
    if (!hydrated) return;
    void writeStoredValue(key, value);
  }, [hydrated, key, value]);

  return [value, setValue, hydrated];
}
