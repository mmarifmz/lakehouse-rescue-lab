const STORAGE_KEY = "lakehouse-rescue-delivery-plan-v1";
const phaseNames = {
  outcome: "Phase 1 · Business outcome",
  sources: "Phase 2 · Source and data readiness",
  lakehouse: "Phase 3 · Lakehouse architecture",
  governance: "Phase 4 · Security and governance",
  operate: "Phase 5 · Delivery and operations"
};

const checkboxes = [...document.querySelectorAll("[data-check-id]")];
const phaseTabs = [...document.querySelectorAll("[data-phase]")];
const phasePanels = [...document.querySelectorAll("[data-phase-panel]")];

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    checkboxes.forEach((box) => { box.checked = saved.includes(box.dataset.checkId); });
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function saveProgress() {
  const checked = checkboxes.filter((box) => box.checked).map((box) => box.dataset.checkId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  } catch {
    // The checklist still works when browser storage is unavailable.
  }
}

function updateProgress() {
  const completed = checkboxes.filter((box) => box.checked).length;
  const percent = Math.round((completed / checkboxes.length) * 100);
  document.querySelector("#progressPercent").textContent = `${percent}%`;
  document.querySelector("#progressCount").textContent = `${completed} of ${checkboxes.length}`;
  document.querySelector("#progressBar").style.width = `${percent}%`;

  phasePanels.forEach((panel) => {
    const items = [...panel.querySelectorAll("[data-check-id]")];
    const done = items.filter((box) => box.checked).length;
    document.querySelector(`[data-progress-for="${panel.dataset.phasePanel}"]`).textContent = `${done} / ${items.length}`;
  });

  const next = checkboxes.find((box) => !box.checked);
  const nextAction = document.querySelector("#nextAction");
  const nextPhase = document.querySelector("#nextActionPhase");
  if (!next) {
    nextAction.textContent = "Readiness checklist complete";
    nextPhase.textContent = "Confirm evidence, owners and delivery approval";
    return;
  }
  nextAction.textContent = next.closest("label").querySelector("strong").textContent;
  const phase = next.closest("[data-phase-panel]").dataset.phasePanel;
  nextPhase.textContent = phaseNames[phase];
}

checkboxes.forEach((box) => {
  box.addEventListener("change", () => {
    saveProgress();
    updateProgress();
  });
});

phaseTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    phaseTabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    phasePanels.forEach((panel) => {
      panel.hidden = tab.dataset.phase !== "all" && panel.dataset.phasePanel !== tab.dataset.phase;
    });
  });
});

document.querySelector("#resetPlan").addEventListener("click", () => {
  if (!window.confirm("Reset all 25 checklist decisions on this browser?")) return;
  checkboxes.forEach((box) => { box.checked = false; });
  localStorage.removeItem(STORAGE_KEY);
  updateProgress();
});

const useCaseFilters = [...document.querySelectorAll("[data-use-filter]")];
const useCases = [...document.querySelectorAll("[data-use-category]")];
useCaseFilters.forEach((filter) => {
  filter.addEventListener("click", () => {
    useCaseFilters.forEach((item) => {
      const active = item === filter;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    useCases.forEach((card) => {
      const categories = card.dataset.useCategory.split(" ");
      card.hidden = filter.dataset.useFilter !== "all" && !categories.includes(filter.dataset.useFilter);
    });
  });
});

loadProgress();
updateProgress();
