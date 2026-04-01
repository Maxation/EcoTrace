// ============================================================
//  EcoTrace – services/achievementService.js
//  Achievement-System: Badges & Meilensteine
// ============================================================

"use strict";

window.EcoTrace = window.EcoTrace || {};

// ╔══════════════════════════════════════════════════════════╗
//  ACHIEVEMENT-DEFINITIONEN
// ╚══════════════════════════════════════════════════════════╝
const ACHIEVEMENTS = [
  // ── Erste Schritte ──────────────────────────────────────
  {
    id:       "first_scan",
    icon:     "🌱",
    title:    "Erster Schritt",
    desc:     "Erstes Produkt gescannt",
    category: "milestone",
    check:    (s) => s.totalScans >= 1,
    statKey:  "totalScans", threshold: 1, xp: 10
  },
  {
    id:       "first_save",
    icon:     "💾",
    title:    "Ersparnis gesichert",
    desc:     "Erste CO₂-Ersparnis gespeichert",
    category: "milestone",
    check:    (s) => s.totalSaves >= 1,
    statKey:  "totalSaves", threshold: 1, xp:       15
  },
  {
    id:       "first_refurbished",
    icon:     "♻️",
    title:    "Refurbished-Fan",
    desc:     "Ersten Secondhand-Shop-Link geöffnet",
    category: "action",
    check:    (s) => s.refurbishedClicks >= 1,
    statKey:  "refurbishedClicks", threshold: 1, xp:       20
  },
  {
    id:       "first_repair",
    icon:     "🔧",
    title:    "Repair-Pionier",
    desc:     "Ersten Reparatur-Guide aufgerufen",
    category: "action",
    check:    (s) => s.repairClicks >= 1,
    xp:       25
  },

  // ── CO₂-Meilensteine ────────────────────────────────────
  {
    id:       "save_1kg",
    icon:     "🌿",
    title:    "1 kg CO₂ gespart",
    desc:     "Kumulierte Ersparnis: 1 kg CO₂",
    category: "savings",
    check:    (s) => s.totalSavings >= 1,
    statKey:  "totalSavings", threshold: 1, xp:       20
  },
  {
    id:       "save_10kg",
    icon:     "🌳",
    title:    "10 kg CO₂ gespart",
    desc:     "Das entspricht ~40 km Autofahrt",
    category: "savings",
    check:    (s) => s.totalSavings >= 10,
    statKey:  "totalSavings", threshold: 10, xp:       50
  },
  {
    id:       "save_50kg",
    icon:     "🌲",
    title:    "50 kg CO₂ gespart",
    desc:     "Entspricht 1 Monat eines Baumes CO₂-Aufnahme",
    category: "savings",
    check:    (s) => s.totalSavings >= 50,
    statKey:  "totalSavings", threshold: 50, xp:       100
  },
  {
    id:       "save_100kg",
    icon:     "🌍",
    title:    "100 kg CO₂-Champion",
    desc:     "Entspricht einem Kurzflug eingespart!",
    category: "savings",
    check:    (s) => s.totalSavings >= 100,
    statKey:  "totalSavings", threshold: 100, xp:       200
  },
  {
    id:       "save_500kg",
    icon:     "🏆",
    title:    "Klimaheld",
    desc:     "500 kg CO₂ eingespart – außerordentlich!",
    category: "savings",
    check:    (s) => s.totalSavings >= 500,
    statKey:  "totalSavings", threshold: 500, xp:       500
  },

  // ── Scans ────────────────────────────────────────────────
  {
    id:       "scan_10",
    icon:     "🔍",
    title:    "Fleißiger Scanner",
    desc:     "10 Produkte analysiert",
    category: "activity",
    check:    (s) => s.totalScans >= 10,
    statKey:  "totalScans", threshold: 10, xp:       30
  },
  {
    id:       "scan_50",
    icon:     "🧐",
    title:    "CO₂-Detektiv",
    desc:     "50 Produkte analysiert",
    category: "activity",
    check:    (s) => s.totalScans >= 50,
    statKey:  "totalScans", threshold: 50, xp:       75
  },
  {
    id:       "scan_100",
    icon:     "🏅",
    title:    "Nachhaltigkeits-Profi",
    desc:     "100 Produkte analysiert",
    category: "activity",
    check:    (s) => s.totalScans >= 100,
    statKey:  "totalScans", threshold: 100, xp:       150
  },

  // ── Lokale Aktionen ──────────────────────────────────────
  {
    id:       "local_shop_5",
    icon:     "📍",
    title:    "Lokalmatador",
    desc:     "5 lokale Repair/Second-Hand-Shops erkundet",
    category: "local",
    check:    (s) => s.localShopClicks >= 5,
    statKey:  "localShopClicks", threshold: 5, xp:       40
  },

  // ── Streak ───────────────────────────────────────────────
  {
    id:       "streak_7",
    icon:     "🔥",
    title:    "7-Tage-Streak",
    desc:     "7 Tage in Folge mindestens 1 Produkt gescannt",
    category: "streak",
    check:    (s) => s.maxStreak >= 7,
    statKey:  "maxStreak", threshold: 7, xp:       80
  },

  // ── Budget ───────────────────────────────────────────────
  {
    id:       "budget_set",
    icon:     "📊",
    title:    "Budget-Bewusst",
    desc:     "CO₂-Monatsbudget gesetzt",
    category: "settings",
    check:    (s) => s.budgetSet === true,
    xp:       10
  },
  {
    id:       "budget_kept",
    icon:     "✅",
    title:    "Budget-Halter",
    desc:     "CO₂-Budget einen Monat eingehalten",
    category: "settings",
    check:    (s) => s.budgetMonthsKept >= 1,
    xp:       60
  },

  // ── Geheimer Achievement ─────────────────────────────────
  {
    id:       "fairphone_fan",
    icon:     "🌸",
    title:    "Fairphone-Fan",
    desc:     "Ein Fairphone oder Refurbished-Fairphone gescannt",
    category: "special",
    check:    (s) => s.fairphoneScanned === true,
    xp:       30
  }
];


