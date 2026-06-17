const POLL_MS = 2500;
const iconGrid = document.getElementById("icon-grid");
const emptyMsg = document.getElementById("empty-msg");
const countLabel = document.getElementById("app-count-label");
const homeScreen = document.getElementById("home-screen");
const appView = document.getElementById("app-view");
const appViewTitle = document.getElementById("app-view-title");
const appViewBody = document.getElementById("app-view-body");
const btnBack = document.getElementById("btn-back");
const statusTime = document.getElementById("status-time");

let knownIds = new Set();
let renderedOnce = false;
let openAppId = null;
let latestApps = [];

function votedKey(appId) {
  return `booth-voted-${appId}`;
}

function hasVoted(appId) {
  return localStorage.getItem(votedKey(appId)) !== null;
}

function markVoted(appId, option) {
  localStorage.setItem(votedKey(appId), option);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}

function renderAppBody(app) {
  if (app.type === "vote" && app.options && app.options.length) {
    const total = Object.values(app.votes || {}).reduce((a, b) => a + b, 0) || 1;
    const voted = hasVoted(app.id);
    const myChoice = localStorage.getItem(votedKey(app.id));
    const rows = app.options
      .map((opt) => {
        const count = (app.votes && app.votes[opt]) || 0;
        const pct = Math.round((count / total) * 100);
        const isMine = myChoice === opt;
        return `
          <div class="vote-option">
            <div class="vote-row">
              <button class="vote-btn" data-option="${escapeAttr(opt)}" ${voted ? "disabled" : ""}>
                ${voted ? (isMine ? "✅ " : "") : ""}${escapeHtml(opt)}
              </button>
              <span class="vote-count">${count}표</span>
            </div>
            <div class="vote-bar-track"><div class="vote-bar-fill" style="width:${pct}%"></div></div>
          </div>`;
      })
      .join("");
    return `<div>${app.summary ? `<p style="margin-bottom:10px">${escapeHtml(app.summary)}</p>` : ""}${rows}</div>`;
  }
  return `<p>${escapeHtml(app.summary || "")}</p>`;
}

function renderIconGrid(apps) {
  iconGrid.innerHTML = "";
  apps.forEach((app) => {
    const meta = TYPE_META[app.type] || { label: app.type, icon: "📱", color: "#555" };
    const isNew = renderedOnce && !knownIds.has(app.id);

    const cell = document.createElement("button");
    cell.className = "app-icon-cell" + (isNew ? " is-installing" : "");
    cell.innerHTML = `
      <div class="app-icon-box" style="background:${meta.color}">${meta.icon}</div>
      <div class="app-icon-label">${escapeHtml(app.title)}</div>
    `;
    cell.addEventListener("click", () => openApp(app.id));
    iconGrid.appendChild(cell);
  });

  knownIds = new Set(apps.map((a) => a.id));
  renderedOnce = true;
}

function openApp(appId) {
  openAppId = appId;
  renderOpenApp();
  homeScreen.classList.add("hidden");
  appView.classList.remove("hidden");
}

function closeApp() {
  openAppId = null;
  homeScreen.classList.remove("hidden");
  appView.classList.add("hidden");
}

function renderOpenApp() {
  const app = latestApps.find((a) => a.id === openAppId);
  if (!app) {
    closeApp();
    return;
  }
  appViewTitle.textContent = app.title;
  appViewBody.innerHTML = renderAppBody(app);
  appViewBody.querySelectorAll(".vote-btn").forEach((btn) => {
    btn.addEventListener("click", () => castVote(app.id, btn.dataset.option));
  });
}

async function castVote(appId, option) {
  if (hasVoted(appId)) return;
  markVoted(appId, option);
  await fetch(`/api/apps/${appId}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ option }),
  });
  await poll();
}

btnBack.addEventListener("click", closeApp);

function updateClock() {
  const now = new Date();
  statusTime.textContent = now.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });
}

async function poll() {
  try {
    const res = await fetch("/api/apps");
    const apps = await res.json();
    latestApps = apps;

    countLabel.textContent = `앱 ${apps.length}개 설치됨`;
    emptyMsg.style.display = apps.length ? "none" : "block";
    iconGrid.style.display = apps.length ? "grid" : "none";

    renderIconGrid(apps);
    if (openAppId) renderOpenApp();
  } catch (e) {
    console.error("poll failed", e);
  }
}

updateClock();
setInterval(updateClock, 30000);
poll();
setInterval(poll, POLL_MS);
