"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowRightIcon, SearchIcon } from "@/components/ui/icons";
import { excerpt, normalize, search, type SearchRecord } from "@/lib/docs/search";

const OPEN_EVENT = "usagenow:open-search";

const suggestions: { title: string; url: string }[] = [
  { title: "Getting Started", url: "/getting-started" },
  { title: "Claude Code usage limits", url: "/providers/claude-code#experimental-usage-limits" },
  { title: "Reading the menu bar", url: "/menu-bar" },
  { title: "Troubleshooting", url: "/troubleshooting" },
  { title: "Privacy", url: "/privacy" },
];

export function SearchTrigger({ compact = false }: { compact?: boolean }) {
  const open = () => document.dispatchEvent(new Event(OPEN_EVENT));
  if (compact) {
    return (
      <button type="button" className="icon-button" aria-label="Search documentation" onClick={open}>
        <SearchIcon width={18} height={18} />
      </button>
    );
  }
  return (
    <button type="button" className="search-trigger" onClick={open} aria-keyshortcuts="Meta+K Control+K">
      <SearchIcon width={15} height={15} />
      <span>Search docs</span>
      <kbd>⌘K</kbd>
    </button>
  );
}

let indexPromise: Promise<SearchRecord[]> | undefined;

function loadIndex(): Promise<SearchRecord[]> {
  indexPromise ??= fetch("/search-index.json")
    .then((response) => (response.ok ? (response.json() as Promise<SearchRecord[]>) : []))
    .catch(() => {
      indexPromise = undefined;
      return [];
    });
  return indexPromise;
}

function Highlight({ text, query }: { text: string; query: string }): ReactNode {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return text;
  // `normalize` preserves length, so indexes in `lower` map onto `text`.
  const lower = normalize(text);
  const parts: ReactNode[] = [];
  let cursor = 0;
  while (cursor < text.length) {
    let next = -1;
    let length = 0;
    for (const term of terms) {
      const index = lower.indexOf(term, cursor);
      if (index !== -1 && (next === -1 || index < next)) {
        next = index;
        length = term.length;
      }
    }
    if (next === -1) {
      parts.push(text.slice(cursor));
      break;
    }
    if (next > cursor) parts.push(text.slice(cursor, next));
    parts.push(<mark key={next}>{text.slice(next, next + length)}</mark>);
    cursor = next + length;
  }
  return parts;
}

export function SearchDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const router = useRouter();
  const listId = useId();
  const [records, setRecords] = useState<SearchRecord[] | null>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const open = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    inputRef.current?.select();
    loadIndex().then(setRecords);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialogRef.current?.open) dialogRef.current.close();
        else open();
      }
    };
    document.addEventListener(OPEN_EVENT, open);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener(OPEN_EVENT, open);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const results = useMemo(() => (records ? search(records, query) : []), [records, query]);
  const items = query.trim()
    ? results.map((result) => ({ key: result.url, url: result.url }))
    : suggestions.map((suggestion) => ({ key: suggestion.url, url: suggestion.url }));
  const activeIndex = Math.min(active, Math.max(items.length - 1, 0));

  function go(url: string) {
    dialogRef.current?.close();
    router.push(url);
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (items.length === 0) return;
      const next = (activeIndex + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      setActive(next);
      listRef.current?.querySelector(`[data-index="${next}"]`)?.scrollIntoView({ block: "nearest" });
    } else if (event.key === "Enter") {
      const item = items[activeIndex];
      if (item) {
        event.preventDefault();
        go(item.url);
      }
    }
  }

  const optionId = (index: number) => `${listId}-option-${index}`;

  return (
    <dialog
      ref={dialogRef}
      className="search-dialog"
      aria-label="Search documentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      <div className="search-panel">
        <div className="search-field">
          <SearchIcon width={17} height={17} />
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded={items.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={items.length ? optionId(activeIndex) : undefined}
            aria-label="Search documentation"
            placeholder="Search documentation"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKeyDown}
          />
          <button type="button" className="search-esc" onClick={() => dialogRef.current?.close()}>
            Esc
          </button>
        </div>

        <div className="search-body">
          {!query.trim() && <p className="search-caption">Suggested</p>}
          {query.trim() && records && results.length === 0 && (
            <p className="search-empty">
              No results for “<span>{query.trim()}</span>”
            </p>
          )}
          {query.trim() && !records && <p className="search-empty">Loading…</p>}

          <ul id={listId} ref={listRef} role="listbox" aria-label="Results" className="search-results">
            {query.trim()
              ? results.map((result, index) => (
                  <li
                    key={result.url}
                    id={optionId(index)}
                    role="option"
                    aria-selected={index === activeIndex}
                    data-index={index}
                    className="search-result"
                    onMouseMove={() => setActive(index)}
                    onClick={() => go(result.url)}
                  >
                    <span className="search-result-path">
                      {result.group} <span aria-hidden="true">›</span> {result.page}
                    </span>
                    <span className="search-result-title">
                      <Highlight text={result.heading ?? result.page} query={query} />
                    </span>
                    {result.text && (
                      <span className="search-result-text">
                        <Highlight text={excerpt(result.text, query)} query={query} />
                      </span>
                    )}
                  </li>
                ))
              : suggestions.map((suggestion, index) => (
                  <li
                    key={suggestion.url}
                    id={optionId(index)}
                    role="option"
                    aria-selected={index === activeIndex}
                    data-index={index}
                    className="search-result search-suggestion"
                    onMouseMove={() => setActive(index)}
                    onClick={() => go(suggestion.url)}
                  >
                    <span className="search-result-title">{suggestion.title}</span>
                    <ArrowRightIcon width={14} height={14} />
                  </li>
                ))}
          </ul>
        </div>

        <div className="search-footer" aria-hidden="true">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> to navigate
          </span>
          <span>
            <kbd>↵</kbd> to open
          </span>
          <span>
            <kbd>esc</kbd> to close
          </span>
        </div>
      </div>
    </dialog>
  );
}
