# MPLADS work-level records — source and terms review

Retrieval / review date: **2026-10-31**
Scope: work-level MPLADS records (18th Lok Sabha) for the 7 Delhi MPs.
Existing capture reviewed: `data/raw/mplads.delhi.empoweredindian.2026-10-31.json` (unchanged).

## Summary

- **Empowered Indian (secondary).** Its Terms of Service give a licence for
  "personal, non-commercial transitory viewing only" and forbid copying the
  materials or using them "for any public display". Its FAQ says the data is
  "intended for public use" with citation. It also says API documentation,
  rate limits and usage guidelines are not public, and that API access is
  obtained by contacting the team. The terms therefore conflict, and the API
  is not offered openly. **No new capture was made** and
  `scripts/fetch_empowered_delhi.py` was **not changed**.
- **MoSPI eSAKSHI (official).** The portal is mplads.mospi.gov.in. Its public
  dashboard works without login, but its data is loaded by deliberately
  obfuscated JavaScript calls. I found no public, linkable, work-level page or
  download. I could not retrieve a licence or copyright statement for the
  portal.
- **Dataful datasets 22565/22566/22567 (secondary, Factly).** These are
  work-level MoSPI-derived tables. The pages show download buttons, but the
  page did not render fully and the Terms and Conditions text did not load.
  It is **unconfirmed** whether download is free, needs login, or needs
  payment. The pages state no licence.
- **Verification.** **0 of 5** sampled workIds could be confirmed against an
  official public page without login.
- **Recommendation: (b) link-only** for work-level records. Work rows should
  not be republished. Section 6 also covers the Empowered Indian aggregates.

## 1. Sources reviewed

### 1.1 Empowered Indian — secondary, non-official

| Item | Finding |
|---|---|
| Site | https://empoweredindian.in (React single-page app) |
| API | https://api.empoweredindian.in/api |
| Official? | No. FAQ: "Is this an official government website? No. This is an independent public-interest project that aggregates and visualizes data from official sources." |
| robots.txt (site) | https://empoweredindian.in/robots.txt → `User-agent: * / Allow: /` plus a sitemap link. |
| robots.txt (API) | https://api.empoweredindian.in/robots.txt → HTTP 404 (`{"error":"Not Found","message":"Route /robots.txt not found"}`). There is no robots policy for the API host. |
| Login / key | The existing script did not need a key. The FAQ says documented API access is given on request (quoted below). |
| Terms URL | https://empoweredindian.in/terms-of-service (listed in the sitemap). The page is rendered client-side. I read the text from the site's own public bundle `/assets/js/TermsOfService-zRnyulLO.js`. The "Last updated:" field has no date in the bundle. |
| Contact | roshan@empoweredindian.in (from the Terms and About pages) |

**Terms of Service, §2 "Use License" (verbatim):**

> Permission is granted to temporarily access the Service for personal,
> non-commercial transitory viewing only. This is the grant of a license, not
> a transfer of title, and under this license you may not:
> - Modify or copy the materials
> - Use the materials for any commercial purpose or for any public display
> - Attempt to reverse engineer any software contained on the Service
> - Remove any copyright or other proprietary notations from the materials

**§3 "Data and Information":**

> The MPLADS data presented on this platform is sourced from official
> government portals and public records. While we strive for accuracy, we do
> not guarantee the completeness or accuracy of the information provided.
> Users should verify information independently for critical decisions.

**§6 "Accuracy of Materials":**

> Empowered Indian does not warrant that any of the materials on its Service
> are accurate, complete, or current.

**FAQ, https://empoweredindian.in/faq (verbatim). It conflicts with the Terms:**

> **Can I use this data for research or journalism?** Absolutely! This data is
> intended for public use. We encourage researchers, journalists, and citizens
> to use this information for analysis, reporting, and advocacy. Please cite
> [Empowered Indian] as your data source.

