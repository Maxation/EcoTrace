// ============================================================
//  EcoTrace – services/reportService.js
//  Generiert einen monatlichen CO₂-Ersparnis-Report als HTML.
//  Kann direkt im Browser geöffnet und als PDF gespeichert werden.
// ============================================================

"use strict";

window.EcoTrace = window.EcoTrace || {};

const ReportService = {

  /**
   * Lädt alle Daten aus chrome.storage und baut den Report.
   * @returns {Promise<string>} vollständiger HTML-String
   */
  async generate() {
    const data = await this._loadData();
    return this._buildHTML(data);
  },

  /**
   * Öffnet den Report in einem neuen Tab.
   */
  async openInNewTab() {
    const html = await this.generate();
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    window.open(url, "_blank");
    // URL nach 60s freigeben
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  },

  // ── Daten laden ─────────────────────────────────────────
  async _loadData() {
    return new Promise((resolve) => {
      chrome.storage.local.get([
        "totalSavings", "savingsLog", "unlockedAchievements",
        "totalXP", "achStats", "monthlyCO2Budget",
        "climatiqApiKey", "installDate"
      ], (d) => {
        const log  = d.savingsLog || [];
        const now  = new Date();
        const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

        // Monatliche Gruppierung
        const byMonth = {};
        for (const entry of log) {
          // Datum parsen: "TT.MM.YYYY"
          const [day, month, year] = (entry.date || "01.01.2025").split(".");
          const key = `${year}-${month}`;
          if (!byMonth[key]) byMonth[key] = { savings: 0, count: 0, items: [] };
          byMonth[key].savings += entry.savings || 0;
          byMonth[key].count++;
          byMonth[key].items.push(entry);
        }

        // Letzten 6 Monate
        const months = Object.entries(byMonth)
          .sort(([a], [b]) => b.localeCompare(a))
          .slice(0, 6)
          .map(([key, val]) => ({
            key,
            label:   this._monthLabel(key),
            savings: Math.round(val.savings * 10) / 10,
            count:   val.count,
            items:   val.items.slice(0, 5)
          }));

        resolve({
          totalSavings:    d.totalSavings || 0,
          totalScans:      (d.achStats?.totalScans) || log.length,
          achievements:    d.unlockedAchievements || [],
          totalXP:         d.totalXP || 0,
          budget:          d.monthlyCO2Budget || null,
          currentMonthSav: byMonth[thisMonth]?.savings || 0,
          months,
          generatedAt:     now.toLocaleString("de-DE"),
          hasApiKey:       !!d.climatiqApiKey,
          log:             log.slice(0, 20)
        });
      });
    });
  },

  _monthLabel(key) {
    const [year, month] = key.split("-");
    const d = new Date(parseInt(year), parseInt(month) - 1, 1);
    return d.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  },

  // ── HTML-Report bauen ────────────────────────────────────
  _buildHTML(d) {
    const maxSavings = Math.max(...d.months.map(m => m.savings), 1);
    const levelInfo  = (EcoTrace.AchievementService?.getLevel(d.totalXP)) || { title: "Eco-Starter", icon: "🌱", level: 1, progress: 0 };

    const monthBars = d.months.map(m => {
      const pct = Math.round((m.savings / maxSavings) * 100);
      return `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
          <div style="width:110px;font-size:12px;color:#6B6B50;text-align:right;flex-shrink:0">${m.label}</div>
          <div style="flex:1;background:#E8E8CC;border-radius:6px;height:22px;overflow:hidden">
            <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#228B22,#4CAF50);
                        border-radius:6px;display:flex;align-items:center;padding-left:8px;
                        transition:width 0.3s;min-width:${m.savings > 0 ? 36 : 0}px">
              ${m.savings > 0 ? `<span style="font-size:11px;font-weight:700;color:#fff">${m.savings} kg</span>` : ""}
            </div>
          </div>
          <div style="width:60px;font-size:11px;color:#6B6B50;flex-shrink:0">${m.count} Scans</div>
        </div>`;
    }).join("");

    const achBadges = d.achievements.slice(0, 12).map(id => {
      const ach = (typeof EcoTrace !== 'undefined' && EcoTrace.ACHIEVEMENTS)?.find(a => a.id === id);
      if (!ach) return "";
      return `<div style="display:inline-flex;align-items:center;gap:5px;
                   background:#E8F5E9;border:1px solid #A5D6A7;border-radius:20px;
                   padding:4px 10px;font-size:12px;margin:3px">
                ${ach.icon} <span style="font-weight:600">${ach.title}</span>
              </div>`;
    }).join("");

    const logRows = d.log.map(e => `
      <tr>
        <td style="padding:7px 10px;font-size:12px;border-bottom:1px solid #E8E8CC">
          ${this._esc(e.title || "–")}
        </td>
        <td style="padding:7px 10px;font-size:12px;border-bottom:1px solid #E8E8CC;
                   text-align:right;color:#228B22;font-weight:700">
          −${(e.savings || 0).toFixed(1)} kg
        </td>
        <td style="padding:7px 10px;font-size:12px;border-bottom:1px solid #E8E8CC;
                   color:#6B6B50;white-space:nowrap">
          ${e.date || ""}
        </td>
      </tr>`).join("");

    const budgetSection = d.budget ? `
      <div style="background:linear-gradient(135deg,#E8F5E9,#F1F8E9);border:1.5px solid #A5D6A7;
                  border-radius:12px;padding:18px 22px;margin-bottom:20px">
        <div style="font-size:13px;font-weight:700;color:#1B5E20;margin-bottom:10px">
          📊 CO₂-Budget aktueller Monat
        </div>
        ${this._buildBudgetBar(d.currentMonthSav, d.budget)}
      </div>` : "";

    return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>EcoTrace Report – ${d.generatedAt}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&family=DM+Serif+Display&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #F5F5DC; color: #2C2C1E; padding: 0; }
  .page { max-width: 800px; margin: 0 auto; padding: 40px 32px 60px; }
  @media print {
    body { background: #fff; }
    .no-print { display: none !important; }
    .page { padding: 20px; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div style="display:flex;align-items:center;justify-content:space-between;
              margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #D4D4AA">
    <div style="display:flex;align-items:center;gap:14px">
      <div style="width:52px;height:52px;background:linear-gradient(135deg,#228B22,#1B5E20);
                  border-radius:14px;display:flex;align-items:center;justify-content:center">
        <svg width="28" height="28" viewBox="0 0 24 24">
          <path d="M12 3C8 7 7 10 9 14c1 2 3 3 3 3s2-1 3-3c2-4 1-7-3-11z" fill="#fff"/>
        </svg>
      </div>
      <div>
        <div style="font-family:'DM Serif Display',serif;font-size:26px;color:#2C2C1E">EcoTrace</div>
        <div style="font-size:12px;color:#6B6B50">Monatlicher CO₂-Report · Erstellt: ${d.generatedAt}</div>
      </div>
    </div>
    <button class="no-print" onclick="window.print()"
      style="padding:9px 18px;background:#228B22;color:#fff;border:none;border-radius:9px;
             font-size:13px;font-weight:700;cursor:pointer">
      🖨 PDF speichern
    </button>
  </div>

  <!-- Hero Stats -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px">
    ${[
      { num: d.totalSavings.toFixed(1), lbl: "kg CO₂ gesamt", icon: "🌿" },
      { num: d.totalScans,              lbl: "Produkte gescannt", icon: "🔍" },
      { num: d.achievements.length,     lbl: "Achievements",  icon: "🏅" },
      { num: `${levelInfo.icon} ${levelInfo.level}`,  lbl: levelInfo.title, icon: "" },
    ].map(s => `
      <div style="background:#fff;border:1.5px solid #D4D4AA;border-radius:12px;
                  padding:16px 14px;text-align:center">
        <div style="font-size:22px;font-weight:800;color:#228B22;line-height:1.1">${s.num}</div>
        <div style="font-size:11px;color:#6B6B50;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px">${s.lbl}</div>
      </div>`
    ).join("")}
  </div>

  <!-- Budget -->
  ${budgetSection}

  <!-- Monatlicher Verlauf -->
  <div style="background:#fff;border:1.5px solid #D4D4AA;border-radius:12px;
              padding:20px 22px;margin-bottom:20px">
    <div style="font-size:14px;font-weight:700;margin-bottom:16px;color:#2C2C1E">
      📈 CO₂-Ersparnis der letzten 6 Monate
    </div>
    ${monthBars || '<div style="color:#6B6B50;font-size:12px">Noch keine Daten vorhanden.</div>'}
  </div>

  <!-- Achievements -->
  ${d.achievements.length > 0 ? `
  <div style="background:#fff;border:1.5px solid #D4D4AA;border-radius:12px;
              padding:20px 22px;margin-bottom:20px">
    <div style="font-size:14px;font-weight:700;margin-bottom:12px;color:#2C2C1E">
      🏅 Freigeschaltete Achievements (${d.achievements.length})
    </div>
    <div>${achBadges}</div>
  </div>` : ""}

  <!-- Aktivitäts-Log -->
  ${d.log.length > 0 ? `
  <div style="background:#fff;border:1.5px solid #D4D4AA;border-radius:12px;
              padding:20px 22px;margin-bottom:20px">
    <div style="font-size:14px;font-weight:700;margin-bottom:12px;color:#2C2C1E">
      📋 Letzte Aktivitäten
    </div>
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr style="background:#F5F5DC">
          <th style="padding:8px 10px;font-size:11px;text-align:left;color:#6B6B50;
                     text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #D4D4AA">Produkt</th>
          <th style="padding:8px 10px;font-size:11px;text-align:right;color:#6B6B50;
                     text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #D4D4AA">CO₂ gespart</th>
          <th style="padding:8px 10px;font-size:11px;color:#6B6B50;
                     text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #D4D4AA">Datum</th>
        </tr>
      </thead>
      <tbody>${logRows}</tbody>
    </table>
  </div>` : ""}

  <!-- Footer -->
  <div style="text-align:center;font-size:11px;color:#6B6B50;
              border-top:1px dashed #D4D4AA;padding-top:16px;margin-top:24px">
    EcoTrace v2.0 · Report automatisch generiert · ${d.generatedAt} ·
    ${d.hasApiKey ? "Live-Daten via Climatiq" : "Schätzwerte (kein API-Key)"}
  </div>

</div>
</body>
</html>`;
  },

  _buildBudgetBar(used, budget) {
    const pct     = Math.min(Math.round((used / budget) * 100), 100);
    const over    = used > budget;
    const barColor = over ? "#C62828" : pct > 75 ? "#F57F17" : "#228B22";
    return `
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px">
        <span style="color:#6B6B50">Aktueller Monat: <strong>${used.toFixed(1)} kg</strong></span>
        <span style="color:#6B6B50">Budget: <strong>${budget} kg</strong></span>
      </div>
      <div style="background:#D4D4AA;border-radius:8px;height:20px;overflow:hidden">
        <div style="width:${pct}%;height:100%;background:${barColor};border-radius:8px;
                    display:flex;align-items:center;padding-left:8px;min-width:${pct > 5 ? 32 : 0}px">
          ${pct > 5 ? `<span style="font-size:11px;font-weight:700;color:#fff">${pct}%</span>` : ""}
        </div>
      </div>
      ${over ? `<div style="color:#C62828;font-size:11px;margin-top:5px;font-weight:600">
        ⚠ Budget um ${(used - budget).toFixed(1)} kg überschritten
      </div>` : ""}`;
  },

  _esc(s) {
    return (s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }
};

window.EcoTrace.ReportService = ReportService;
