import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import http from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const script = fileURLToPath(new URL("./serve.mjs", import.meta.url));

test("static server", { timeout: 15000 }, async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), "usagenow-server-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const files = {
    "out/index.html": "Home",
    "out/guide.html": "Guide",
    "out/café.html": "Unicode page",
    "out/404.html": "Not found",
    "out/_next/static/test.js": "console.log('asset')",
    "out/image.webp": "image",
    "out-private/secret.txt": "Must stay private",
    "out.html": "Must stay private",

  };
  for (const [name, content] of Object.entries(files)) {
    const destination = path.join(directory, name);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, content);
  }
  const child = spawn(process.execPath, [script], {
    cwd: directory,
    env: { ...process.env, HOST: "127.0.0.1", PORT: "0" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) {
      const exited = once(child, "exit");
      child.kill();
      await exited;
    }
  });
  let errors = "";
  child.stderr.on("data", (data) => { errors += data; });
  const port = await new Promise((resolve, reject) => {
    let output = "";
    child.once("error", reject);
    child.once("exit", (code) => reject(new Error(`Server exited ${code}: ${errors}`)));
    child.stdout.on("data", (data) => {
      output += data;
      const match = /http:\/\/127\.0\.0\.1:(\d+)/.exec(output);
      if (match) resolve(Number(match[1]));
    });
  });
  function request(urlPath, method = "GET") {
    return new Promise((resolve, reject) => {
      const req = http.request({ host: "127.0.0.1", port, path: urlPath, method }, (response) => {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => { body += chunk; });
        response.on("error", reject);
        response.on("end", () => resolve({ status: response.statusCode, headers: response.headers, body }));
      });
      req.on("error", reject);
      req.end();
    });
  }

  await t.test("serves clean URLs, queries, and encoded Unicode names", async () => {
    for (const [urlPath, body] of [["/", "Home"], ["/guide?lang=en", "Guide"], ["/caf%C3%A9", "Unicode page"]]) {
      const response = await request(urlPath);
      assert.equal(response.status, 200);
      assert.equal(response.body, body);
      assert.equal(response.headers["cache-control"], "public, max-age=0, must-revalidate");
    }
  });

  await t.test("rejects malformed URLs without stopping the server", async () => {
    for (const urlPath of ["/%", "/%FF", "/%00"]) {
      const response = await request(urlPath);
      assert.equal(response.status, 400);
      assert.equal(response.headers["cache-control"], "no-store");
      assert.equal((await request("/")).body, "Home");
    }
  });

  await t.test("keeps encoded parent paths inside the export boundary", async () => {
    for (const urlPath of ["/..%2fout-private/secret.txt", "/%2e%2e/out-private/secret.txt", "/missing"]) {
      const response = await request(urlPath);
      assert.equal(response.status, 404);
      assert.equal(response.body, "Not found");
    }
  });

  await t.test("supports HEAD and rejects unsupported methods", async () => {
    const head = await request("/guide", "HEAD");
    assert.equal(head.status, 200);
    assert.equal(head.body, "");
    assert.equal(head.headers["content-type"], "text/html; charset=utf-8");
    const post = await request("/guide", "POST");
    assert.equal(post.status, 405);
    assert.equal(post.headers.allow, "GET, HEAD");
  });

  await t.test("caches hashed assets and identifies image types", async () => {
    const asset = await request("/_next/static/test.js");
    assert.equal(asset.status, 200);
    assert.equal(asset.headers["cache-control"], "public, max-age=31536000, immutable");
    assert.equal(asset.headers["x-content-type-options"], "nosniff");
    const image = await request("/image.webp");
    assert.equal(image.status, 200);
    assert.equal(image.headers["content-type"], "image/webp");
  });

});
