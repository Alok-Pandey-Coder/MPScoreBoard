# Mera MP, Mera Report Card - Delhi MLAs (8th Assembly)

* **Dataset Scope:** Verified public-record dataset for all 70 Members of the 8th Legislative Assembly of the NCT of Delhi (elected February 2025, term 2025–2030), prepared for the *Mera MP, Mera Report Card* pipeline as of `2026-11-01`.
* **Collection Methodology:**
  1. **Roster & Office-Bearers:** Extracted from the official Delhi Legislative Assembly Secretariat Member Contact PDF (`2025-04/list_of_member.pdf`), Directory (`delhiassembly.delhi.gov.in/dlas/directory`), and Inception roll (`delhiassembly.delhi.gov.in/dlas/members-inception-delhi-assembly`). Personal residential addresses and personal mobile numbers were stripped in compliance with Rule 9.
  2. **Council of Ministers:** Extracted from the Government of NCT of Delhi Official Portal (`delhi.gov.in/cmo` and `delhi.gov.in/council-of-ministers-office`).
  3. **AC-to-PC Mapping:** Extracted from Schedule XIII of the Election Commission of India's *Delimitation of Parliamentary and Assembly Constituencies Order, 2008*.
  4. **Affidavits:** Extracted from the ADR/MyNeta Delhi 2025 Winners repository (`myneta.info/Delhi2025`) and the ADR Winning Candidates analytical report (`Delhi_Assembly_Elections_2025_Winning_Candidates_FinalVer_English.pdf`), as `affidavit.eci.gov.in` requires CAPTCHA verification.
  5. **Legislative Activity:** Checked against PRS Legislative Research (`prsindia.org/mlatrack?state=Delhi&assembly_term=8`), documenting the active tracking window (`2025-02-20` to `2025-04-02`) and formal attendance exemptions for the 7 Ministers, Speaker, Deputy Speaker, and Chief Whip.
  6. **MLALAD Funds:** Checked against the Urban Development Department portal (`udd.delhi.gov.in/mlalad-schemes`); omitted because the department has not published any sanction order PDFs or summary tables for the 8th Assembly (latest published orders are from November 2022 for FY 2021–22).
