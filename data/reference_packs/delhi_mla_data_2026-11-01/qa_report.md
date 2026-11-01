# QA Report

* **Check 1: Exactly 70 unique `ac_number`s (1–70) in each per-constituency file; no duplicates.**
  * **Result:** **PASS** (`mla_roster.csv`: 70 unique; `ac_to_pc_mapping.csv`: 70 unique; `mla_activity_prs.csv`: 70 unique; `mla_affidavits_2025.csv`: 70 unique; `mla_election_results_2025.csv`: 70 unique).
* **Check 2: Every roster MLA joins to the affidavit, results, and PRS files by `ac_number`.**
  * **Result:** **PASS (70/70 join on `ac_number`)**. Name variations across files (e.g., `Punardeep Singh Sawhney` vs `Punardeep Singh Sawney (Sabby)`, `Abhay Kumar Verma` vs `Abhay Verma`, `Parvesh Sahib Singh` vs `Shri Pravesh Sahib Singh`) are preserved as published in each source and logged in `discrepancies.csv`.
* **Check 3: 10 assembly seats per Lok Sabha seat in `ac_to_pc_mapping.csv`.**
  * **Result:** **PASS**
    * PC 1 (`Chandni Chowk`): 10 ACs (AC 4, 14, 15, 16, 17, 18, 19, 20, 21, 22)
    * PC 2 (`North East Delhi`): 10 ACs (AC 2, 3, 63, 64, 65, 66, 67, 68, 69, 70)
    * PC 3 (`East Delhi`): 10 ACs (AC 41, 54, 55, 56, 57, 58, 59, 60, 61, 62)
    * PC 4 (`New Delhi`): 10 ACs (AC 23, 24, 25, 38, 39, 40, 42, 43, 44, 50)
    * PC 5 (`North West Delhi`): 10 ACs (AC 1, 5, 6, 7, 8, 9, 10, 11, 12, 13)
    * PC 6 (`West Delhi`): 10 ACs (AC 26, 27, 28, 29, 30, 31, 32, 33, 34, 35)
    * PC 7 (`South Delhi`): 10 ACs (AC 36, 37, 45, 46, 47, 48, 49, 51, 52, 53)
* **Check 4: Affidavit `movable_assets_inr + immovable_assets_inr = total_assets_inr` for every populated row.**
  * **Result:** **PASS** on verified split row AC-15 (`9236090 + 2587500000 = 2596736090`); remaining 69 rows have `movable_assets_inr` and `immovable_assets_inr` left blank because only the summary `total_assets_inr` table was extracted from MyNeta.
* **Check 5: Results `winner_votes - runner_up_votes = margin_votes`.**
  * **Result:** **PASS** on all fully populated rows:
    * AC-5 (Badli): `61192 - 46029 = 15163`
    * AC-14 (Shalimar Bagh): `68200 - 38605 = 29595`
* **Check 6: Results winner = roster MLA, unless a by-election or change is documented.**
  * **Result:** **PASS (70/70 match)**. No resignations, deaths, or by-elections have occurred in the 8th Delhi Assembly between February 2025 and November 1, 2026.
* **Check 7: Percentages between 0 and 100; no negative amounts.**
  * **Result:** **PASS** (all percentages in `[0, 100]`, all rupee and vote integers `>= 0`).
* **Check 8: Every row has a `source_url` and `retrieved_at`.**
  * **Result:** **PASS (100% of rows across all files carry both `source_url` and `retrieved_at = 2026-11-01`)**.
* **Check 9: Counts of blanks per column, with the reason.**
  * `mla_roster.csv`: `name_variants` (52 blanks — no variant spelling found), `ministerial_role` (63 blanks — non-ministers), `special_role` (67 blanks — only Speaker, Deputy Speaker, and LoP hold schema-listed special roles).
  * `mla_affidavits_2025.csv`: `declared_pending_criminal_cases` & `education_category` (25 blanks — MyNeta alphabetical summary snippet cutoff), `total_assets_inr` (30 blanks — snippet cutoff), `liabilities_inr` (31 blanks — snippet cutoff), `movable_assets_inr` & `immovable_assets_inr` (69 blanks — requires per-candidate page crawl), `eci_affidavit_url` (70 blanks — ECI portal behind CAPTCHA).
  * `mla_activity_prs.csv`: `attendance_pct`, `questions_asked`, `debates`, `private_member_bills` (70 blanks — 10 exempted by office [7 Ministers, Speaker, Deputy Speaker, Chief Whip]; 60 require interactive browser download of `/files/mlatrack/delhi/8/delhi_assembly_term_8.csv`).
  * `mla_election_results_2025.csv`: `winner_votes` & `margin_votes` (65 blanks), `runner_up_votes` (68 blanks), `total_valid_votes` & `turnout_pct` (70 blanks — ECI Feb 2025 dynamic results page archived).
* **Check 10: Ministers listed match an official source.**
  * **Result:** **PASS (7/7 match `https://delhi.gov.in/cmo` and `https://delhi.gov.in/council-of-ministers-office`)**.
