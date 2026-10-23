// A tiny static server for the demo: ./demo at the root, ./dist at /dist. Port 7300 is this package's own (John's port table, 7300 to 7399);
// PORT overrides it, and a worktree or a test server takes 7301 and up. `pnpm dev` builds first.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { backgroundsModule, renderEmbed, renderIndex, renderJudogi } from "./page.mjs";

const root = join(fileURLToPath(import.meta.url), "..", "..");
const port = Number(process.env.PORT ?? 7300);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".json": "application/json", ".webp": "image/webp", ".png": "image/png" };

createServer(async (request, response) => {
  const path = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
  const rel = normalize(path === "/" ? "/index.html" : path).replace(/^([/\\])+/, "");
  const base = rel.startsWith("dist/") ? root : join(root, "demo");
  const file = join(base, rel);
  if (!file.startsWith(root)) { response.writeHead(403).end("no"); return; }
  try {
    const body = rel === "index.html" ? Buffer.from(renderIndex()) : rel === "judogi.html" ? Buffer.from(renderJudogi()) : rel === "embed.html" ? Buffer.from(renderEmbed()) : rel === "family-backgrounds.js" ? Buffer.from(backgroundsModule()) : await readFile(file);
    response.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream", "cache-control": "no-store" }).end(body);
  } catch {
    response.writeHead(404, { "content-type": "text/plain" }).end("not found");
  }
}).listen(port, "127.0.0.1", () => console.log(`Senshu demo on http://127.0.0.1:${port}/`));
