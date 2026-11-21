import { formatGroupsAsText } from "./formatter.js";
import { createDifferentGroups } from "./grouping.js";
import { parseRoster } from "./roster.js";
import { GROUP_MODES, validateGrouping } from "./validation.js";

const form = document.querySelector("#grouping-form");
const rosterInput = document.querySelector("#student-roster");
const studentCount = document.querySelector("#student-count");
const modeInputs = [...document.querySelectorAll('input[name="groupMode"]')];
const groupNumber = document.querySelector("#group-number");
const groupNumberLabel = document.querySelector("#group-number-label");
const groupNumberHelp = document.querySelector("#group-number-help");
const errorMessage = document.querySelector("#error-message");
const resultSection = document.querySelector("#result-section");
const resultSummary = document.querySelector("#result-summary");
const groupsContainer = document.querySelector("#groups-container");
const statusMessage = document.querySelector("#status-message");
const copyFallback = document.querySelector("#copy-fallback");
const copyText = document.querySelector("#copy-text");
const reshuffleButton = document.querySelector("#reshuffle-button");
const copyButton = document.querySelector("#copy-button");
const printButton = document.querySelector("#print-button");
const resetButton = document.querySelector("#reset-button");

let students = [];
let groups = [];
let currentGroupCount = 0;

function getMode() {
  return modeInputs.find((input) => input.checked).value;
}

function clearFeedback() {
  errorMessage.hidden = true;
  errorMessage.textContent = "";
  statusMessage.hidden = true;
  statusMessage.textContent = "";
  rosterInput.removeAttribute("aria-invalid");
  groupNumber.removeAttribute("aria-invalid");
  copyFallback.hidden = true;
}

function showError(message, field = rosterInput) {
  clearFeedback();
  errorMessage.textContent = message;
  errorMessage.hidden = false;
  field.setAttribute("aria-invalid", "true");
  field.focus();
}

function showStatus(message) {
  statusMessage.textContent = message;
  statusMessage.hidden = false;
}

function updateStudentCount() {
  const count = parseRoster(rosterInput.value).length;
  studentCount.textContent = `${count}명`;
}

function updateMode() {
  const isCountMode = getMode() === GROUP_MODES.COUNT;
  groupNumberLabel.textContent = isCountMode ? "조 개수" : "한 조당 인원";
  groupNumberHelp.textContent = isCountMode
    ? "학생 수보다 작거나 같아야 합니다."
    : "조별 인원을 기준으로 균등하게 나눕니다.";
  groupNumber.value = isCountMode ? "4" : "4";
  clearFeedback();
}

function createGroupCard(group) {
  const article = document.createElement("article");
  article.className = "group-card";

  const heading = document.createElement("div");
  heading.className = "group-card__heading";

  const title = document.createElement("h3");
  title.textContent = group.title;

  const count = document.createElement("span");
  count.className = "group-card__count";
  count.textContent = `${group.members.length}명`;

  const list = document.createElement("ol");

  for (const member of group.members) {
    const item = document.createElement("li");
    item.textContent = member;
    list.append(item);
  }

  heading.append(title, count);
  article.append(heading, list);
  return article;
}

function renderGroups() {
  groupsContainer.replaceChildren(...groups.map(createGroupCard));
  resultSummary.textContent = `총 ${students.length}명을 ${groups.length}개 조로 구성했습니다.`;
  resultSection.hidden = false;
}

function runGrouping({ reshuffle = false } = {}) {
  clearFeedback();
  const nextStudents = parseRoster(rosterInput.value);
  const validation = validateGrouping(
    nextStudents,
    getMode(),
    groupNumber.value,
  );

  if (validation.error) {
    const invalidField =
      nextStudents.length === 0 ? rosterInput : groupNumber;
    showError(validation.error, invalidField);
    return;
  }

  students = nextStudents;
  currentGroupCount = validation.groupCount;

  try {
    groups = createDifferentGroups(
      students,
      currentGroupCount,
      reshuffle ? groups : null,
    );
    renderGroups();
    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    showError(`조를 구성하지 못했습니다: ${error.message}`);
  }
}

async function copyResults() {
  const text = formatGroupsAsText(groups);
  copyFallback.hidden = true;

  try {
    await navigator.clipboard.writeText(text);
    showStatus("조 결과를 클립보드에 복사했습니다.");
  } catch (clipboardError) {
    const temporaryTextArea = document.createElement("textarea");
    temporaryTextArea.value = text;
    temporaryTextArea.setAttribute("readonly", "");
    temporaryTextArea.style.position = "fixed";
    temporaryTextArea.style.opacity = "0";
    document.body.append(temporaryTextArea);
    temporaryTextArea.select();

    const copied = document.execCommand?.("copy") ?? false;
    temporaryTextArea.remove();

    if (copied) {
      showStatus("조 결과를 클립보드에 복사했습니다.");
      return;
    }

    copyText.value = text;
    copyFallback.hidden = false;
    copyText.focus();
    copyText.select();
    showStatus(
      `브라우저 권한 때문에 자동 복사하지 못했습니다. (${clipboardError.message}) 아래 텍스트를 직접 복사해주세요.`,
    );
  }
}

function resetApplication() {
  const hasContent = rosterInput.value.trim() || groups.length > 0;

  if (hasContent && !window.confirm("입력한 명단과 조 결과를 모두 지울까요?")) {
    return;
  }

  form.reset();
  students = [];
  groups = [];
  currentGroupCount = 0;
  groupsContainer.replaceChildren();
  resultSection.hidden = true;
  copyFallback.hidden = true;
  clearFeedback();
  updateStudentCount();
  updateMode();
  rosterInput.focus();
}

rosterInput.addEventListener("input", () => {
  updateStudentCount();
  clearFeedback();
});

for (const input of modeInputs) {
  input.addEventListener("change", updateMode);
}

groupNumber.addEventListener("input", clearFeedback);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  runGrouping();
});

reshuffleButton.addEventListener("click", () => {
  runGrouping({ reshuffle: true });
});

copyButton.addEventListener("click", copyResults);
printButton.addEventListener("click", () => window.print());
resetButton.addEventListener("click", resetApplication);

updateStudentCount();
