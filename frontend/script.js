// ──────────────────────────────────────────────
// Configuration
// ──────────────────────────────────────────────
const API_BASE = "http://localhost:8000";
let currentResult = null;
let selectedFile = null;

// Simulated running stats
let stats = {
    docs: 1247,
    injections: 23,
    latency: 87,
    fraud: 4
};

// ──────────────────────────────────────────────
// Theme
// ──────────────────────────────────────────────
function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.contains("dark");
    html.classList.remove("dark", "light");
    html.classList.add(isDark ? "light" : "dark");
    document.getElementById("toggleKnob").textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("ZeroInject-theme", isDark ? "light" : "dark");
}

function loadTheme() {
    const saved = localStorage.getItem("ZeroInject-theme");
    const html = document.documentElement;
    if (saved === "light") {
        html.classList.remove("dark");
        html.classList.add("light");
        document.getElementById("toggleKnob").textContent = "☀️";
    } else {
        html.classList.remove("light");
        html.classList.add("dark");
        document.getElementById("toggleKnob").textContent = "🌙";
    }
}

// ──────────────────────────────────────────────
// Init
// ──────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    loadTheme();
    checkHealth();
    animateStats();
    setupDragDrop();
});

// ──────────────────────────────────────────────
// Health Check
// ──────────────────────────────────────────────
async function checkHealth() {
    try {
        const res = await fetch(`${API_BASE}/api/health`);
        const data = await res.json();
        const dot = document.getElementById("statusDot");
        const txt = document.getElementById("statusText");
        if (data.status === "online") {
            dot.className = "w-2 h-2 rounded-full bg-[#00FF9C]";
            txt.textContent = "● ENGINE ONLINE";
            txt.style.color = "var(--accent)";
            if (!data.ai_available) {
                txt.textContent = "● ENGINE ONLINE (AI Offline)";
                txt.style.color = "#ffaa00";
            }
        }
    } catch {
        const dot = document.getElementById("statusDot");
        const txt = document.getElementById("statusText");
        dot.className = "w-2 h-2 rounded-full bg-[#ff4444]";
        txt.textContent = "● ENGINE OFFLINE";
        txt.style.color = "#ff4444";
    }
}

// ──────────────────────────────────────────────
// Drag & Drop
// ──────────────────────────────────────────────
function setupDragDrop() {
    const zone = document.getElementById("dropZone");

    zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        zone.classList.add("dragover");
    });
    zone.addEventListener("dragleave", () => {
        zone.classList.remove("dragover");
    });
    zone.addEventListener("drop", (e) => {
        e.preventDefault();
        zone.classList.remove("dragover");
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });
}

function handleFileSelect(event) {
    if (event.target.files.length > 0) {
        handleFile(event.target.files[0]);
    }
}

function handleFile(file) {
    selectedFile = file;
    document.getElementById("uploadPrompt").classList.add("hidden");
    document.getElementById("fileInfo").classList.remove("hidden");
    document.getElementById("fileName").textContent = file.name;
    document.getElementById("fileSize").textContent = formatSize(file.size);
    document.getElementById("analyzeBtn").disabled = false;
}

function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
}

// ──────────────────────────────────────────────
// Analysis
// ──────────────────────────────────────────────
async function analyzeDocument() {
    if (!selectedFile) return;

    showProcessing();

    const formData = new FormData();
    formData.append("document", selectedFile);

    try {
        const res = await fetch(`${API_BASE}/api/verify`, {
            method: "POST",
            body: formData
        });
        const data = await res.json();
        await finishProcessing(data);
    } catch (err) {
        hideProcessing();
        alert("Error connecting to ZeroInject backend. Make sure the server is running on " + API_BASE);
    }
}

async function runDemo(scenario) {
    showProcessing();

    try {
        const res = await fetch(`${API_BASE}/api/demo`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ scenario })
        });
        const data = await res.json();
        await finishProcessing(data);
    } catch (err) {
        hideProcessing();
        alert("Error connecting to ZeroInject backend. Make sure the server is running on " + API_BASE);
    }
}

// ──────────────────────────────────────────────
// Processing Animation
// ──────────────────────────────────────────────
let timerInterval = null;