> **Is there an API available for developers?** Yes, we provide API endpoints
> for accessing MPLADS data programmatically. API documentation with available
> endpoints, rate limits, and usage guidelines is not yet publicly available.
> Please reach out to us via the contact channels below if you need API access,
> and we'll provide the necessary documentation and guidance.

> **Why might project counts differ from official sources?** Project counts may
> vary due to different counting methodologies (individual vs. grouped
> projects), data processing time differences, or consolidation of multi-phase
> projects.

**Assessment**

- The binding licence text in the Terms is restrictive: no copying, no public
  display. The FAQ's encouragement is informal. It has no named licence,
  reuse grant, or redistribution clause.
- AGENTS.md says non-official sources are for discovery or cross-checking
  "unless their reuse terms clearly permit publication". These terms do not
  clearly permit it.
- The API's rate limits and usage guidelines are only given on request. An
  undocumented bulk crawl does not meet "terms permit automated access".
- **Result:** Task 3 (completeness fetch) was **not performed**, and the
  script was left unchanged.
- The current script also has a compliance issue for whoever owns it next. It
  sends a spoofed desktop-Chrome `User-Agent` and the site's own
  `Origin`/`Referer` headers. A future permitted fetch should identify itself
  honestly instead.

### 1.2 MoSPI MPLADS–eSAKSHI portal — official

| Item | Finding |
|---|---|
| Portal | https://mplads.mospi.gov.in/ (HTTP 200) |
| Public dashboard | https://mplads.mospi.gov.in/digigov/dashboard.html (HTTP 200, no login to view) |
| robots.txt | https://mplads.mospi.gov.in/robots.txt → HTTP 302 to `http://mplads.mospi.gov.in/digigov/Login.zul`. No robots policy is published. Unknown paths redirect to the login page. |
| Legacy portals | https://mplads.gov.in/ and https://www.mplads.gov.in/ gave no response (curl status 000) on 2026-10-31. https://mplads.sbi.co.in/ also gave no response. |
| Work-level public view | Not found. The dashboard script `/libs/simplegrid/preLoginDashboard.js` builds its endpoint paths from reversed strings and unicode-escaped headers (for example `/rest/PreLoginDashboardData/getTenureData`, `/rest/PreLoginDashboardData/getRedirectUrl`). The data is loaded by POST requests in the page, not from linkable URLs or downloads. I did **not** call these endpoints directly. The obfuscation shows they are not meant to be called that way, so calling them would conflict with the "never bypass access controls" rule. |
| Licence | Not found on the portal. The portal home and dashboard HTML contain only an "Important Information" modal about the process. https://mospi.gov.in/copyright-policy is rendered client-side, and neither curl nor WebFetch returned its text, so MoSPI's copyright wording is **unverified**. |
| GODL / NDSAP | https://www.data.gov.in/Godl returned HTTP 403 to WebFetch, and curl got only the navigation shell, so the GODL text was **not retrieved**. I found no data.gov.in catalogue entry for 18th Lok Sabha MPLADS works. GODL applies to data published under it on data.gov.in. It cannot be assumed for eSAKSHI dashboard data. |

The portal's own description, from the dashboard and home-page modal
(verbatim excerpts):

> The MPLADS–eSAKSHI web portal (www.mplads.mospi.gov.in) was introduced with
> effect from 1 April 2023 to manage the revised fund-flow procedure under the
> MPLADS Scheme.

> Data on the eSAKSHI portal are updated in real time based on inputs provided
> by different stakeholders through their respective logins. … Only those
> works that are marked as complete by the Implementing Agencies are reflected
> as completed works on the public dashboard.

Context: PolicyEdge, 6 March 2026, reports that a revamped public dashboard
lets citizens "track works recommended, sanctioned, and completed in their
specific constituencies" and gives "detailed expenditure figures for both
ongoing and completed works". The article does not say which work fields
appear or whether downloads exist.
https://www.policyedge.in/p/mospi-revamped-public-dashboard-of-mplads-esakshi-portal

### 1.3 Dataful (Factly) — secondary, non-official

