// 우리 반, 너의 선택은? — 학교 속 방관자 효과를 다루는 인터랙티브 게임

const SCENARIOS = [
  {
    place: "미술 시간",
    emoji: "🎨",
    text: "친구가 그린 그림을 보고 몇몇 아이들이 “와 진짜 못 그렸다 ㅋㅋ” 하며 낄낄거립니다. 그 친구는 고개를 푹 숙입니다.",
    choices: [
      { text: "“야, 그만해. 나는 멋있는데?” 바로 말한다", score: 3,
        feedback: "친구가 고개를 들고 작게 웃어요. 교실이 잠깐 조용해졌어요." },
      { text: "쉬는 시간에 따로 가서 “아까 멋있었어” 라고 말해준다", score: 2,
        feedback: "조용하지만 분명한 위로가 되었어요." },
      { text: "내 그림에 집중하며 못 본 척한다", score: 0,
        feedback: "아무 일도 일어나지 않았어요. 그 친구는 계속 혼자 그림을 그렸어요." },
    ],
  },
  {
    place: "단체 채팅방",
    emoji: "💬",
    text: "반 친구들 여럿이 한 친구를 몰래 채팅방에서 빼고, 그 친구 이야기를 험담하는 새 채팅방을 만들었다는 걸 알게 되었습니다.",
    choices: [
      { text: "그 채팅방에서 나가고, 직접 그 친구에게 안부를 묻는다", score: 3,
        feedback: "용기를 낸 한마디가 그 친구에게는 큰 위로가 되었어요." },
      { text: "채팅방엔 있지만 험담에는 동참하지 않고 화제를 돌린다", score: 2,
        feedback: "적극적이진 않았지만, 분위기를 조금 바꿔놨어요." },
      { text: "“다들 그러니까” 하며 그냥 읽기만 한다", score: -1,
        feedback: "침묵도 결국 동의로 비칠 수 있어요." },
    ],
  },
  {
    place: "체육 시간",
    emoji: "⚽",
    text: "팀을 정할 때마다 같은 친구가 매번 마지막까지 선택받지 못하고 머뭇거리며 서 있습니다.",
    choices: [
      { text: "“내가 데려갈래!” 하고 먼저 부른다", score: 3,
        feedback: "그 친구의 표정이 환해졌어요." },
      { text: "선생님께 팀을 무작위로 정하면 어떨지 조용히 제안한다", score: 2,
        feedback: "다음부턴 모두가 더 편해졌어요." },
      { text: "내 팀이 아니라서 다행이라 생각하고 넘어간다", score: 0,
        feedback: "그 친구는 오늘도 가장 늦게 이름이 불렸어요." },
    ],
  },
  {
    place: "발표 시간",
    emoji: "🎤",
    text: "한 친구가 떨리는 목소리로 발표하는데, 몇몇이 소리를 죽여 비웃습니다. 선생님은 보지 못하셨습니다.",
    choices: [
      { text: "발표가 끝나자 크게 박수치며 “잘했어!” 외친다", score: 3,
        feedback: "박수 소리에 비웃음이 묻혔고, 친구는 안도한 표정을 지었어요." },
      { text: "옆 친구에게 작게 “비웃지 마” 라고 말한다", score: 2,
        feedback: "조용히 비웃음이 잦아들었어요." },
      { text: "분위기에 휩쓸려 같이 웃는다", score: -2,
        feedback: "발표하던 친구의 목소리가 더 떨리기 시작했어요." },
    ],
  },
  {
    place: "급식 시간",
    emoji: "🍱",
    text: "한 친구가 구석 자리에서 혼자 밥을 먹고 있습니다.",
    choices: [
      { text: "“여기 앉아도 돼?” 하며 같이 앉는다", score: 3,
        feedback: "어색했던 첫 한마디가 새로운 친구를 만들었어요." },
      { text: "다음에 같이 먹자고 나중에 메시지를 보낸다", score: 1,
        feedback: "마음은 전해졌지만, 오늘의 점심은 여전히 혼자였어요." },
      { text: "못 본 척 내 친구들과 함께 앉는다", score: 0,
        feedback: "그 친구는 오늘도 혼자 식사를 마쳤어요." },
    ],
  },
  {
    place: "쉬는 시간",
    emoji: "🗣️",
    text: "친구 A에 대한 사실이 아닌 안 좋은 소문이 반에 퍼지고 있다는 걸 알게 되었습니다.",
    choices: [
      { text: "소문을 들은 사람들에게 “그거 사실 아니래” 라고 정정해준다", score: 3,
        feedback: "소문이 더 퍼지기 전에 멈췄어요." },
      { text: "A에게 직접 “소문 들었는데, 나는 안 믿어” 라고 말해준다", score: 2,
        feedback: "A는 혼자가 아니라는 걸 느꼈어요." },
      { text: "나와 상관없는 일이라 생각하고 넘어간다", score: 0,
        feedback: "소문은 다음 날 더 커져 있었어요." },
    ],
  },
];

