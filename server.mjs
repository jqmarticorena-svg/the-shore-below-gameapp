// Minimal static file server for The Shore Below.
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 5181;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".ico":  "image/x-icon",
};

const server = http.createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    if (urlPath === "/") urlPath = "/index.html";
    const filePath = path.normalize(path.join(__dirname, urlPath));
    if (!filePath.startsWith(__dirname)) {
      res.writeHead(403); res.end("forbidden"); return;
    }
    const s = await stat(filePath);
    if (s.isDirectory()) {
      res.writeHead(404); res.end("not found"); return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || "application/octet-stream";
    const body = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": type,
      "Cache-Control": "no-store",
    });
    res.end(body);
  } catch (e) {
    if (e.code === "ENOENT") {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 not found: " + (req.url || ""));
    } else {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("500 " + String(e));
    }
  }
});

server.listen(PORT, () => {
  console.log(`[the-shore-below] http://localhost:${PORT}`);
});
