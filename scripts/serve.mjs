// Serves the static export like a typical static host: /page → page.html.
// Usage: node scripts/serve.mjs [port]   (or PORT=3058 node scripts/serve.mjs)
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const root = path.resolve("out");
const port = Number(process.argv[2] ?? process.env.PORT ?? 3000);
const host = process.env.HOST ?? "127.0.0.1";
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".map": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".woff2": "font/woff2",
};

/** Hashed build assets never change; pages are revalidated. */
function cacheControl(urlPath, extension) {
  if (urlPath.startsWith("/_next/static/")) return "public, max-age=31536000, immutable";
  if (extension === ".woff2") return "public, max-age=2592000";
  if (extension === ".html" || extension === ".xml" || extension === ".txt") return "public, max-age=0, must-revalidate";
  return "public, max-age=86400";
}

function resolve(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  if (decoded.includes("\0")) throw new URIError("Invalid path");
  const base = path.resolve(root, `.${decoded}`);
  if (base !== root && !base.startsWith(`${root}${path.sep}`)) return null;
  for (const candidate of [base, `${base}.html`, path.join(base, "index.html")]) {
    if (candidate.startsWith(`${root}${path.sep}`) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

const server = http.createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD", "Cache-Control": "no-store" });
    response.end();
    return;
  }

  const urlPath = (request.url ?? "/").split("?")[0];
  let file;
  try {
    file = resolve(request.url ?? "/");
  } catch (error) {
    if (!(error instanceof URIError)) throw error;
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
    response.end("Bad Request");
    return;
  }

  const target = file ?? path.join(root, "404.html");
  const extension = path.extname(target);
  const headers = {
    "Content-Type": types[extension] ?? "application/octet-stream",
    "Cache-Control": cacheControl(urlPath, extension),
    "X-Content-Type-Options": "nosniff",
  };

  response.writeHead(file ? 200 : 404, headers);
  if (request.method === "HEAD") {
    response.end();
    return;
  }
  const stream = fs.createReadStream(target);
  stream.on("error", () => response.destroy());
  response.on("close", () => stream.destroy());
  stream.pipe(response);
});
server.listen(port, host, () => console.log(`Serving out/ on http://${host}:${server.address().port}`));
