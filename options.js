// ============================================================
//  EcoTrace – options.js
//  Einstellungen: Datenquellen-Modi, API-Keys, Präferenzen
// ============================================================

"use strict";

const $ = id => document.getElementById(id);

// ── State ─────────────────────────────────────────────────
const state = {
  modes: { co2: "db", repair: "db" },  // "db" | "api"
  keys:  { climatiq: "" },
  prefs: { local: true, predecessor: true, priceIndex: true, budget: false, radius: 5 },
  budget: null
};

// ── Init ──────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadAll();
  bindEvents();
});

function loadAll() {
  chrome.storage.local.get([
    "sourceModeCO2", "sourceModeRepair",
    "climatiqApiKey",
    "prefLocal", "prefPredecessor", "prefPriceIndex",
    "monthlyCO2Budget", "searchRadius",
    "totalSavings", "savingsLog", "unlockedAchievements", "achStats"
  ], d => {
    // Modes
    state.modes.co2    = d.sourceModeCO2    || "db";
    state.modes.repair = d.sourceModeRepair || "db";
    applyMode("co2",    state.modes.co2);
    applyMode("repair", state.modes.repair);

    // Keys
    if (d.climatiqApiKey) {
      $("climatiq-key").value = d.climatiqApiKey;
      state.keys.climatiq = d.climatiqApiKey;
    }

    // Prefs
    $("pref-local").checked       = d.prefLocal       !== false;
    $("pref-predecessor").checked = d.prefPredecessor !== false;
    $("pref-price-index").checked = d.prefPriceIndex  !== false;

    const radius = d.searchRadius || 5;
    $("search-radius").value = radius;
    $("radius-label").textContent = radius + " km";

    if (d.monthlyCO2Budget) {
      $("pref-budget").checked = true;
      $("budget-input").value  = d.monthlyCO2Budget;
      $("budget-field").style.display = "block";
      $("budget-sub").textContent = `${d.monthlyCO2Budget} kg CO₂ / Monat`;
    }

    // Stats
    $("stat-total").textContent = (d.totalSavings || 0).toFixed(1);
    $("stat-scans").textContent = (d.savingsLog || []).length;
    $("stat-ach").textContent   = (d.unlockedAchievements || []).length;
  });
}

// ── Mode Switcher ─────────────────────────────────────────
window.setMode = function(source, mode) {
  state.modes[source] = mode;
  applyMode(source, mode);
};

function applyMode(source, mode) {
  const modeEl      = $(`${source}-mode`);
  const dbInfo      = $(`${source}-db-info`);
  const apiField    = $(`${source}-api-field`);
  const statusPill  = $(`${source}-status-pill`);

  if (!modeEl) return;

  // Button-Styles
  modeEl.querySelectorAll(".mode-btn").forEach(btn => {
    btn.classList.remove("active-db", "active-api");
    if (btn.dataset.mode === mode) {
      btn.classList.add(mode === "db" ? "active-db" : "active-api");
    }
  });

  // DB-Info / API-Field
  if (dbInfo)   dbInfo.style.display   = mode === "db"  ? "block" : "none";
  if (apiField) apiField.style.display = mode === "api" ? "flex"  : "none";
  if (apiField) apiField.classList.toggle("visible", mode === "api");

  // Status-Pill
  if (statusPill) {
    statusPill.className = `status-pill ${mode === "db" ? "db" : "api"}`;
    statusPill.textContent = mode === "db" ? "● Datenbank" : "🌐 API";
  }
}

// ── Budget Toggle ─────────────────────────────────────────
window.toggleBudget = function(on) {
  $("budget-field").style.display = on ? "block" : "none";
  $("budget-sub").textContent = on
    ? ($("budget-input").value ? `${$("budget-input").value} kg CO₂ / Monat` : "Wert eingeben")
    : "Deaktiviert";
};

