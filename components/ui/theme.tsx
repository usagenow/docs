"use client";

import { useSyncExternalStore } from "react";
import { MonitorIcon, MoonIcon, SunIcon } from "./icons";

export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "theme";
const listeners = new Set<() => void>();

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function applyPreference(preference: ThemePreference) {
  const dark =
    preference === "dark" ||
    (preference === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.classList.toggle("light", !dark);
  root.style.colorScheme = dark ? "dark" : "light";
}

function setPreference(preference: ThemePreference) {
  try {
    if (preference === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // Storage can be unavailable (private browsing); the choice still applies to this page.
  }
  applyPreference(preference);
  listeners.forEach((listener) => listener());
}

/**
 * Runs before first paint so the page never flashes the wrong theme. It
 * also follows macOS appearance changes while "System" is selected.
 */
export const themeScript = `(function(){try{var m=window.matchMedia("(prefers-color-scheme: dark)");function a(){var s=null;try{s=localStorage.getItem("${STORAGE_KEY}")}catch(e){}var d=s==="dark"||(s!=="light"&&m.matches);var r=document.documentElement;r.classList.toggle("dark",d);r.classList.toggle("light",!d);r.style.colorScheme=d?"dark":"light"}a();m.addEventListener("change",a)}catch(e){}})();`;

const options: { value: ThemePreference; label: string; Icon: typeof SunIcon }[] = [
  { value: "light", label: "Light", Icon: SunIcon },
  { value: "dark", label: "Dark", Icon: MoonIcon },
  { value: "system", label: "System", Icon: MonitorIcon },
];

/** Light / Dark / System as a compact radio group. */
export function ThemeToggle({ showLabels = false }: { showLabels?: boolean }) {
  // Unknown on the server; the radios render unselected until hydration.
  const preference = useSyncExternalStore<ThemePreference | null>(subscribe, readPreference, () => null);

  return (
    <div role="radiogroup" aria-label="Theme" className="theme-toggle">
      {options.map(({ value, label, Icon }) => {
        const checked = preference === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={showLabels ? undefined : label}
            title={label}
            className="theme-toggle-option"
            onClick={() => setPreference(value)}
            onKeyDown={(event) => {
              const index = options.findIndex((option) => option.value === value);
              const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
              if (!step) return;
              event.preventDefault();
              const next = options[(index + step + options.length) % options.length];
              setPreference(next.value);
              const group = event.currentTarget.parentElement;
              group?.querySelector<HTMLButtonElement>(`[data-value="${next.value}"]`)?.focus();
            }}
            data-value={value}
            tabIndex={checked || (preference === null && value === "system") ? 0 : -1}
          >
            <Icon width={15} height={15} />
            {showLabels && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