| Dataset | Title (as shown) | Rows × cols | Period | Last updated |
|---|---|---|---|---|
| https://dataful.in/datasets/22567 | 18th Lok Sabha MPLADS: State, Lok Sabha Constituency wise Work Name wise total amount of works recommended by each MP | 175,298 × 18 | 2024–2026 | 07 Sep 2026 |
| https://dataful.in/datasets/22566 | … Work Name wise total amount spent on works completed by each MP | 44,169 × 18 | 2023–2026 (as on 18-08-2026) | 07 Sep 2026 |
| https://dataful.in/datasets/22565 | … Work Name, Vendor Name wise amount spent by each MP | 143,257 × 15 | 2024–2026 | 19 Sep 2026 |

- Every page names its source as "Ministry of Statistics and Programme
  Implementation", links to mplads.mospi.gov.in, and suggests the citation
  "Ministry of Statistics and Programme Implementation. (2026) … Dataful".
- Every page shows "Download CSV / XLSX / PARQUET" buttons, plus "Sign in" and
  "Pricing" links in the header. The pages showed "Loading…" placeholders.
  Whether a download needs sign-in or payment **could not be confirmed**
  without clicking through or logging in, and I did neither.
- https://dataful.in/terms-and-conditions/ returned only its title, with no
  clause text. https://dataful.in/pricing/ returned HTTP 404. The pages state
  no licence. The footer reads "© 2014-2026 Factly Media & Research".
- **Assessment:** this is useful for cross-checking, and possibly a route to
  the MoSPI work-level data. Do not use it for publication until a person has
  read Dataful's T&C and the download conditions in a browser.

## 2. Verification sample

I chose five workIds from the existing capture, from different MPs and with
both statuses.

| workId | MP / constituency (capture) | Status | Amount (₹, capture) | IDA (capture) | Verified on an official public page? |
|---|---|---|---|---|---|
| 212644 | Praveen Khandelwal / CHANDINI CHOWK | completed | 639,562 (finalAmount) | NORTH(COMMISSIONER MCD NORTH_IDA) | **No** |
| 203719 | Harsh Malhotra / EAST DELHI | completed | 121,336 | EAST(COMMISSIONER EAST) | **No** |
| 310745 | Bansuri Swaraj / NEW DELHI | recommended | 778,584 | CENTRAL(COMMISSIONER MCD (CENTRAL DISTRICT)) | **No** |
| 304742 | Manoj Tiwari / NORTH EAST DELHI | recommended | 6,351,000 | NORTH EAST(COMMISSIONER MCD NORTH EAST) | **No** |
| 250458 | Yogender Chandolia / NORTH WEST DELHI | completed | 3,731,085 | NORTH WEST(COMMISSIONER NORTH WEST) | **No** |

Why none could be verified:

- eSAKSHI has no public URL or download per work. Its data endpoints are
  obfuscated in-page calls, and I deliberately did not call them.
- The legacy portals mplads.gov.in and mplads.sbi.co.in did not respond.
- The Dataful previews did not render, and downloading is unconfirmed.

**Next step:** a person should open
https://mplads.mospi.gov.in/digigov/dashboard.html in a normal browser, choose
Lok Sabha, tenure 18, then the Delhi constituency. They should note whether
the five works above appear with matching description, amount, IDA and status,
and record the date and any screenshots.

Internal consistency checks on the existing capture. These are observations
for the merge owner; I changed nothing.

- Works carry `constituency` values that match each MP's profile. Joining on
  state plus constituency is consistent. Note the spelling "CHANDINI CHOWK".
- Each work's `mp_id` (for example `6a98d96eddf878e1e6c8a09b`) **differs**
  from the profile `mp_id` (for example `6a98d96eddf878e1e6c89b76`), and some
  works have no `mp_id`. Do not join works to MPs on `mp_id`.
- Status values in the sample are `completed` and `recommended` only.
  Amounts appear as `finalAmount` or `recommendedAmount` depending on the
  record.

