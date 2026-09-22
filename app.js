const money = value => new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR" }).format(value);
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const title = value => `${value[0].toUpperCase()}${value.slice(1)}`;

function scenario(items, bronze, silver, value, failures, note) { return { items, bronze, silver, value, failures, note }; }
function makeCase(config) {
  const [id, person, channel, amount] = config.columns;
  const clean = config.values.map((row, index) => [`${config.prefix}-${101 + index}`, row[0], row[1], row[2], "valid"]);
  const total = clean.reduce((sum, row) => sum + row[3], 0);
  const dup = [...clean.slice(0, 2), [...clean[1].slice(0, 4), "duplicate"], ...clean.slice(2)];
  const invalid = clean.map((row, index) => index === 1 ? [row[0], row[1], row[2], config.invalidValue, "invalid value"] : row);
  const late = [[`${config.prefix}-098`, config.late[0], config.late[1], config.late[2], "late accepted"], ...clean.slice(0, 2)];
  const validInvalid = invalid.filter(row => row[4] === "valid").reduce((sum, row) => sum + row[3], 0);
  const lateTotal = late.reduce((sum, row) => sum + row[3], 0);
  const nouns = config.label.toLowerCase();
  return {
    ...config, columns: [id, person, channel, amount],
    rules: [[`Unique ${id.toLowerCase()}`, "duplicate"], [config.valueRule, "amount"], [config.timeRule, "timestamp"], ["Required fields present", "required"]],
    scenarios: {
      normal: scenario(clean, clean.length, clean.length, total, {}, `The ${nouns} result is ready to use because the incoming records passed the declared checks.`),
      duplicates: scenario(dup, dup.length, clean.length, total, { duplicate: 1 }, `A replayed event is retained as evidence but cannot distort the ${nouns} decision.`),
      invalid: scenario(invalid, invalid.length, clean.length - 1, validInvalid, { amount: 1 }, `An invalid record is quarantined for correction before it reaches the trusted ${nouns} result.`),
      late: scenario(late, late.length, late.length, lateTotal, {}, `A valid late update refreshes the affected ${nouns} result with its arrival trail preserved.`)
    }
  };
}

const useCases = {
  revenue: makeCase({ label: "Revenue and margin", decision: "Should Finance act on today's sales number?", inputs: "Web orders, retail point of sale and marketplace feeds", output: "Daily revenue, channel performance and an exception list", question: "Can we trust today's sales?", sources: "Web, store and marketplace", outcome: "Trusted revenue and exceptions", columns: ["Order", "Customer", "Channel", "Amount"], prefix: "ORD", format: "money", metric: "trusted revenue", values: [["Amina Rahman", "Web", 248], ["Daniel Lee", "Store", 89.5], ["Siti Nabila", "Marketplace", 420]], late: ["Farah Aziz", "Web", 315], invalidValue: -89.5, valueRule: "Amount above zero", timeRule: "Valid event time" }),
  cash: makeCase({ label: "Cash collections", decision: "What cash can Treasury rely on today?", inputs: "Bank statements, payment gateway settlements and customer receipts", output: "Available cash position and unreconciled payments", question: "What cash is truly available?", sources: "Banks, gateway and receivables", outcome: "Reconciled cash position", columns: ["Payment", "Payer", "Source", "Amount"], prefix: "PAY", format: "money", metric: "reconciled cash", values: [["Meridian Retail", "Bank", 12400], ["Northstar Co", "Gateway", 8650], ["Apex Foods", "Bank", 3900]], late: ["City Supplies", "Bank", 5100], invalidValue: -8650, valueRule: "Amount above zero", timeRule: "Settlement time present" }),
  inventory: makeCase({ label: "Inventory availability", decision: "Which customer orders can Operations promise to fulfil?", inputs: "Warehouse scans, supplier confirmations and sales commitments", output: "Available-to-promise stock and replenishment exceptions", question: "Which orders can we fulfil?", sources: "Warehouse, supplier and orders", outcome: "Reliable fulfilment promise", columns: ["SKU", "Location", "Supply source", "Units"], prefix: "SKU", format: "number", metric: "fulfillable units", values: [["Shah Alam", "Warehouse", 320], ["Johor", "Supplier", 180], ["Penang", "Warehouse", 75]], late: ["Penang", "Warehouse", 55], invalidValue: -180, valueRule: "Units cannot be negative", timeRule: "Movement time present" }),
  service: makeCase({ label: "Customer service", decision: "Which customer cases need action before an SLA breach?", inputs: "Contact centre cases, chat transcripts and field-service updates", output: "At-risk cases, service performance and ownership queue", question: "Which cases risk an SLA breach?", sources: "Calls, chat and field service", outcome: "Prioritised service action", columns: ["Case", "Customer", "Channel", "Hours"], prefix: "CASE", format: "hours", metric: "cases within SLA", values: [["Amina Rahman", "Chat", 3], ["Northstar Co", "Phone", 6], ["Siti Nabila", "Email", 2]], late: ["Kumar Raj", "Email", 4], invalidValue: -6, valueRule: "Resolution time valid", timeRule: "Update time present" }),
  risk: makeCase({ label: "Risk and fraud", decision: "Which payments need review before they are released?", inputs: "Payment authorisations, device signals and merchant activity", output: "Review queue, approved value and investigation evidence", question: "Which payments need review?", sources: "Payments, devices and merchants", outcome: "Focused risk review", columns: ["Payment", "Merchant", "Signal", "Amount"], prefix: "TXN", format: "money", metric: "approved payment value", values: [["Meridian Retail", "Known device", 2480], ["Apex Foods", "Verified ID", 920], ["Northstar Co", "Known device", 1450]], late: ["City Supplies", "Verified ID", 760], invalidValue: -920, valueRule: "Amount above zero", timeRule: "Decision time present" }),
  sustainability: makeCase({ label: "ESG and compliance", decision: "Can the business stand behind its sustainability report?", inputs: "Facility meters, utility bills and supplier declarations", output: "Traceable emissions result and evidence gaps to resolve", question: "Can we stand behind the report?", sources: "Facilities, utilities and suppliers", outcome: "Traceable compliance report", columns: ["Record", "Facility", "Source", "tCO2e"], prefix: "ESG", format: "carbon", metric: "reported tCO2e", values: [["Shah Alam", "Meter", 42.5], ["Johor", "Utility bill", 31.2], ["Penang", "Supplier", 18.7]], late: ["Kuala Lumpur", "Meter", 12.6], invalidValue: -31.2, valueRule: "Emission value valid", timeRule: "Reporting time present" })
};

