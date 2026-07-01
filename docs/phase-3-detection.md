# Phase 3: Detection and Hiding Logic

## Status

Complete on 2026-07-01. Implementation, automated verification, packaging, and
independent code review passed. The full live Chrome/Brave workflow matrix is
reserved for Phase 4 and requires reloading the unpacked extension so Chromium
registers the new frame-injection manifest entry.

## Delegated Agent Work

- Detection Agent `Hypatia` implemented `ext/js/detection.js` as an isolated,
  non-mutating classifier.
- QA Agent `Lorentz` independently reviewed the Phase 2 evidence and produced
  the acceptance matrix used to expand the runtime and fixture tests.
- Reviewer Agent `Averroes` performed the post-integration code and test review.
- The Lead / Integrator owned runtime integration, test implementation, live
  verification, and the final gate decision.

## Runtime Design

The manifest injects `detection.js` before `hide.js` into every matching
LinkedIn frame. Each document owns one observer and only operates on these
contexts:

- `/jobs` and `/jobs/`
- `/jobs/search` and descendants
- `/jobs/collections` and descendants
- `/preload` only when the document is inside a frame

Unsupported paths restore any extension-owned changes and otherwise fail open.
Mutation callbacks scan only added elements or the parent of an added text node.
The detector also checks the affected node's owning card, allowing a virtualized
placeholder to be reconsidered after hydration without rescanning the full list.

## Detection Contracts

### Classic Results

A promoted result must have all of the following in one card:

- `li[data-occludable-job-id].scaffold-layout__list-item` boundary
- `.job-card-container[data-job-id]` loaded-card host
- A nested link containing `/jobs/view/`
- An exact localized leaf `p` or `span` marker inside
  `li.job-card-container__footer-item`

### Jobs Home SDUI

A promoted result must have all of the following:

- An exact localized leaf `p` or `span` marker
- A containing collection link whose path starts `/jobs/collections/` and has a
  real `currentJobId` query parameter
- A containing `[data-display-contents]` wrapper
- The smallest owning ancestor with exactly one qualifying collection link and
  one non-empty accessible dismiss button in a separate structural branch

Generated LinkedIn classes, generic-list text, substring matches, and fixture
metadata are not used.

## Hiding and Restoration

Only detector-returned card boundaries receive `display: none !important`. The
runtime marks each changed card and records its original inline display value,
priority, and whether a style attribute existed. Disabling restores those exact
values and removes all extension ownership attributes. Re-enabling performs one
document scan and hides confirmed promoted cards again.

## Automated Evidence

`npm run check` passes:

- ESLint
- Prettier validation
- 29 Node tests
- Manifest V3 extension packaging

The tests parse all six sanitized fixtures after removing every synthetic
`data-fixture-*` attribute. They cover promoted and organic classification,
exact-label and malformed-structure false positives, affected-subtree hydration,
frame and path limits, mutation-local processing, toggle restoration, re-enable,
client-side navigation, locale failure, fetch failure, permissions, and build
structure.

The independent reviewer initially found recycled-card restoration,
attribute/text hydration, over-broad SDUI ownership, action-branch mutation,
and unsupported-page performance defects. Adversarial tests reproduce each
case, the implementation fixes them, and the final reviewer gate reports no
remaining findings. The release ZIP contains only the intended `detection.js`
and `hide.js` content scripts.

## Maintenance Notes

When LinkedIn changes its markup:

1. Reproduce the failure in the exact document context, including `/preload/`
   frames.
2. Update the Phase 2 selector evidence before changing detection rules.
3. Add a sanitized promoted or organic fixture that captures the new stable
   relationship without account, company, search, or tracking data.
4. Change `detection.js`, keeping it pure and fail-open.
5. Run `npm run check`, then repeat the live toggle and navigation matrix.

Localized labels remain in `ext/js/langs.json`. Unknown document languages fail
open until an explicit label is configured.