function showProcessing() {
    document.getElementById("processingPanel").classList.remove("hidden");
    document.getElementById("resultsSection").classList.add("hidden");
    document.getElementById("layerFeed").innerHTML = "";

    let ms = 0;
    const timerEl = document.getElementById("processingTimer");
    timerInterval = setInterval(() => {
        ms += 1;
        timerEl.textContent = ms + "ms";
    }, 1);

    // Animate layers appearing one by one
    const layers = [
        { text: "⟳ Layer 1: Visual Integrity Scan...", delay: 200 },
        { text: "⟳ Layer 2: Text Authenticity Analysis...", delay: 500 },
        { text: "⟳ Layer 3: Prompt Injection Detection...", delay: 900 },
        { text: "⟳ Layer 4: Behavioral Pattern Check...", delay: 1200 },
        { text: "⟳ Layer 5: Ensemble Risk Scoring...", delay: 1500 },
    ];

    layers.forEach(({ text, delay }) => {
        setTimeout(() => {
            const feed = document.getElementById("layerFeed");
            const div = document.createElement("div");
            div.className = "animate-layer flex items-center gap-2";
            div.style.color = "var(--text-secondary)";
            div.innerHTML = `<span style="color:var(--accent)">▸</span> ${text}`;
            feed.appendChild(div);
        }, delay);
    });
}

async function finishProcessing(data) {
    // Wait for animations to complete
    await new Promise(r => setTimeout(r, 1800));

    // Mark all layers as done
    const feed = document.getElementById("layerFeed");
    feed.querySelectorAll("div").forEach(el => {
        el.innerHTML = el.innerHTML.replace("⟳", "✓");
        el.style.color = "var(--accent)";
    });

    // Add completion line
    const done = document.createElement("div");
    done.className = "animate-layer font-bold mt-2";
    done.style.color = "var(--accent)";
    done.innerHTML = `✓ Analysis complete — ${data.processing_time_ms}ms`;
    feed.appendChild(done);

    clearInterval(timerInterval);
    document.getElementById("processingTimer").textContent = data.processing_time_ms + "ms";

    await new Promise(r => setTimeout(r, 600));
    document.getElementById("processingPanel").classList.add("hidden");

    // Show results
    currentResult = data;
    renderResults(data);
    updateStats(data);
}

function hideProcessing() {
    clearInterval(timerInterval);
    document.getElementById("processingPanel").classList.add("hidden");
}

