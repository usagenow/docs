// Checks every internal link and #anchor in the static export (`out/`).
// Run after `npm run build`.
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("out");
if (!fs.existsSync(OUT)) {
  console.error("No out/ directory. Run `npm run build` first.");
  process.exit(1);
}

function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "_next" ? [] : htmlFiles(full);
    return entry.name.endsWith(".html") ? [full] : [];
  });
}

/** URL path for an exported HTML file: out/providers/codex.html → /providers/codex */
function routeFor(file) {
  const relative = path.relative(OUT, file).replace(/\\/g, "/").replace(/\.html$/, "");
  if (relative === "index") return "/";
  return `/${relative.replace(/\/index$/, "")}`;
}

function fileFor(route) {
  if (route === "/") return path.join(OUT, "index.html");
  const candidates = [path.join(OUT, `${route}.html`), path.join(OUT, route, "index.html"), path.join(OUT, route)];
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
}

const decode = (value) =>
  value.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"');

const pages = new Map();
for (const file of htmlFiles(OUT)) {
  const html = fs.readFileSync(file, "utf8");
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => decode(match[1])));
  const hrefs = [...html.matchAll(/<a\s[^>]*?href="([^"]+)"/g)].map((match) => decode(match[1]));
  pages.set(routeFor(file), { file, ids, hrefs });
}

const problems = [];
let checked = 0;
for (const [route, page] of pages) {
  if (route === "/404" || route === "/_not-found") continue;
  for (const href of page.hrefs) {
    if (/^(https?:|mailto:)/.test(href)) continue;
    checked += 1;
    const [pathname, hash] = href.split("#");
    const targetRoute = pathname === "" ? route : pathname.replace(/\/$/, "") || "/";
    const targetFile = fileFor(targetRoute);
    if (!targetFile) {
      problems.push(`${route}: broken link ${href}`);
      continue;
    }
    if (hash) {
      const target = pages.get(targetRoute);
      if (!target || !target.ids.has(decodeURIComponent(hash))) problems.push(`${route}: missing anchor ${href}`);
    }
  }
}

if (problems.length) {
  console.error(`✗ ${problems.length} problem(s) in ${checked} internal links:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`✓ ${checked} internal links across ${pages.size} pages are valid.`);
