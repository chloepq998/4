const http = require("http");
const fs = require("fs");
const path = require("path");
const { listApps, addApp, castVote } = require("./lib/store");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function sendJSON(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(body);
}

function serveStatic(req, res) {
  let filePath = req.url === "/" ? "/gallery.html" : req.url;
  filePath = path.join(PUBLIC_DIR, decodeURIComponent(filePath.split("?")[0]));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(content);
  });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("invalid json"));
      }
    });
  });
}

async function handleApi(req, res) {
  if (req.method === "GET" && req.url === "/api/apps") {
    sendJSON(res, 200, await listApps());
    return;
  }

  if (req.method === "POST" && req.url === "/api/apps") {
    let payload;
    try {
      payload = await readBody(req);
    } catch {
      sendJSON(res, 400, { error: "invalid json" });
      return;
    }
    try {
      const app = await addApp(payload);
      sendJSON(res, 201, app);
    } catch (e) {
      sendJSON(res, e.status || 500, { error: e.message });
    }
    return;
  }

  // increment a vote option: POST /api/apps/:id/vote { option }
  const voteMatch = req.url.match(/^\/api\/apps\/([^/]+)\/vote$/);
  if (req.method === "POST" && voteMatch) {
    let payload;
    try {
      payload = await readBody(req);
    } catch {
      sendJSON(res, 400, { error: "invalid json" });
      return;
    }
    try {
      const app = await castVote(voteMatch[1], payload.option);
      sendJSON(res, 200, app);
    } catch (e) {
      sendJSON(res, e.status || 500, { error: e.message });
    }
    return;
  }

  sendJSON(res, 404, { error: "not found" });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith("/api/")) {
    handleApi(req, res);
  } else {
    serveStatic(req, res);
  }
});

server.listen(PORT, () => {
  console.log(`booth server running at http://localhost:${PORT}`);
});
