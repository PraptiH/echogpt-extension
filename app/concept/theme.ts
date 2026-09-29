"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import type { Theme } from "./data";
import { DEFAULT_THEME, THEME_KEY } from "./theme-script";

const listeners = new Set<() => void>();
let current: Theme | null = null;

function read(): Theme {
  if (current) return current;
  try {
    const saved = localStorage.getItem(THEME_KEY);
    current = saved === "light" || saved === "dark" ? saved : DEFAULT_THEME;
  } catch {
    current = DEFAULT_THEME;
  }
  return current;
}

function apply(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_KEY) return;
    current = null;
    apply(read());
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function setTheme(theme: Theme) {
  current = theme;
  apply(theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
  listeners.forEach((listener) => listener());
}

export function useTheme(): Theme {
  const theme = useSyncExternalStore(subscribe, read, () => DEFAULT_THEME);
  useLayoutEffect(() => {
    apply(read());
  }, []);
  return theme;
}
