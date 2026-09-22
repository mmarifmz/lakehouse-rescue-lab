const scenarios = {
  normal: {
    records: [
      ["ORD-1041", "Amina Rahman", "Web", 248.00, "valid"],
      ["ORD-1042", "Daniel Lee", "Store", 89.50, "valid"],
      ["ORD-1043", "Siti Nabila", "Marketplace", 420.00, "valid"],
      ["ORD-1044", "Kumar Raj", "Web", 175.20, "valid"],
      ["ORD-1045", "Mei Chen", "Store", 64.90, "valid"]
    ],
    bronze: 5, silver: 5, revenue: 997.60,
    failures: { duplicate: 0, amount: 0, timestamp: 0 },
    note: "All five records passed the declared quality contract. The Gold revenue reconciles to the trusted Silver records."
  },
  duplicates: {
    records: [
      ["ORD-1041", "Amina Rahman", "Web", 248.00, "valid"],
      ["ORD-1042", "Daniel Lee", "Store", 89.50, "valid"],
      ["ORD-1043", "Siti Nabila", "Marketplace", 420.00, "valid"],
      ["ORD-1043", "Siti Nabila", "Marketplace", 420.00, "duplicate"],
      ["ORD-1044", "Kumar Raj", "Web", 175.20, "valid"],
      ["ORD-1045", "Mei Chen", "Store", 64.90, "valid"]
    ],
    bronze: 6, silver: 5, revenue: 997.60,
    failures: { duplicate: 1, amount: 0, timestamp: 0 },
    note: "A replayed ORD-1043 would have overstated revenue by RM420.00. Deterministic deduplication retained the newest source event and protected the Gold KPI."
  },
  invalid: {
    records: [
      ["ORD-1041", "Amina Rahman", "Web", 248.00, "valid"],
      ["ORD-1042", "Daniel Lee", "Store", -89.50, "invalid amount"],
      ["ORD-1043", "Siti Nabila", "Marketplace", 420.00, "valid"],
      ["ORD-1044", "Kumar Raj", "Web", 175.20, "valid"],
      ["ORD-1045", "Mei Chen", "Store", 64.90, "invalid timestamp"]
    ],
    bronze: 5, silver: 3, revenue: 843.20,
    failures: { duplicate: 0, amount: 1, timestamp: 1 },
    note: "Two malformed records were preserved in Bronze and quarantined with explicit reasons. They are excluded from business reporting without being silently discarded."
  },
  late: {
    records: [
      ["ORD-1038", "Farah Aziz", "Web", 315.00, "late accepted"],
      ["ORD-1041", "Amina Rahman", "Web", 248.00, "valid"],
      ["ORD-1042", "Daniel Lee", "Store", 89.50, "valid"],
      ["ORD-1043", "Siti Nabila", "Marketplace", 420.00, "valid"],
      ["ORD-1044", "Kumar Raj", "Web", 175.20, "valid"],
      ["ORD-1045", "Mei Chen", "Store", 64.90, "valid"]
    ],
    bronze: 6, silver: 6, revenue: 1312.60,
    failures: { duplicate: 0, amount: 0, timestamp: 0 },
    note: "A valid prior-day order arrived after the reporting window. The incremental merge accepted it and the affected Gold partition was recomputed without rebuilding unrelated dates."
  }
};

let activePersona = "engineer";
let activeData = null;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const money = value => new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR" }).format(value);

function maskName(name) {
  if (activePersona === "engineer") return name;
  if (activePersona === "auditor") return name.split(" ").map(part => `${part[0]}***`).join(" ");
  return "Restricted";
}

function renderRecords(data) {
  const rows = document.getElementById("recordRows");
  rows.innerHTML = data.records.map(record => {
    const bad = !["valid", "late accepted"].includes(record[4]);
    const visible = activePersona === "analyst" ? !bad : true;
    if (!visible) return "";
    return `<tr class="${bad ? "record-bad" : ""}"><td>${record[0]}</td><td>${maskName(record[1])}</td><td>${record[2]}</td><td>${money(record[3])}</td><td>${record[4]}</td></tr>`;
  }).join("");
  document.getElementById("personaBadge").textContent = `${activePersona[0].toUpperCase()}${activePersona.slice(1)} view`;
  document.getElementById("recordTitle").textContent = activePersona === "analyst" ? "Trusted Silver records" : activePersona === "auditor" ? "Masked audit trail" : "Processed records";
}

function renderQuality(data) {
  const rules = [
    ["Unique order_id", data.failures.duplicate],
    ["amount > 0", data.failures.amount],
    ["Valid event timestamp", data.failures.timestamp],
    ["Required fields present", 0]
  ];
  document.getElementById("qualityRules").innerHTML = rules.map(([label, count]) => `<div class="quality-rule"><span class="rule-icon ${count ? "fail" : ""}">${count ? "!" : "✓"}</span><span>${label}</span><span class="rule-count">${count ? `${count} quarantined` : "passed"}</span></div>`).join("");
  const rejected = Object.values(data.failures).reduce((sum, count) => sum + count, 0);
  const badge = document.getElementById("qualityBadge");
  badge.textContent = rejected ? `${rejected} quarantined` : "All passed";
  badge.className = `badge ${rejected ? "" : "pass"}`;
}

async function runPipeline() {
  const button = document.getElementById("runPipeline");
  const dot = document.querySelector(".status-dot");
  const status = document.getElementById("statusText");
  const meta = document.getElementById("runMeta");
  const layers = [...document.querySelectorAll(".layer-card")];
  activeData = scenarios[document.getElementById("scenario").value];
  button.disabled = true;
  dot.className = "status-dot running";
  layers.forEach(layer => { layer.classList.remove("complete", "processing"); layer.querySelector(".layer-state").textContent = "Waiting"; });
  document.getElementById("bronzeCount").textContent = "-";
  document.getElementById("silverCount").textContent = "-";
  document.getElementById("goldRevenue").textContent = "-";
  for (const [index, layer] of layers.entries()) {
    layer.classList.add("processing");
    layer.querySelector(".layer-state").textContent = "Processing";
    status.textContent = `Processing ${layer.dataset.layer} layer`;
    meta.textContent = index === 0 ? "Capturing raw events and ingestion metadata…" : index === 1 ? "Applying quality contracts and deduplication…" : "Refreshing governed business aggregates…";
    await wait(520);
    layer.classList.remove("processing");
    layer.classList.add("complete");
    layer.querySelector(".layer-state").textContent = "Complete";
    if (index === 0) document.getElementById("bronzeCount").textContent = activeData.bronze;
    if (index === 1) document.getElementById("silverCount").textContent = activeData.silver;
    if (index === 2) document.getElementById("goldRevenue").textContent = money(activeData.revenue);
  }
  renderQuality(activeData);
  renderRecords(activeData);
  document.querySelector("#incidentNote p").textContent = activeData.note;
  status.textContent = "Pipeline completed";
  meta.textContent = `${activeData.bronze} raw records · ${activeData.silver} trusted records · ${new Date().toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}`;
  dot.className = "status-dot success";
  button.disabled = false;
}

document.getElementById("runPipeline").addEventListener("click", runPipeline);
document.querySelectorAll(".persona").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".persona").forEach(item => item.classList.remove("active"));
  button.classList.add("active");
  activePersona = button.dataset.persona;
  if (activeData) renderRecords(activeData);
  else document.getElementById("personaBadge").textContent = `${activePersona[0].toUpperCase()}${activePersona.slice(1)} view`;
}));
