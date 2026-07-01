# Privacy Policy

**Last updated:** June 2026  
**Extension Version:** v2.3.2  

EcoTrace is built strictly on an **offline-first architecture**. By default, **no personal data ever leaves your device**. We believe in absolute privacy and data sovereignty for our users.

---

## 💾 1. Local Storage (On Your Device Only)

EcoTrace stores all its application data locally using your browser's secure `chrome.storage.local` API. **Nothing is transmitted to external servers.** The following data is kept entirely on your machine:

* **User Preferences:** Language, country selection, $CO_2$ display mode, local search radius, and overlay settings.
* **Climatiq API Key:** If you choose to enter one, it is stored locally and only sent directly to Climatiq when a specific API lookup is triggered.
* **$CO_2$ Savings Log:** Product titles, dates, and calculated $CO_2$ amounts from purchases or alternatives you have confirmed.
* **Wishlist Items:** Locally saved product names and dates.
* **Gamification Data:** Your unlocked achievements, badges, and XP points.
* **Monthly $CO_2$ Budget:** Your self-imposed limit (if configured in settings).

➡️ **Data Control:** You can permanently delete all of this data at any time by clicking the **Reset** button in the EcoTrace dashboard, or by simply uninstalling the extension from your browser.

---

## 🔍 2. Data Processing on Amazon Pages

When you browse an Amazon product page, EcoTrace reads specific on-screen information to generate its environmental breakdown:
* Product title and category breadcrumbs
* Shipping origin text
* Product price

**How it's handled:** This information is processed **locally in real-time** within your browser to calculate the $CO_2$ estimate. It is never permanently stored, and it is never transmitted to us or any third party.

---

## 🌐 3. Optional External Requests (Strictly Opt-In)

By default, EcoTrace operates **100% offline** and makes zero external network requests. External connections only happen if you explicitly enable the corresponding feature in the settings:

| Service | Triggered By | What it does / sends |
| :--- | :--- | :--- |
| **Climatiq API** (`api.climatiq.io`) | Enabling API mode + entering your own API key | Sends product data to fetch precise carbon emission factors. |
| **iFixit API** (`de.ifixit.com`) | Enabling live iFixit mode | Fetches live repairability data for the opened device. |
| **Overpass API** (`overpass-api.de`) | Enabling local shop search | Sends your approximate GPS coordinates to locate nearby physical stores. *Coordinates are never stored after the request completes.* |
| **GitHub** (`raw.githubusercontent.com`) | Optional weekly database update check | Connects to our repository to check if a new local $CO_2$ database version is available. |

---

## 🚫 4. No Tracking, Analytics, or Ads

* **No Analytics:** EcoTrace contains no tracking scripts, no Google Analytics, no telemetry, and no third-party monitoring SDKs.
* **No Advertising:** There are no ads, ad-network integrations, or sponsored trackers.
* **No Behavioral Logging:** We do not track, log, or monitor your browsing history, search queries, or buying behavior.

---

## 🤝 5. Data Sharing & Third Parties

Because we do not collect, view, or store your data in the first place, **EcoTrace does not sell, share, or transfer any user data to third parties.** Your data belongs entirely to you.

---

## ✉️ Contact & Open Source Auditing

As an open-source project, our entire data handling process is transparent and verifiable. You can independently audit how data is processed by reviewing our source code at [github.com/Maxation/EcoTrace](https://github.com/Maxation/EcoTrace).
