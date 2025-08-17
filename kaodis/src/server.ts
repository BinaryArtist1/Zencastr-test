import "dotenv/config";
import http from "http";
import { Cache } from "./cache.js";

const port = Number(process.env.KAODIS_PORT || 7379);
const dataFile = process.env.KAODIS_FILE || "cache.json";

const cache = new Cache(dataFile);

const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  const readBody = async () => {
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    if (chunks.length === 0) return {};
    try {
      return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      return undefined;
    }
  };

  if (req.method === "POST" && req.url === "/set") {
    const body = await readBody();
    if (
      !body ||
      typeof (body as any).key !== "string" ||
      !(body as any).key.length
    ) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ ok: false, error: "key_required" }));
    }
    cache.set((body as any).key, (body as any).value);
    return res.end(JSON.stringify({ ok: true }));
  }

  if (req.method === "GET" && req.url?.startsWith("/get/")) {
    const key = decodeURIComponent(req.url.split("/")[2] || "");
    const val = cache.get(key);
    if (val === undefined) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ ok: false, error: "not_found" }));
    }
    return res.end(JSON.stringify({ ok: true, value: val }));
  }

  if (req.method === "DELETE" && req.url?.startsWith("/del/")) {
    const key = decodeURIComponent(req.url.split("/")[2] || "");
    const existed = cache.delete(key);
    return res.end(JSON.stringify({ ok: existed }));
  }

  if (req.method === "GET" && req.url === "/keys") {
    return res.end(JSON.stringify({ ok: true, keys: cache.keys() }));
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ ok: false, error: "route_not_found" }));
});

server.listen(port, () => {
  console.log(`Kaodis server running on http://127.0.0.1:${port}`);
  console.log(`Persisting to ${dataFile}`);
});

function shutdown() {
  cache.save();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
