/** One searchable section. Shared by the build-time index and the client. */
export type SearchRecord = {
  /** Page URL, with a fragment for sections below the intro. */
  url: string;
  page: string;
  group: string;
  heading?: string;
  text: string;
};

export type SearchResult = SearchRecord & { score: number };

/**
 * Case- and accent-insensitive form of `value` with the same length, so
 * match positions found in it can be used to slice the original text.
 */
export function normalize(value: string): string {
  return Array.from(value, (char) => {
    if (char === "’" || char === "‘") return "'";
    const folded = char.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    return folded.length === char.length ? folded : char;
  }).join("");
}

function occurrences(haystack: string, needle: string): number {
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1 && count < 5) {
    count += 1;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}

/**
 * Every term must appear somewhere in the section. Matches in the page
 * title and section heading weigh far more than matches in body text.
 */
export function search(records: SearchRecord[], query: string, limit = 10): SearchResult[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const results: SearchResult[] = [];
  for (const record of records) {
    const page = normalize(record.page);
    const heading = normalize(record.heading ?? "");
    const text = normalize(record.text);
    let score = 0;
    let matchesAll = true;
    for (const term of terms) {
      let termScore = 0;
      if (page.includes(term)) termScore += page.startsWith(term) ? 14 : 9;
      if (heading.includes(term)) termScore += heading.startsWith(term) ? 8 : 6;
      const inText = occurrences(text, term);
      if (inText) termScore += 1 + inText * 0.4;
      if (termScore === 0) {
        matchesAll = false;
        break;
      }
      score += termScore;
    }
    // Page intros stand in for the page itself when the title matches.
    if (matchesAll) results.push({ ...record, score: score + (record.heading ? 0 : 0.5) });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** A short excerpt around the first match. */
export function excerpt(text: string, query: string, radius = 70): string {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const haystack = normalize(text);
  const first = terms.map((term) => haystack.indexOf(term)).filter((index) => index >= 0).sort((a, b) => a - b)[0];
  if (first === undefined) return text.slice(0, radius * 2) + (text.length > radius * 2 ? "…" : "");
  const start = Math.max(0, first - radius);
  const end = Math.min(text.length, first + radius);
  return (start > 0 ? "…" : "") + text.slice(start, end).trim() + (end < text.length ? "…" : "");
}
