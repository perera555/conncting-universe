"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

/**
 * A tiny shared store backed by localStorage. Every component that uses the
 * same key sees the same value, so saving a plan in the Planner shows up in
 * My Goals immediately. Safe when storage is blocked (private mode etc.).
 */
const cache = new Map<string, unknown>();
const listeners = new Map<string, Set<() => void>>();

function read<T>(key: string, fallback: T): T {
  if (!cache.has(key)) {
    let v: unknown = fallback;
    try {
      const raw = localStorage.getItem(key);
      if (raw) v = JSON.parse(raw);
    } catch {}
    cache.set(key, v);
  }
  return cache.get(key) as T;
}

function subscribe(key: string, fn: () => void) {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(fn);
  return () => listeners.get(key)!.delete(fn);
}

const noop = () => () => {};

export function useStored<T>(key: string, initial: T) {
  const init = useRef(initial).current;
  const value = useSyncExternalStore(
    useCallback((fn: () => void) => subscribe(key, fn), [key]),
    () => read(key, init),
    () => init,
  );
  const hydrated = useSyncExternalStore(noop, () => true, () => false);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = read(key, init);
      const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      cache.set(key, v);
      try {
        localStorage.setItem(key, JSON.stringify(v));
      } catch {}
      listeners.get(key)?.forEach((fn) => fn());
    },
    [key, init],
  );

  return [value, set, hydrated] as const;
}

export const uid = () => Math.random().toString(36).slice(2, 10);
