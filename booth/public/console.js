const fTitle = document.getElementById("f-title");
const fType = document.getElementById("f-type");
const fSummary = document.getElementById("f-summary");
const fOptions = document.getElementById("f-options");
const summaryField = document.getElementById("summary-field");
const optionsField = document.getElementById("options-field");
const toast = document.getElementById("toast");

function syncFieldsForType() {
  const isVote = fType.value === "vote";
  optionsField.classList.toggle("hidden", !isVote);
  summaryField.classList.toggle("hidden", isVote);
}

fType.addEventListener("change", syncFieldsForType);
syncFieldsForType();

document.getElementById("btn-submit").addEventListener("click", async () => {
  const title = fTitle.value.trim();
  const type = fType.value;
  if (!title) {
    showToast("제목을 입력해주세요", false);
    return;
  }

  const payload = { title, type };
  if (type === "vote") {
    const options = fOptions.value
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (options.length < 2) {
      showToast("선택지를 2개 이상 입력해주세요", false);
      return;
    }
    payload.options = options;
  } else {
    payload.summary = fSummary.value.trim();
  }

  const res = await fetch("/api/apps", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    showToast("갤러리에 추가됐어요!", true);
    fTitle.value = "";
    fSummary.value = "";
    fOptions.value = "";
  } else {
    showToast("추가에 실패했어요", false);
  }
});

function showToast(text, ok) {
  toast.textContent = text;
  toast.style.color = ok ? "#2bb673" : "#ef6f6f";
  setTimeout(() => (toast.textContent = ""), 2200);
}
