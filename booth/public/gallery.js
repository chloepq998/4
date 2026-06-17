const POLL_MS = 2500;
const wall = document.getElementById("wall");
const emptyMsg = document.getElementById("empty-msg");
const countEl = document.getElementById("app-count");

let knownIds = new Set();
let renderedOnce = false;

function votedKey(appId) {
  return `booth-voted-${appId}`;
}

function hasVoted(appId) {
  return localStorage.getItem(votedKey(appId)) !== null;
}

function markVoted(appId, option) {
  localStorage.setItem(votedKey(appId), option);
}

function timeAgo(iso) {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 60) return "방금 전";
  const diffMin = Math.floor(diffSec / 60);
  return `${diffMin}분 전`;
}

function renderBody(app) {
  const meta = TYPE_META[app.type] || { label: app.type, icon: "📱" };

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
    return `<div>${app.summary ? `<p style="margin-bottom:8px">${escapeHtml(app.summary)}</p>` : ""}${rows}</div>`;
  }

  return `<p>${escapeHtml(app.summary || "")}</p>`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}

function renderWall(apps) {
  countEl.textContent = apps.length;
  emptyMsg.style.display = apps.length ? "none" : "block";

  wall.querySelectorAll(".phone").forEach((el) => el.remove());

  apps
    .slice()
    .reverse()
    .forEach((app) => {
      const meta = TYPE_META[app.type] || { label: app.type, icon: "📱", color: "#555" };
      const isNew = renderedOnce && !knownIds.has(app.id);

      const phone = document.createElement("div");
      phone.className = "phone" + (isNew ? " is-new" : "");
      phone.style.setProperty("--app-color", meta.color);
      phone.innerHTML = `
        <div class="phone-notch"></div>
        <div class="phone-screen">
          <div class="phone-statusbar"><span>${meta.icon}</span><span>${timeAgo(app.createdAt)}</span></div>
          <div class="phone-app-header">
            <div class="phone-app-icon">${meta.icon}</div>
            <div>
              <div class="phone-app-title">${escapeHtml(app.title)}</div>
              <div class="phone-app-type">${meta.label}</div>
            </div>
          </div>
          <div class="phone-body">${renderBody(app)}</div>
          <div class="phone-footer">이니티움이 만들었어요</div>
          <div class="home-indicator"></div>
        </div>
      `;

      phone.querySelectorAll(".vote-btn").forEach((btn) => {
        btn.addEventListener("click", () => castVote(app.id, btn.dataset.option));
      });

      wall.appendChild(phone);
    });

  knownIds = new Set(apps.map((a) => a.id));
  renderedOnce = true;
}

async function castVote(appId, option) {
  if (hasVoted(appId)) return;
  markVoted(appId, option);
  await fetch(`/api/apps/${appId}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ option }),
  });
  poll();
}

async function poll() {
  try {
    const res = await fetch("/api/apps");
    const apps = await res.json();
    renderWall(apps);
  } catch (e) {
    console.error("poll failed", e);
  }
}

poll();
setInterval(poll, POLL_MS);
