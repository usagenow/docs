// Serves the static export like a typical static host: /page → page.html.
// Usage: node scripts/serve.mjs [port]
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const root = path.resolve("out");
const port = Number(process.argv[2] ?? 3000);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".woff2": "font/woff2",
};

function resolve(urlPath) {
  const clean = path.normalize(decodeURIComponent(urlPath.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  const base = path.join(root, clean);
  for (const candidate of [base, `${base}.html`, path.join(base, "index.html")]) {
    if (candidate.startsWith(root) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

http
  .createServer((request, response) => {
    const file = resolve(request.url ?? "/");
    const target = file ?? path.join(root, "404.html");
    response.writeHead(file ? 200 : 404, { "Content-Type": types[path.extname(target)] ?? "application/octet-stream" });
    fs.createReadStream(target).pipe(response);
  })
  .listen(port, () => console.log(`Serving out/ on http://localhost:${port}`));