const TIME_LIMIT = 8;
const MAX_SCORE = SCENARIOS.reduce((sum, s) => sum + Math.max(...s.choices.map(c => c.score)), 0);

const RESULTS = [
  {
    min: 13,
    emoji: "🦸",
    title: "교실의 작은 영웅",
    desc: "당신은 망설임보다 행동이 빠른 사람이에요. 작은 순간마다 누군가에게 “나는 네 편이야” 라는 신호를 보냈어요.",
    insight: "방관자 효과 연구에 따르면, 주변에 있던 또래가 한 명이라도 적극적으로 개입하면 괴롭힘 행동이 훨씬 빠르게 멈추는 경향이 있다고 해요. 당신 같은 한 사람이 분위기를 바꿉니다.",
    tip: "오늘 교실에서 본 작은 용기를, 옆 친구에게도 알려주세요. 용기는 전염됩니다.",
  },
  {
    min: 8,
    emoji: "🌤️",
    title: "용기있는 친구",
    desc: "완벽하진 않았지만, 중요한 순간엔 한 발 나아갔어요. 그 한 걸음이 누군가에겐 충분히 큰 의미였을 거예요.",
    insight: "직접 나서는 것이 어렵게 느껴질 때, 당사자에게 따로 다가가 마음을 전하는 것도 효과적인 개입 방법 중 하나예요.",
    tip: "다음번엔 그 자리에서 한마디만 더 보태보는 건 어떨까요? “그만해” 한마디로도 충분해요.",
  },
  {
    min: 3,
    emoji: "🌱",
    title: "조용한 변화의 시작",
    desc: "아직은 망설이는 순간이 많았어요. 그래도 괜찮아요 — 용기는 연습할수록 자라나는 마음이에요.",
    insight: "많은 사람이 ‘나서고 싶지만 어떻게 해야 할지 몰라서’ 가만히 있는 경우가 많다고 해요. 방법을 아는 것만으로도 행동은 달라질 수 있어요.",
    tip: "처음부터 크게 나서지 않아도 돼요. 당사자에게 “괜찮아?” 한마디를 건네는 것부터 시작해보세요.",
  },
  {
    min: -100,
    emoji: "🌧️",
    title: "다시 생각해볼 시간",
    desc: "오늘은 분위기에 휩쓸리는 선택이 많았어요. 누구에게나 그런 순간이 있어요 — 중요한 건 다음에 어떻게 하느냐예요.",
    insight: "분위기에 휩쓸려 동조하는 행동은 무심코 나오기 쉬워요. 하지만 그 순간을 알아차리는 것만으로도 다음 선택은 달라질 수 있어요.",
    tip: "다음에 비슷한 상황을 보면, 그 자리에서 아무 말도 하지 않더라도 나중에 당사자에게 “괜찮아?” 라고 물어봐 주세요.",
  },
];

const state = {
  index: 0,
  score: 0,
  timer: null,
  timeLeft: TIME_LIMIT,
};

const els = {};

function cacheEls() {
  els.screens = document.querySelectorAll(".screen");
  els.btnStart = document.getElementById("btn-start");
  els.btnReplay = document.getElementById("btn-replay");
  els.btnDiscuss = document.getElementById("btn-discuss");
  els.btnBackStart = document.getElementById("btn-back-start");

  els.progressLabel = document.getElementById("progress-label");
  els.progressFill = document.getElementById("progress-fill");
  els.gaugeFill = document.getElementById("gauge-fill");
  els.timerArc = document.getElementById("timer-arc");
  els.timerNum = document.getElementById("timer-num");

  els.scenarioEmoji = document.getElementById("scenario-emoji");
  els.scenarioPlace = document.getElementById("scenario-place");
  els.scenarioText = document.getElementById("scenario-text");
  els.choices = document.getElementById("choices");
  els.feedbackToast = document.getElementById("feedback-toast");

  els.resultEmoji = document.getElementById("result-emoji");
  els.resultTitle = document.getElementById("result-title");
  els.resultGaugeFill = document.getElementById("result-gauge-fill");
  els.resultScore = document.getElementById("result-score");
  els.resultDesc = document.getElementById("result-desc");
  els.resultInsight = document.getElementById("result-insight");
  els.resultTip = document.getElementById("result-tip");
}

