const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "apps.json");
const useRedis = Boolean(process.env.UPSTASH_REDIS_REST_URL);

let redis;
function getRedis() {
  if (!redis) redis = require("@upstash/redis").Redis.fromEnv();
  return redis;
}

async function readApps() {
  if (useRedis) {
    const apps = await getRedis().get("apps");
    return apps || [];
  }
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

async function writeApps(apps) {
  if (useRedis) {
    await getRedis().set("apps", apps);
    return;
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(apps, null, 2));
}

function makeApp(payload) {
  const app = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title: String(payload.title).slice(0, 40),
    type: String(payload.type),
    summary: String(payload.summary || "").slice(0, 80),
    createdAt: new Date().toISOString(),
  };
  if (app.type === "vote") {
    app.options = payload.options || [];
    app.votes = {};
    app.options.forEach((opt) => (app.votes[opt] = 0));
  }
  return app;
}

async function listApps() {
  return readApps();
}

async function addApp(payload) {
  if (!payload.title || !payload.type) {
    throw Object.assign(new Error("title and type are required"), { status: 400 });
  }
  const apps = await readApps();
  const app = makeApp(payload);
  apps.push(app);
  await writeApps(apps);
  return app;
}

async function castVote(id, option) {
  const apps = await readApps();
  const app = apps.find((a) => a.id === id);
  if (!app || app.type !== "vote") {
    throw Object.assign(new Error("vote app not found"), { status: 404 });
  }
  if (!(option in (app.votes || {}))) {
    throw Object.assign(new Error("unknown option"), { status: 400 });
  }
  app.votes[option] += 1;
  await writeApps(apps);
  return app;
}

module.exports = { listApps, addApp, castVote };