let activePersona = "engineer";
let activeUseCase = "revenue";
let activeData = null;
const layerContent = {
  bronze: ["Capture", "Keep every source event as evidence", "source records received", ["Source metadata", "Ingestion timestamp", "Replayable history"]],
  silver: ["Trust", "Validate facts before they reach a decision", "trusted records", ["Schema enforcement", "Duplicate controls", "Exception quarantine"]],
  gold: ["Decide", "Publish the metric and exception list", "", ["Decision-ready metric", "Exception queue", "Auditable definitions"]]
};
function setText(id, value) { document.getElementById(id).textContent = value; }
function setList(id, values) { document.getElementById(id).innerHTML = values.map(value => `<li>${value}</li>`).join(""); }
function formatValue(value, useCase) { if (useCase.format === "money") return money(value); if (useCase.format === "hours") return `${value} cases`; if (useCase.format === "carbon") return `${value} tCO2e`; return `${value} units`; }
function maskValue(value) { if (activePersona === "engineer") return value; if (activePersona === "auditor") return value.split(" ").map(part => `${part[0]}***`).join(" "); return "Restricted"; }

function updateUseCase() {
  const useCase = useCases[activeUseCase]; activeData = null;
  [["businessDecision", useCase.decision], ["businessInputs", useCase.inputs], ["businessOutput", useCase.output], ["flowQuestion", useCase.label], ["flowQuestionDetail", useCase.question], ["flowSources", useCase.sources], ["flowControls", "Validate, reconcile and quarantine"], ["flowOutcome", useCase.outcome]].forEach(([id, value]) => setText(id, value));
  ["bronze", "silver", "gold"].forEach(layer => { const [name, description, metric, rules] = layerContent[layer]; setText(`${layer}Name`, name); setText(`${layer}Description`, description); setText(`${layer}Metric`, layer === "gold" ? useCase.metric : metric); setList(`${layer}Rules`, rules); setText(layer === "gold" ? "goldRevenue" : `${layer}Count`, "-"); });
  ["columnOne", "columnTwo", "columnThree", "columnFour"].forEach((id, index) => setText(id, useCase.columns[index]));
  document.querySelectorAll(".use-case").forEach(button => { const selected = button.dataset.useCase === activeUseCase; button.classList.toggle("active", selected); button.setAttribute("aria-pressed", String(selected)); });
  document.getElementById("recordRows").innerHTML = '<tr><td colspan="5" class="empty">Run the pipeline to inspect records.</td></tr>'; setText("recordTitle", `${useCase.label} records`); setText("qualityBadge", "Not run"); document.getElementById("qualityBadge").className = "badge"; document.getElementById("qualityRules").innerHTML = ""; setText("statusText", "Ready to process"); setText("runMeta", "Choose an incident, then run the pipeline."); document.querySelector(".status-dot").className = "status-dot"; document.querySelector("#incidentNote p").textContent = `Choose an incident to see how controls protect the ${useCase.label.toLowerCase()} decision.`;
  document.querySelectorAll(".layer-card").forEach(card => { card.classList.remove("complete", "processing"); card.querySelector(".layer-state").textContent = "Waiting"; });
}
function renderRecords(data, useCase) {
  document.getElementById("recordRows").innerHTML = data.items.map(record => { const bad = !["valid", "late accepted"].includes(record[4]); if (activePersona === "analyst" && bad) return ""; return `<tr class="${bad ? "record-bad" : ""}"><td>${record[0]}</td><td>${maskValue(record[1])}</td><td>${record[2]}</td><td>${formatValue(record[3], useCase)}</td><td>${record[4]}</td></tr>`; }).join("") || '<tr><td colspan="5" class="empty">No trusted records are available for this view.</td></tr>';
  setText("personaBadge", `${title(activePersona)} view`); setText("recordTitle", activePersona === "analyst" ? "Trusted records" : activePersona === "auditor" ? "Masked audit trail" : `${useCase.label} records`);
}
function renderQuality(data, useCase) { const rejected = Object.values(data.failures).reduce((sum, count) => sum + count, 0); document.getElementById("qualityRules").innerHTML = useCase.rules.map(([label, key]) => { const count = data.failures[key] || 0; return `<div class="quality-rule"><span class="rule-icon ${count ? "fail" : ""}">${count ? "!" : "✓"}</span><span>${label}</span><span class="rule-count">${count ? `${count} quarantined` : "passed"}</span></div>`; }).join(""); const badge = document.getElementById("qualityBadge"); badge.textContent = rejected ? `${rejected} quarantined` : "All passed"; badge.className = `badge ${rejected ? "" : "pass"}`; }
async function runPipeline() {
  const useCase = useCases[activeUseCase], button = document.getElementById("runPipeline"), dot = document.querySelector(".status-dot"), status = document.getElementById("statusText"), meta = document.getElementById("runMeta"), layers = [...document.querySelectorAll(".layer-card")]; activeData = useCase.scenarios[document.getElementById("scenario").value]; button.disabled = true; dot.className = "status-dot running"; layers.forEach(layer => { layer.classList.remove("complete", "processing"); layer.querySelector(".layer-state").textContent = "Waiting"; }); ["bronzeCount", "silverCount", "goldRevenue"].forEach(id => setText(id, "-"));
  for (const [index, layer] of layers.entries()) { layer.classList.add("processing"); layer.querySelector(".layer-state").textContent = "Processing"; status.textContent = ["Capturing source evidence", "Applying data controls", "Publishing decision-ready result"][index]; meta.textContent = ["Keeping the incoming evidence intact...", "Checking duplicates, values and required details...", "Refreshing the trusted business result..."][index]; await wait(420); layer.classList.remove("processing"); layer.classList.add("complete"); layer.querySelector(".layer-state").textContent = "Complete"; if (index === 0) setText("bronzeCount", activeData.bronze); if (index === 1) setText("silverCount", activeData.silver); if (index === 2) setText("goldRevenue", formatValue(activeData.value, useCase)); }
  renderQuality(activeData, useCase); renderRecords(activeData, useCase); document.querySelector("#incidentNote p").textContent = activeData.note; status.textContent = "Pipeline completed"; meta.textContent = `${activeData.bronze} source records, ${activeData.silver} trusted records, updated ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`; dot.className = "status-dot success"; button.disabled = false;
}
document.getElementById("runPipeline").addEventListener("click", runPipeline);
document.querySelectorAll(".use-case").forEach(button => button.addEventListener("click", () => { activeUseCase = button.dataset.useCase; updateUseCase(); }));
document.querySelectorAll(".persona").forEach(button => button.addEventListener("click", () => { document.querySelectorAll(".persona").forEach(item => item.classList.remove("active")); button.classList.add("active"); activePersona = button.dataset.persona; if (activeData) renderRecords(activeData, useCases[activeUseCase]); else setText("personaBadge", `${title(activePersona)} view`); }));
updateUseCase();