function showScreen(id) {
  els.screens.forEach((s) => s.classList.toggle("active", s.id === id));
}

function clampGauge(score) {
  const pct = Math.max(0, Math.min(100, (score / MAX_SCORE) * 100));
  return pct;
}

function startGame() {
  state.index = 0;
  state.score = 0;
  showScreen("screen-game");
  renderScenario();
}

function renderScenario() {
  const scenario = SCENARIOS[state.index];
  els.progressLabel.textContent = `${state.index + 1} / ${SCENARIOS.length}`;
  els.progressFill.style.width = `${(state.index / SCENARIOS.length) * 100}%`;
  els.gaugeFill.style.width = `${clampGauge(state.score)}%`;

  els.scenarioEmoji.textContent = scenario.emoji;
  els.scenarioPlace.textContent = scenario.place;
  els.scenarioText.textContent = scenario.text;

  els.choices.innerHTML = "";
  scenario.choices.forEach((choice, i) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = choice.text;
    btn.addEventListener("click", () => selectChoice(i));
    els.choices.appendChild(btn);
  });

  startTimer();
}

function startTimer() {
  state.timeLeft = TIME_LIMIT;
  updateTimerUI();
  clearInterval(state.timer);
  state.timer = setInterval(() => {
    state.timeLeft -= 1;
    updateTimerUI();
    if (state.timeLeft <= 0) {
      clearInterval(state.timer);
      autoSelectOnTimeout();
    }
  }, 1000);
}

function updateTimerUI() {
  const circumference = 100.5;
  const ratio = state.timeLeft / TIME_LIMIT;
  els.timerArc.style.strokeDashoffset = `${circumference * (1 - ratio)}`;
  els.timerArc.style.stroke = ratio < 0.3 ? "var(--danger)" : "var(--accent)";
  els.timerNum.textContent = Math.max(0, state.timeLeft);
}

function disableChoices() {
  els.choices.querySelectorAll("button").forEach((b) => (b.disabled = true));
}

function autoSelectOnTimeout() {
  disableChoices();
  const scenario = SCENARIOS[state.index];
  const lowestIndex = scenario.choices.reduce(
    (lowestIdx, c, i, arr) => (c.score < arr[lowestIdx].score ? i : lowestIdx),
    0
  );
  applyChoice(scenario.choices[lowestIndex], "시간이 지나버렸어요. 망설이는 사이, 상황은 그냥 흘러갔어요.");
}

function selectChoice(i) {
  clearInterval(state.timer);
  disableChoices();
  const scenario = SCENARIOS[state.index];
  applyChoice(scenario.choices[i], scenario.choices[i].feedback);
}

function applyChoice(choice, feedbackText) {
  state.score += choice.score;
  showToast(feedbackText);
  setTimeout(() => {
    state.index += 1;
    if (state.index >= SCENARIOS.length) {
      showResult();
    } else {
      renderScenario();
    }
  }, 1600);
}

function showToast(text) {
  els.feedbackToast.textContent = text;
  els.feedbackToast.classList.add("show");
  setTimeout(() => els.feedbackToast.classList.remove("show"), 1400);
}

function showResult() {
  els.progressFill.style.width = "100%";
  const result = RESULTS.find((r) => state.score >= r.min);

  els.resultEmoji.textContent = result.emoji;
  els.resultTitle.textContent = result.title;
  els.resultDesc.textContent = result.desc;
  els.resultInsight.textContent = result.insight;
  els.resultTip.textContent = result.tip;
  els.resultScore.textContent = `용기 점수 ${state.score} / ${MAX_SCORE}`;
  els.resultGaugeFill.style.width = `${clampGauge(state.score)}%`;

  showScreen("screen-result");
}

function init() {
  cacheEls();
  els.btnStart.addEventListener("click", startGame);
  els.btnReplay.addEventListener("click", startGame);
  els.btnDiscuss.addEventListener("click", () => showScreen("screen-discuss"));
  els.btnBackStart.addEventListener("click", () => showScreen("screen-start"));
  showScreen("screen-start");
}

document.addEventListener("DOMContentLoaded", init);