// ──────────────────────────────────────────────
// Render Results
// ──────────────────────────────────────────────
function renderResults(data) {
    const section = document.getElementById("resultsSection");
    section.classList.remove("hidden");

    // Score gauge
    const score = data.final_score;
    const gauge = document.getElementById("gaugeCircle");
    const circumference = 283;
    const offset = circumference - (score / 100) * circumference;
    gauge.style.stroke = getScoreColor(score);
    gauge.style.strokeDashoffset = offset;

    // Animate score number
    animateNumber("gaugeScore", 0, score, 1200);

    // Verdict badge
    const badge = document.getElementById("verdictBadge");
    if (data.risk_level === "VERIFIED") {
        badge.textContent = "✓ VERIFIED";
        badge.className = "inline-block px-5 py-2 rounded-xl text-sm font-black uppercase tracking-widest mb-3 bg-[#00FF9C]/15 text-[#00a86b] border border-[#00FF9C]/30";
        badge.style.color = "var(--accent)";
    } else if (data.risk_level === "REVIEW") {
        badge.textContent = "⚠ REVIEW REQUIRED";
        badge.className = "inline-block px-5 py-2 rounded-xl text-sm font-black uppercase tracking-widest mb-3 bg-[#ffaa00]/15 text-[#ffaa00] border border-[#ffaa00]/30";
        badge.style.color = "#ffaa00";
    } else {
        badge.textContent = "✕ BLOCKED";
        badge.className = "inline-block px-5 py-2 rounded-xl text-sm font-black uppercase tracking-widest mb-3 bg-[#ff4444]/15 text-[#ff4444] border border-[#ff4444]/30";
        badge.style.color = "#ff4444";
    }

    // Info fields
    document.getElementById("auditId").textContent = data.audit_id;
    const timeEl = document.getElementById("procTime");
    timeEl.innerHTML = `${data.processing_time_ms}ms`;
    if (data.processing_time_ms < 100) {
        timeEl.innerHTML += ` <span style="color:var(--accent)">(< 100ms ✓)</span>`;
    }
    const decisionEl = document.getElementById("decisionText");
    decisionEl.textContent = data.decision;
    decisionEl.style.color = data.decision === "APPROVE" ? "var(--accent)" : data.decision === "REVIEW" ? "#ffaa00" : "#ff4444";

    document.getElementById("recommendation").textContent = data.recommendation;

    // Layer cards
    renderLayerCards(data.layers, data);

    // Audit trail
    renderAuditTrail(data.audit_trail);

    // Evidence
    renderEvidence(data.layers?.prompt_injection);

    // Scroll to results
    section.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderLayerCards(layers, data) {
    const container = document.getElementById("layerCards");
    container.innerHTML = "";

    const layerConfig = [
        { key: "visual_integrity", icon: "🖼️", name: "Visual Integrity" },
        { key: "text_authenticity", icon: "📝", name: "Text Authenticity" },
        { key: "prompt_injection", icon: "🛡️", name: "Prompt Injection Defense", highlight: true },
        { key: "behavioral_patterns", icon: "🔍", name: "Behavioral Patterns" },
    ];

    layerConfig.forEach(({ key, icon, name, highlight }) => {
        const layer = layers[key] || {};
        const card = document.createElement("div");
        let extraClass = highlight ? "lg:col-span-1" : "";
        card.className = `layer-card rounded-xl p-4 ${extraClass}`;
        if (highlight) card.style.boxShadow = "inset 0 0 0 1px rgba(0,168,107,0.2)";

        const statusColor = layer.status === "PASS" ? "var(--accent)" : layer.status === "WARN" ? "#ffaa00" : "#ff4444";
        const statusBg = layer.status === "PASS"
            ? "background:rgba(0,168,107,0.1);color:var(--accent)"
            : layer.status === "WARN"
                ? "background:rgba(255,170,0,0.1);color:#ffaa00"
                : "background:rgba(255,68,68,0.1);color:#ff4444";

        let bannerHtml = "";
        if (highlight) {
            if (layer.status === "FAIL") {
                bannerHtml = `<div class="threat-banner rounded-lg px-3 py-1.5 text-center mb-3"><span class="text-xs font-bold" style="color:#ff4444">🚨 THREAT DETECTED</span></div>`;
            } else {
                bannerHtml = `<div class="safe-banner rounded-lg px-3 py-1.5 text-center mb-3"><span class="text-xs font-bold" style="color:var(--accent)">✓ NO THREAT DETECTED</span></div>`;
            }
        }

        const flagsHtml = (layer.flags || []).map(f =>
            `<span class="inline-block text-[10px] px-2 py-0.5 rounded-full mb-1 mr-1" style="background:var(--bg-tertiary);border:1px solid var(--border-secondary);color:var(--text-secondary)">${truncate(f, 50)}</span>`
        ).join("");

        card.innerHTML = `
        ${bannerHtml}
        <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
                <span class="text-lg">${icon}</span>
                <span class="text-xs font-bold uppercase tracking-wide" style="color:var(--text-heading)">${name}</span>
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full" style="${statusBg}">${layer.status || "N/A"}</span>
        </div>
        <div class="mb-3">
            <div class="flex justify-between text-[10px] mb-1" style="color:var(--text-muted)">
                <span>Score</span>
                <span class="font-semibold" style="color:${statusColor}">${layer.score ?? 0}/100</span>
            </div>
            <div class="h-1.5 rounded-full overflow-hidden" style="background:var(--bar-track)">
                <div class="h-full rounded-full score-bar-fill" style="width:${layer.score ?? 0}%;background:${statusColor}"></div>
            </div>
        </div>
        <div class="flex flex-wrap gap-0.5">${flagsHtml}</div>
    `;
        container.appendChild(card);
    });

    // 5th card: Decision & Audit
    const decisionCard = document.createElement("div");
    decisionCard.className = "layer-card rounded-xl p-4";
    const decColor = data.decision === "APPROVE" ? "var(--accent)" : data.decision === "REVIEW" ? "#ffaa00" : "#ff4444";
    const decBg = data.decision === "APPROVE"
        ? "background:rgba(0,168,107,0.1);color:var(--accent)"
        : data.decision === "REVIEW"
            ? "background:rgba(255,170,0,0.1);color:#ffaa00"
            : "background:rgba(255,68,68,0.1);color:#ff4444";
    decisionCard.innerHTML = `
    <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
            <span class="text-lg">⚖️</span>
            <span class="text-xs font-bold uppercase tracking-wide" style="color:var(--text-heading)">Decision & Audit</span>
        </div>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full" style="${decBg}">${data.decision}</span>
    </div>
    <div class="mb-3">
        <div class="flex justify-between text-[10px] mb-1" style="color:var(--text-muted)">
            <span>Final Score</span>
            <span class="font-semibold" style="color:${decColor}">${data.final_score}/100</span>
        </div>
        <div class="h-1.5 rounded-full overflow-hidden" style="background:var(--bar-track)">
            <div class="h-full rounded-full score-bar-fill" style="width:${data.final_score}%;background:${decColor}"></div>
        </div>
    </div>
    <div class="space-y-1 text-[10px]" style="color:var(--text-secondary)">
        <p>🕐 ${data.processing_time_ms}ms${data.processing_time_ms < 100 ? " ✓" : ""}</p>
        <p>🔑 ${data.audit_id}</p>
        <p>📊 ${data.audit_trail?.length || 0} audit events</p>
    </div>
`;
    container.appendChild(decisionCard);
}

function renderAuditTrail(trail) {
    const container = document.getElementById("auditTrail");
    container.innerHTML = "";

    (trail || []).forEach((entry, i) => {
        const layerColor = getLayerColor(entry.layer);
        const div = document.createElement("div");
        div.className = "flex items-start gap-3 text-xs py-2";
        div.style.borderBottom = "1px solid var(--border-primary)";
        div.innerHTML = `
        <div class="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5" style="background:${layerColor}"></div>
        <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
                <span class="font-semibold" style="color:var(--text-heading)">${entry.action}</span>
                <span class="mono text-[10px]" style="color:var(--text-faint)">${entry.layer}</span>
            </div>
            <p class="mt-0.5 truncate" style="color:var(--text-muted)">${entry.result}</p>
        </div>
    `;
        container.appendChild(div);
    });
}

function renderEvidence(injectionLayer) {
    const section = document.getElementById("evidenceSection");
    const content = document.getElementById("evidenceContent");

    if (!injectionLayer?.evidence?.length) {
        section.classList.add("hidden");
        return;
    }

    section.classList.remove("hidden");
    content.innerHTML = "";

    injectionLayer.evidence.forEach(e => {
        const div = document.createElement("div");
        div.className = "text-xs mono rounded-lg px-3 py-2";
        div.style.cssText = "background:var(--bg-tertiary);border:1px solid var(--border-secondary);color:#ff4444";
        div.textContent = `"${e}"`;
        content.appendChild(div);
    });
}

function toggleEvidence() {
    const content = document.getElementById("evidenceContent");
    const toggle = document.getElementById("evidenceToggle");
    const isHidden = content.classList.toggle("hidden");
    toggle.textContent = isHidden ? "▶" : "▼";
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
function getScoreColor(score) {
    if (score <= 30) return "var(--accent)";
    if (score <= 60) return "#ffaa00";
    return "#ff4444";
}

function getLayerColor(layer) {
    const colors = {
        visual_integrity: "var(--accent)",
        text_authenticity: "#3b82f6",
        prompt_injection: "#ff4444",
        behavioral_patterns: "#a855f7",
        ensemble: "#ffaa00",
        system: "#737373",
    };
    return colors[layer] || "#737373";
}

function truncate(str, max) {
    return str.length > max ? str.slice(0, max) + "…" : str;
}

function animateNumber(elementId, start, end, duration) {
    const el = document.getElementById(elementId);
    const range = end - start;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + range * eased);
        el.textContent = current;
        el.style.color = getScoreColor(current);
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

// ──────────────────────────────────────────────
// Stats
// ──────────────────────────────────────────────
function animateStats() {
    animateStatNumber("statDocs", stats.docs);
    animateStatNumber("statInjections", stats.injections);
    document.getElementById("statLatency").textContent = stats.latency + "ms";
    animateStatNumber("statFraud", stats.fraud);

    setInterval(() => {
        stats.docs += Math.floor(Math.random() * 3);
        document.getElementById("statDocs").textContent = stats.docs.toLocaleString();
    }, 5000);

    setInterval(() => {
        if (Math.random() > 0.7) {
            stats.injections += 1;
            document.getElementById("statInjections").textContent = stats.injections;
        }
    }, 8000);
}

function animateStatNumber(id, target) {
    const el = document.getElementById(id);
    let current = 0;
    const step = Math.max(1, Math.floor(target / 40));
    const interval = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(interval);
        }
        el.textContent = id === "statLatency" ? current + "ms" : current.toLocaleString();
    }, 30);
}

function updateStats(data) {
    stats.docs += 1;
    document.getElementById("statDocs").textContent = stats.docs.toLocaleString();

    if (data.layers?.prompt_injection?.status === "FAIL") {
        stats.injections += 1;
        document.getElementById("statInjections").textContent = stats.injections;
    }
    if (data.layers?.behavioral_patterns?.template_reuse) {
        stats.fraud += 1;
        document.getElementById("statFraud").textContent = stats.fraud;
    }

    stats.latency = Math.round((stats.latency * 0.8 + data.processing_time_ms * 0.2));
    document.getElementById("statLatency").textContent = stats.latency + "ms";
}

// ──────────────────────────────────────────────
// Export
// ──────────────────────────────────────────────
function exportReport() {
    if (!currentResult) return;
    const blob = new Blob([JSON.stringify(currentResult, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ZeroInject_report_${currentResult.audit_id || "unknown"}.json`;
    a.click();
    URL.revokeObjectURL(url);
}