## 3. What was captured

No new capture was made. The existing capture is unchanged.

| MP slug | recommendedWorksCount (profile) | completedWorksCount (profile) | Rows returned by API in the original run (`works_sample_count`) | Rows stored in capture |
|---|---|---|---|---|
| chandni-chowk-delhi | 69 | 35 | 69 | 20 |
| east-delhi-delhi | 113 | 53 | 100 | 20 |
| new-delhi-delhi | 110 | 41 | 91 | 20 |
| north-east-delhi-delhi | 23 | 6 | 23 | 20 |
| north-west-delhi-delhi | 59 | 11 | 59 | 20 |
| south-delhi-delhi | 134 | 41 | 91 | 20 |
| west-delhi-delhi | 65 | 31 | 65 | 20 |

Notes:

- `works_sample_count` in the existing file is the length of the API response
  before truncation. It is **not** the number of stored rows, which is 20 for
  every MP. Downstream code should not treat it as the stored-row count.
- For East, New Delhi and South Delhi, the API response itself was below
  `recommendedWorksCount`. The cause is either an undocumented page limit
  (100 for East) or the counting differences the FAQ describes. I did not
  probe pagination, because automated access is not cleared.

## 4. Recommendation

**(b) Link-only for MPLADS work-level records.** For each MP, show:

- a link to the official eSAKSHI public dashboard
  (https://mplads.mospi.gov.in/digigov/dashboard.html), labelled as the
  official source;
- optionally, a "secondary source — independent aggregator" link to the
  Empowered Indian MP page;
- no republished work rows, descriptions or amounts.

Keep the 20-row raw capture as an immutable internal capture for discovery
and cross-checking. Do not export it to `data/processed` for display.

Reasoning, tied to AGENTS.md:

1. *"Use PRS, Empowered Indian, Nagrik, and other non-official sites for
   discovery or cross-checking unless their reuse terms clearly permit
   publication."* The Empowered Indian Terms forbid copying and public
   display, and the FAQ's encouragement is informal and conflicts with them.
   This is not a clear permission, so option (a) is ruled out.
2. *"Do not publish a fact until its source and review status are clear."*
   None of the five sampled works could be confirmed on an official page, so
   the review status is not clear.
3. *"Prefer official … MPLADS … sources"* and *"Store links and permitted
   metadata when document or map reuse is uncertain."* Linking to the official
   eSAKSHI dashboard does exactly this.
4. *"Never bypass … access controls."* The only official work-level route is
   obfuscated in-page calls, which rules out automated capture from eSAKSHI.
5. Option (c), hiding everything, would drop a useful official link. Option
   (b) keeps the reader pointed at the authoritative source with no reuse risk.

**Aggregate totals, flagged for the merge owner.** The profile totals already
captured from Empowered Indian fall under the same Terms. Examples are
`allocatedAmount`, `totalExpenditure`, `recommendedWorksCount` and
`utilizationPercentage`. Treat them as cross-check values too, until they are
confirmed against the eSAKSHI dashboard or written permission is obtained.

## 5. Paths to upgrade to option (a) or to official publication

1. Email roshan@empoweredindian.in for written permission to republish with
   attribution, plus API documentation and rate limits. If granted, store the
   permission text and date under `data/raw/`, then update the fetch script.
   The update would remove truncation, paginate as documented, wait at least
   1 s between requests, send an honest descriptive User-Agent with no spoofed
   Origin/Referer, and stop on any 4xx or 429.
2. Have a person verify works manually on the eSAKSHI public dashboard in a
   browser. Record the dates, then add a per-work `verified_official` flag.
3. Ask MoSPI (MPLADS Division) whether eSAKSHI data is released under GODL or
   on data.gov.in, or file an RTI request for the Delhi district work lists.
   The scheme makes district authorities keep and display these lists.
4. Have a person check Dataful's T&C and download conditions in a browser. If
   the data is openly licensed with attribution to MoSPI, it could serve as a
   bulk cross-check.
