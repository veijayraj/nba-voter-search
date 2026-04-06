# NBA Award Voter Database

An interactive data explorer and research tool designed to make NBA award voting history transparent and accessible.

**Live Website:** [https://veijayraj.github.io/nba-voter-search/](https://veijayraj.github.io/nba-voter-search/)

### The Problem
Official NBA award voting results are released as individual, unstructured PDFs buried deep within the [NBA Communications website](https://pr.nba.com/). For researchers or fans, tracking a specific voter’s history or analyzing voting patterns across seasons currently requires manually downloading, opening, and cross-referencing dozens of separate documents to piece together a single person's voting record.

### The Solution
This project extracts data from those "buried" PDFs into a centralized, searchable database. It allows users to:
* **Deep-link** into specific player or voter profiles.
* **Filter by Ballot Rank** (e.g., see only who voted a specific player 1st vs. 5th for MVP).
* **View Multi-Season History** for any individual voter in a single, unified interface.

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: Version 20 (LTS) is recommended for compatibility.
* **npm**: Installed with Node.

### Installation
1. **Clone the repository:**
   git clone https://github.com/veijayraj/nba-voter-search.git
   cd nba-voter-search

2. **Install dependencies:**
   npm install

3. **Run locally:**
   npm run dev

The app will be available at `http://localhost:5173/`.

---

## 🛠 Tech Stack
* **Frontend:** React, TypeScript, Vite
* **Data Engineering:** Python (**pdfplumber**)
* **Styling:** Modern CSS3 (Flexbox/Grid)
* **Deployment:** GitHub Pages

---

## 📊 Data Extraction & ETL
The data is processed using a custom **ETL pipeline** written in Python. 
1. **Extract:** It parses official NBA award PDFs using `pdfplumber`.
2. **Transform:** It cleans inconsistent table headers and handles "messy" data where voter affiliations or player names vary by year.
3. **Load:** It exports a structured JSON schema used by the React frontend for instant, client-side filtering without the need for a live backend database.

---

## 📝 Roadmap & TODOs

### Data Integrity & Expansion
- [ ] **Historical Data:** Add voting data for the **2014–2017 seasons** to provide a full decade of coverage.
- [ ] **Data Fixes:** Resolve formatting errors in the **2023 All-Defensive** and **2023 All-NBA** PDF parses (currently broken due to unique table layouts in those specific documents).

### Features
- [ ] **Analytics Dashboard:** Create a dedicated page highlighting:
    - **Outliers:** Voters who deviated significantly from the media consensus.
    - **Interesting Facts:** High-level stats on the most frequent voters and their patterns.
    - **Voter Longevity:** Tracking the longest-tenured members of the award media pool.
- [ ] **Enhanced Search:** Implement fuzzy search for voters with common names or those who have changed media affiliations.

---

## ⚠️ Known Issues
* **2023 Season:** The **All-Defensive** and **All-NBA** datasets for 2023 are currently disabled/broken. These specific PDFs utilize a non-standard grid layout that the current Python extraction script is being updated to handle.