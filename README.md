# EcoTrace: A Digital Tool for Climate-Conscious Shopping
```markdown
**[📖 View Overview (README)](./README.md)** | [📥 Installation Guide](./INSTALL.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/Maxation/EcoTrace)
[![Platform](https://img.shields.io/badge/platform-Chrome%20|%20Brave%20|%20Edge-lightgrey.svg)](https://github.com/Maxation/EcoTrace)

**EcoTrace** is a free, open-source browser extension (Chrome) for Amazon designed to break down barriers to sustainable purchasing decisions. It automatically embeds a compact carbon footprint analysis and practical eco-friendly alternatives directly into any Amazon product page—requiring zero effort from the user.

---

## 🚀 Core Features

### 📊 1. Three-Tiered Carbon Data System & Shipping Detection
The plugin determines a product's carbon footprint using a cascading data retrieval system:
* **Local Database:** Contains over 450 specific device datasets sourced from official manufacturer Lifecycle Assessment (LCA) reports (*Apple, Samsung, Google, Dell, HP, Lenovo, Fairphone*, etc.).
* **Live Query (Optional):** Integrated with the **Climatiq API** to fetch scientifically validated emission factors from *EcoInvent v3.8* and *IPCC AR6*.
* **Fallback Model:** Utilizes category-specific averages from recognized studies (*HIGG MSI 2022, Textile Exchange 2023, and Poore & Nemecek 2018*).
* **Shipping Analysis:** Automatically scans Amazon product text to detect the item's origin, differentiating the climate impact of a local Amazon warehouse shipment from a long-haul import.

### 🔄 2. Second-Hand Comparison
Every displayed $CO_2$ value is instantly benchmarked against a secondhand alternative. EcoTrace highlights the carbon savings of choosing a refurbished device (typically **70–95% savings**, as the manufacturing phase emissions are avoided) and provides direct search links to platforms like *Back Market, Rebuy, Willhaben*, or *Vinted*.

### 🔧 3. Repairability Score & Cost Estimation
Leveraging *iFixit Repairability Scores* and the *EU ESPR Repairability Index 2024*, the plugin provides for over 280 devices:
* A **score from 1 (hard to repair) to 10 (modular, freely available parts)**.
* Realistic **repair cost estimations** (Professional vs. DIY) for over 30 commonly repaired devices (e.g., *"Battery replacement: €79–109 repair shop / €39–49 DIY, extends device lifespan by ~2.5 years"*).

### 📱 4. Legacy Models & Alternatives
For current electronics, the plugin displays one or two generations older predecessor models, complete with a performance delta (e.g., *"-5% performance"*) and financial savings. This directly addresses the rapid product cycles in the tech industry, which represent a major lever for carbon reduction.

---

## 🔒 Offline-First: Privacy & Energy Efficiency

EcoTrace is built strictly on an **Offline-First architecture**:
* **Total Privacy:** Carbon calculations, repair scores, and hardware database data are stored completely locally. No server calls, no data tracking, and no personal data transmission.
* **High Performance:** Instantaneous rendering in **under 300 milliseconds**.
* **Eco-Friendly:** Zero server-side energy consumption; the extension remains fully functional without an internet connection.

---

## 🧠 Scientific Background & Efficacy

EcoTrace incorporates evidence-based communication principles from climate psychology, aligning closely with recommendations from the **IPCC Sixth Assessment Report (2022)**. Studies show that providing high-quality information exactly at the point of decision can positively influence purchases in **15–30% of cases**.

* **Point-of-Sale Communication:** Information is displayed exactly when a purchasing decision is made—not after.
* **Concrete Analogies:** Abstract metrics are translated into tangible comparisons (e.g., *"Equivalent to X miles driven by car"* instead of just *"28 kg of $CO_2$"*).
* **Nudge Design:** By passively embedding the data into the UI, the friction for making sustainable choices is minimized, while immediately presenting actionable alternatives (repair, secondhand, older generations).

---

## 🤝 Open Source as a Communication Strategy

Publishing EcoTrace on GitHub is a deliberate strategy to foster **transparency and trust** (Fischhoff, 2007). Climate communication should not be a one-way street from experts to consumers, but an open, collaborative dialogue (Bucchi & Trench, 2014).

Anyone can inspect the codebase, trace the underlying carbon calculations, and audit the primary data sources (from *Apple PERs* to *Poore & Nemecek*). Disclosing the data architecture removes the groundwork for mistrust and misinformation.

### Contributing
We welcome any contributions to scale and improve this tool!
* **Expand the Database:** Help us add new lifecycle data or repairability scores.
* **Improve the Code:** Performance optimizations, refactoring, or bug fixes.
* **Porting:** Help us expand the plugin to work on other online retail platforms.

Feel free to open issues, fork the repo, and submit Pull Requests!

[📥 Download EcoTrace (.zip)](https://github.com/Maxation/EcoTrace/releases)
