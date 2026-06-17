const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_FILE = path.join(__dirname, "data", "apps.json");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function readApps() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeApps(apps) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(apps, null, 2));
}

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

function handleApi(req, res) {
  if (req.method === "GET" && req.url === "/api/apps") {
    sendJSON(res, 200, readApps());
    return;
  }

  if (req.method === "POST" && req.url === "/api/apps") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      let payload;
      try {
        payload = JSON.parse(body);
      } catch {
        sendJSON(res, 400, { error: "invalid json" });
        return;
      }
      if (!payload.title || !payload.type) {
        sendJSON(res, 400, { error: "title and type are required" });
        return;
      }
      const apps = readApps();
      const newApp = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        title: String(payload.title).slice(0, 40),
        type: String(payload.type),
        summary: String(payload.summary || "").slice(0, 80),
        votes: payload.type === "vote" ? {} : undefined,
        options: payload.type === "vote" ? (payload.options || []) : undefined,
        createdAt: new Date().toISOString(),
      };
      if (newApp.type === "vote") {
        newApp.votes = {};
        (newApp.options || []).forEach((opt) => (newApp.votes[opt] = 0));
      }
      apps.push(newApp);
      writeApps(apps);
      sendJSON(res, 201, newApp);
    });
    return;
  }

  // increment a vote option: POST /api/apps/:id/vote { option }
  const voteMatch = req.url.match(/^\/api\/apps\/([^/]+)\/vote$/);
  if (req.method === "POST" && voteMatch) {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      let payload;
      try {
        payload = JSON.parse(body);
      } catch {
        sendJSON(res, 400, { error: "invalid json" });
        return;
      }
      const apps = readApps();
      const app = apps.find((a) => a.id === voteMatch[1]);
      if (!app || app.type !== "vote") {
        sendJSON(res, 404, { error: "vote app not found" });
        return;
      }
      if (!(payload.option in (app.votes || {}))) {
        sendJSON(res, 400, { error: "unknown option" });
        return;
      }
      app.votes[payload.option] += 1;
      writeApps(apps);
      sendJSON(res, 200, app);
    });
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
