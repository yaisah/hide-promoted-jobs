# Phase 4: Verification and Regression Testing

## Status

Complete on 2026-07-01. Chrome and Brave completed the required live workflow
matrix with no known organic-card false positives and no extension-caused
console errors. The product owner then confirmed during normal sessions in both
browsers that promoted job cards were hidden.

## Test Environment

- Source branch: `codex/phase-4-verification`
- Tested source: Phase 3 commit `bb2273d`
- Extension: Hide Promoted Jobs `1.5`
- Extension ID: `jhedelbndagmgladjfklnpohcolgoiml`
- Google Chrome: `149.0.7827.201`
- Brave: `149.1.91.180`
- Platform: macOS
- Automated baseline: `npm run check` passed lint, formatting, 29 tests, and
  extension packaging before live verification.

The unpacked `ext/` directory was reloaded in both browsers before testing so
the Phase 3 `all_frames` manifest change was active.

## Live Matrix

| Scenario                              | Chrome | Brave | Evidence                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------- | -----: | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Direct LinkedIn Jobs search load      |   Pass |  Pass | On `/jobs/search/`, every loaded card with an exact `Promoted` footer marker was hidden. Chrome measured 25 of 25 promoted cards hidden with zero visible promoted markers; Brave exposed no promoted result rows while the selected job detail remained usable.                                                          |
| Dynamic or appended cards             |   Pass |  Pass | LinkedIn currently paginates this layout instead of using infinite scroll. Page 2 replaced the result set without a hard reload. Chrome observed 25 new IDs: 24 promoted cards hidden and one organic card visible. Brave moved to `start=25`; the replacement promoted rows remained absent and the detail view updated. |
| Filter change                         |   Pass |  Pass | Applying **Past week** through LinkedIn's UI updated the URL with `f_TPR=r604800` and refreshed results without a hard reload. Promoted rows remained hidden in both browsers.                                                                                                                                            |
| Client-side navigation into Jobs      |   Pass |  Pass | Starting on `/feed/`, clicking LinkedIn's Jobs navigation produced `/jobs/` with a same-origin `/preload/` frame. Opening a recent search kept the content script active in the frame; promoted cards stayed hidden and an organic result remained visible.                                                               |
| Toggle off and on                     |   Pass |  Pass | OFF immediately restored the promoted result list, including exact visible `Promoted` markers. ON immediately removed those result cards again without reloading. The job detail pane and surrounding LinkedIn UI remained intact.                                                                                        |
| Browser restart and state persistence |   Pass |  Pass | Each browser was fully quit with hiding enabled, reopened in the same profile, and returned with promoted cards still hidden. The Brave extension details page also reported the extension `On` after restart.                                                                                                            |
| Organic-card false-positive check     |   Pass |  Pass | `/jobs/collections/top-applicant/` displayed two organic cards in each browser. Chrome confirmed zero hidden ownership metadata; Brave confirmed both cards remained visible. Organic cards also remained visible in filtered and client-navigation searches.                                                             |
| Unsupported LinkedIn page             |   Pass |  Pass | `/feed/` remained intact, including a promoted feed post, and `/jobs/view/:id/` preserved the visible `Promoted by hirer` text. Neither context received extension-owned hidden-card metadata.                                                                                                                            |
| Console and extension health          |   Pass |  Pass | Chrome showed no errors from `hide.js`, `detection.js`, `background.js`, or the extension origin; observed React/network messages originated from LinkedIn assets. Brave error collection was enabled before the matrix and inspected afterward; its active service worker had no collected error entry.                  |

## Detailed Evidence

### Chrome

- `/jobs/`: 3 promoted collection cards found and all 3 hidden.
- Direct `/jobs/search/`: 25 loaded promoted cards, all 25 hidden, and zero
  visible promoted markers.
- Dynamic page replacement: all 25 card IDs changed; 24 promoted cards were
  hidden and one organic card remained visible.
- Organic collection: 2 loaded organic cards, 0 hidden.
- Client navigation: `/jobs/` exposed one `/preload/` frame; the recent-search
  frame contained 25 card boundaries with 24 promoted cards hidden and one
  organic card visible.
- Unsupported feed and job-detail contexts contained no extension-owned hidden
  or restoration metadata.
- Full browser restart preserved the enabled state and hidden result set.

### Brave

- Direct and filtered searches exposed pagination and the selected job detail,
  but no promoted result rows while the extension was ON.
- Turning the extension OFF exposed the full result list with approximately 25
  exact `Promoted` markers; turning it ON removed those rows immediately.
- Page 2 changed the active job and added `start=25` without exposing promoted
  result rows.
- Organic collection: 2 organic cards remained visible.
- Feed-to-Jobs navigation created a `/preload/` frame. A recent search loaded in
  that frame with promoted rows hidden and one organic row visible.
- Full browser restart preserved hiding. The extension details page reported
  version `1.5`, enabled state `On`, a live service worker, the expected LinkedIn
  site access, and no collected error entry.

## Defects and Deviations

No blocker, high-severity, or extension-caused defect was found.

LinkedIn's current desktop search used numbered pagination during testing, so
the dynamic-content row was executed by changing pages without a hard reload.
This exercised client-side result replacement and produced a complete new
result set. Appended-node processing and recycled-card restoration are covered
separately by the automated content-script tests.

LinkedIn-origin React and network console messages were observed in Chrome.
They did not reference the extension origin or its scripts and did not affect
the tested workflows.

## Agent Review

- QA Agent `Franklin` independently derived the evidence checklist from the PRD
  and Phase 2/3 contracts.
- The Lead / Integrator executed the browser matrix and recorded sanitized
  aggregate evidence.
- Reviewer Agent `Descartes` independently audited the report and current
  worktree on 2026-07-01. After the documentation corrections recorded here,
  the reviewer passed the technical gate with no retest required and found no
  blocker, high-severity defect, or privacy leak.
- Product owner Yaisah tested normal LinkedIn Jobs browsing in both Chrome and
  Brave and confirmed that promoted job cards were hidden.

## Gate Decision

The technical portion of Phase 4 passes:

- Every required workflow was exercised in both target browsers.
- Confirmed promoted job cards were hidden while enabled.
- Confirmed organic job cards remained visible.
- Toggle restoration and restart persistence worked.
- No blocker or high-severity defect remains open.
- No extension-caused uncaught console error was found.

Product-owner acceptance passed on 2026-07-01. Yaisah confirmed the expected
behavior after testing normal LinkedIn Jobs browsing in both target browsers.
Phase 4 is complete.