const AchievementService = {

  // ── Alle Achievements prüfen und neue freischalten ───────
  /**
   * @param {object} stats  aktueller State aus chrome.storage
   * @returns {Promise<Array>} neu freigeschaltete Achievements
   */
  async checkAndUnlock(stats) {
    return new Promise((resolve) => {
      chrome.storage.local.get(["unlockedAchievements", "totalXP"], (data) => {
        const unlocked  = new Set(data.unlockedAchievements || []);
        const newlyUnlocked = [];
        let xpGained = 0;

        for (const ach of ACHIEVEMENTS) {
          if (unlocked.has(ach.id)) continue;
          if (ach.check(stats)) {
            unlocked.add(ach.id);
            newlyUnlocked.push(ach);
            xpGained += ach.xp;
          }
        }

        if (newlyUnlocked.length > 0) {
          chrome.storage.local.set({
            unlockedAchievements: [...unlocked],
            totalXP: (data.totalXP || 0) + xpGained
          });
        }

        resolve(newlyUnlocked);
      });
    });
  },

  // ── Alle Achievement-Daten laden ─────────────────────────
  async getAll() {
    return new Promise((resolve) => {
      chrome.storage.local.get(["unlockedAchievements"], (data) => {
        const unlocked = new Set(data.unlockedAchievements || []);
        resolve(ACHIEVEMENTS.map(a => ({
          ...a,
          unlocked: unlocked.has(a.id)
        })));
      });
    });
  },

  // ── XP-Level berechnen ───────────────────────────────────
  getLevel(xp) {
    const levels = [
      { min:    0, level: 1, title: "Newcomer",         icon: "🌱" },
      { min:   50, level: 2, title: "Eco-Bewusst",      icon: "🍀" },
      { min:  150, level: 3, title: "Green Shopper",    icon: "🌿" },
      { min:  300, level: 4, title: "Sustainability Pro",icon: "🌳" },
      { min:  600, level: 5, title: "Climate Hero",     icon: "🌍" },
      { min: 1000, level: 6, title: "Earth Guardian",   icon: "🏆" },
    ];
    let current = levels[0];
    let next    = levels[1];
    for (let i = levels.length - 1; i >= 0; i--) {
      if (xp >= levels[i].min) {
        current = levels[i];
        next    = levels[i + 1] || null;
        break;
      }
    }
    const progress = next
      ? Math.round(((xp - current.min) / (next.min - current.min)) * 100)
      : 100;
    return { ...current, xp, next, progress };
  },

  // ── Statistik-Update-Helfer ───────────────────────────────
  /**
   * Erhöht einen Stats-Zähler und prüft Achievements.
   * @param {string} field   z.B. "totalScans", "repairClicks"
   * @param {number} [delta=1]
   */
  async increment(field, delta = 1) {
    return new Promise((resolve) => {
      chrome.storage.local.get(["achStats"], async (data) => {
        let stats = data.achStats || {};
        stats[field] = (stats[field] || 0) + delta;
        stats = await this._updateStreak(stats);
        chrome.storage.local.set({ achStats: stats }, async () => {
          const newAch = await this.checkAndUnlock(stats);
          resolve(newAch);
        });
      });
    });
  },

  async _updateStreak(stats) {
    const today = new Date().toDateString();
    if (stats.lastScanDate === today) return stats;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const streak = stats.lastScanDate === yesterday
      ? (stats.currentStreak || 0) + 1
      : 1;
    stats.currentStreak = streak;
    stats.maxStreak     = Math.max(stats.maxStreak || 0, streak);
    stats.lastScanDate  = today;
    return stats;
  }
};

window.EcoTrace.AchievementService = AchievementService;
window.EcoTrace.ACHIEVEMENTS = ACHIEVEMENTS;
