"use client";

import { useEffect, useState } from "react";
import type { TocEntry } from "@/lib/docs/content";

/** Distance from the viewport top at which a heading counts as the current one. */
const ACTIVATION_OFFSET = 112;

/** "On this page", highlighting the section being read. */
export function Toc({ entries }: { entries: TocEntry[] }) {
  const [activeId, setActiveId] = useState<string | undefined>(undefined);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current: string | undefined;
      for (const entry of entries) {
        const element = document.getElementById(entry.id);
        if (element && element.getBoundingClientRect().top <= ACTIVATION_OFFSET) current = entry.id;
      }
      // At the very bottom, the last heading may never reach the offset.
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      setActiveId(atBottom ? entries.at(-1)?.id : current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [entries]);

  return (
    <nav aria-labelledby="toc-title" className="toc">
      <h2 id="toc-title" className="toc-title">
        On this page
      </h2>
      <TocList entries={entries} activeId={activeId} />
    </nav>
  );
}

export function TocList({ entries, activeId }: { entries: TocEntry[]; activeId?: string }) {
  return (
    <ul className="toc-list">
      {entries.map((entry) => (
        <li key={entry.id} data-depth={entry.depth}>
          <a
            href={`#${entry.id}`}
            className="toc-link"
            aria-current={entry.id === activeId ? "location" : undefined}
          >
            {entry.title}
          </a>
        </li>
      ))}
    </ul>
  );
}