// ── Events ────────────────────────────────────────────────
function bindEvents() {

  // Mode-Buttons via Event-Delegation (ersetzt onclick=)
  document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const source = btn.closest(".source-mode")?.id?.replace("-mode", "");
      if (source) setMode(source, btn.dataset.mode);
    });
  });

  // Radius-Slider oninput (ersetzt inline-Handler)
  $("search-radius")?.addEventListener("input", () => {
    const lbl = $("radius-label");
    if (lbl) lbl.textContent = $("search-radius").value + " km";
  });

  // Budget-Checkbox onchange (ersetzt inline-Handler)
  $("pref-budget")?.addEventListener("change", function() {
    toggleBudget(this.checked);
  });

  // Key-Visibility Toggle
  $("toggle-climatiq-vis").addEventListener("click", () => {
    const inp = $("climatiq-key");
    inp.type = inp.type === "password" ? "text" : "password";
    $("toggle-climatiq-vis").textContent = inp.type === "password" ? "👁" : "🙈";
  });

  // Climatiq API testen
  $("test-climatiq").addEventListener("click", async () => {
    const key = $("climatiq-key").value.trim();
    const banner = $("climatiq-test-banner");
    if (!key) { showBanner(banner, "error", "⚠ Bitte zuerst einen Key eingeben."); return; }

    showBanner(banner, "testing", "⏳ Verbindung wird geprüft…");

    try {
      const resp = await fetch("https://api.climatiq.io/estimate/v3/", {
        method: "POST",
        headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          emission_factor: { activity_id: "consumer_goods-type_mobile_phone", data_version: "^6" },
          parameters: { number: 1 }
        })
      });
      if (resp.ok) {
        const d = await resp.json();
        showBanner(banner, "ok", `✅ Verbindung OK · Test-Ergebnis: ${d.co2e?.toFixed(1)} kg CO₂e`);
        showToast("Climatiq API erreichbar ✅");
      } else if (resp.status === 401) {
        showBanner(banner, "error", "❌ Ungültiger API-Key.");
      } else if (resp.status === 429) {
        showBanner(banner, "error", "⚠ Rate-Limit – bitte später versuchen.");
      } else {
        showBanner(banner, "error", `❌ HTTP ${resp.status}`);
      }
    } catch (e) {
      showBanner(banner, "error", `❌ Netzwerkfehler: ${e.message}`);
    }
  });

  // Climatiq Key speichern
  $("save-climatiq").addEventListener("click", () => {
    const key = $("climatiq-key").value.trim();
    if (!key) { showToast("Bitte Key eingeben."); return; }
    chrome.storage.local.set({ climatiqApiKey: key }, () => showToast("Climatiq-Key gespeichert ✅"));
  });

  // Budget-Input live Label
  $("budget-input").addEventListener("input", () => {
    const v = $("budget-input").value;
    if ($("pref-budget").checked && v) {
      $("budget-sub").textContent = `${v} kg CO₂ / Monat`;
    }
  });

  // Alle speichern
  $("btn-save-all").addEventListener("click", () => {
    const budgetOn = $("pref-budget").checked;
    const budgetVal = budgetOn ? parseFloat($("budget-input").value) || null : null;

    const newCountry = $("user-country")?.value || "de";
    chrome.storage.local.set({
      sourceModeCO2:    state.modes.co2,
      sourceModeRepair: state.modes.repair,
      prefLocal:        $("pref-local").checked,
      prefPredecessor:  $("pref-predecessor").checked,
      prefPriceIndex:   $("pref-price-index").checked,
      monthlyCO2Budget: budgetVal,
      searchRadius:     parseInt($("search-radius").value) || 5,
      userCountry:      newCountry,
      userLang:         newCountry === "nl" ? "nl" : "de",
    }, () => showToast("Alle Einstellungen gespeichert 💚"));
  });

  // Daten zurücksetzen
  // DB-Update Button
  $("btn-force-update")?.addEventListener("click", async () => {
    const banner = $("update-banner");
    if (banner) { banner.className = "api-test-banner testing"; banner.textContent = "⏳ Prüfe auf Updates…"; }
    chrome.storage.local.set({ lastDbUpdate: 0 }, () => {
      if (banner) { banner.className = "api-test-banner ok"; banner.textContent = "✅ Update-Prüfung beim nächsten Seitenaufruf ausgelöst."; }
      setTimeout(() => loadAll(), 500);
    });
  });

  $("btn-reset").addEventListener("click", () => {
    if (!confirm("Alle CO₂-Daten und Achievements zurücksetzen?\n(Keys & Einstellungen bleiben erhalten)")) return;
    chrome.storage.local.remove(
      ["totalSavings", "savingsLog", "unlockedAchievements", "totalXP", "achStats", "circularIntents"],
      () => {
        $("stat-total").textContent = "0.0";
        $("stat-scans").textContent = "0";
        $("stat-ach").textContent   = "0";
        showToast("Daten zurückgesetzt 🗑");
      }
    );
  });
}

// ── Helpers ───────────────────────────────────────────────
function showBanner(el, type, text) {
  el.className = `api-test-banner ${type}`;
  el.textContent = text;
}

function showToast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}
