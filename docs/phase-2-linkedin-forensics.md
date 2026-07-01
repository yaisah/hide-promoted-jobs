# Phase 2: LinkedIn Page Forensics

## Status

Complete on 2026-07-01. This document records the live layout evidence,
sanitized fixtures, selector decision, and implementation boundaries approved
for Phase 3.

## Method and Privacy

The inspection used the logged-in English LinkedIn Jobs experience in Google
Chrome `149.0.7827.201` with the Manifest V3 extension enabled. It covered
direct loads, a date filter, scrolling, pagination, collection views, and
client-side navigation from Jobs home into search.

No raw DOM, account details, company names, role names, locations, tracking
parameters, or screenshots were saved in the repository. The fixtures retain
only observed element relationships and stable attribute/class contracts, with
invented placeholder content. Counts below are point-in-time observations, not
product invariants.

## Path and Layout Inventory

| User view                      | Document path                                                                 | Layout                         | Card boundary                                                               | Promoted marker                                                         | Phase 3 status                      |
| ------------------------------ | ----------------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------- |
| Jobs home recommendations      | `/jobs/`                                                                      | SDUI                           | Anonymous `div` card containing one collection link and one dismiss control | Exact localized leaf `p` inside the job link                            | Supported                           |
| Direct search                  | `/jobs/search/`                                                               | Classic two-pane               | `li[data-occludable-job-id].scaffold-layout__list-item`                     | Exact localized leaf `span` inside `li.job-card-container__footer-item` | Supported                           |
| Filtered search                | `/jobs/search/` plus filters                                                  | Classic two-pane               | Same as direct search                                                       | Same as direct search                                                   | Supported                           |
| Search after in-app navigation | Top document remains `/jobs/search/`; visible results document is `/preload/` | Classic two-pane inside iframe | Same as direct search inside the frame                                      | Same as direct search inside the frame                                  | Supported; requires frame injection |
| Recommended collection         | `/jobs/collections/recommended/`                                              | Classic two-pane               | Same classic result-card boundary                                           | Same classic footer marker                                              | Supported                           |
| Top-applicant collection       | `/jobs/collections/top-applicant/`                                            | Classic two-pane               | Same classic result-card boundary                                           | Same classic footer marker if present; none observed                    | Supported                           |
| Standalone job detail          | `/jobs/view/:id/`                                                             | Detail page                    | No result-card list                                                         | Phrases such as `Promoted by hirer` are not ad markers                  | Fail open / no hiding               |

## Live Evidence

### Jobs Home SDUI

- The observed sample contained three promoted recommendation cards and two
  organic top-applicant cards.
- Classes on the card, link, and marker were generated hash-like tokens and are
  unsuitable as contracts.
- A promoted marker was a leaf `p` whose normalized text was `Promoted`.
- The marker lived inside an `a` pointing to a `/jobs/collections/.../` path
  with a `currentJobId` parameter.
- The link was wrapped by an element with `data-display-contents`.
- The card root was the wrapper's parent and contained two structural regions:
  content and a dismiss control.
- The marker and card had no useful ARIA role. The dismiss button had a
  descriptive `aria-label`, but that text is locale-dependent and cannot be the
  sole card contract.

### Direct and Filtered Search

- The unfiltered sample exposed 25 cards: 23 promoted and two organic.
- Every card used
  `li[data-occludable-job-id].scaffold-layout__list-item`.
- Loaded cards contained `.job-card-container[data-job-id]` and a
  `/jobs/view/:id/` link.
- The promoted marker was a leaf `span` within
  `li.job-card-container__footer-item`, itself inside the card footer list.
- With a date filter applied, all 25 sampled cards were promoted and retained
  the same card and marker contracts.
- Scrolling retained one 25-card list and exposed pagination controls. The
  current UI is paginated rather than infinite-scroll-only, although filters,
  virtualization, and navigation still replace or hydrate card nodes.

### Client-Side Navigation and Preload Frame

- Clicking a recent search from `/jobs/` navigated the visible URL to
  `/jobs/search/` without replacing the SDUI top document.
- LinkedIn rendered the visible classic search UI inside a same-origin iframe
  whose document path was `/preload/`.
- The frame contained 25 classic card boundaries; seven loaded cards exposed
  matching job-card hosts, job links, footer items, and exact promoted markers
  at the inspected viewport.
- The top document retained `data-hide-promoted-jobs="enabled"`, while the
  frame document had no diagnostic marker. This proves the current content
  script did not inject into the visible results frame.
- The top document also retained Jobs-home SDUI content during the transition,
  so a top-document scan can find stale or non-visible cards while missing the
  visible search results.

### Collections

- The recommended collection exposed 24 classic card boundaries. Seven loaded
  cards were promoted; the remaining 17 included virtualized placeholders or
  organic cards not yet hydrated at the inspected viewport.
- The top-applicant collection exposed two loaded classic organic cards and no
  promoted marker.
- Both collection paths therefore share the classic card boundary but must
  still fail open when a placeholder lacks a loaded job-card host.

## Selector Decision Record

**Decision:** Use document-local, card-local, structure-first classification.
Inject into matching LinkedIn frames, choose a card adapter from observed DOM
capabilities, and require an exact localized promoted marker inside that card.

### 1. Document Context

- Enable content-script injection in LinkedIn subframes for the `/preload/`
  document used by in-app navigation.
- Do not gate solely on `window.location.pathname === '/jobs/search/'`.
- Select an adapter by DOM capability:
  - classic adapter when a classic result list/card boundary exists;
  - SDUI adapter on Jobs-home collection cards;
  - no adapter on unsupported or detail-only documents.
- Each injected document owns its observer and only mutates cards in that
  document.

### 2. Classic Card Adapter - High Confidence

Candidate card:

```css
li[data-occludable-job-id].scaffold-layout__list-item
```

Required loaded-card evidence is a `.job-card-container[data-job-id]` containing
an `a[href*="/jobs/view/"]` job link.

Promoted evidence:

```css
li.job-card-container__footer-item
```

The footer item must contain a leaf text element whose normalized full text is
an exact configured promoted label. Virtualized placeholders without a loaded
job-card host remain visible and are reconsidered after hydration.

### 3. Jobs Home SDUI Adapter - Medium Confidence

1. Find a leaf `p` or `span` whose normalized full text exactly matches a
   configured promoted label.
2. Require the marker to be inside a job link whose path begins with
   `/jobs/collections/` and whose URL has `currentJobId`.
3. Require the link to be inside a `[data-display-contents]` wrapper.
4. Treat that wrapper's parent as the candidate card only when it contains one
   qualifying job link and one dismiss control.
5. Do not use any observed hash-like class as a selector.

The dismiss control is a structural boundary check. Its English `Dismiss ...`
label is diagnostic evidence, not the sole classification rule.

### 4. Localized Marker Rule

- Derive the locale from the document language, reducing regional values such
  as `en-US` to `en`.
- Normalize marker text with trimming, whitespace collapse, and lowercase.
- Compare the full leaf text against the configured localized labels.
- Do not match substrings. `Promoted by hirer` must not classify a job card as
  a promoted listing.

### 5. Hiding Boundary and Failure Mode

- Hide only a card returned by an approved adapter.
- Mark altered cards so disabling can restore only extension-owned changes.
- If the layout, card boundary, locale, or marker relationship is uncertain,
  leave the card visible.

## Strategy Ranking

| Rank | Strategy                                                        | Confidence | Decision                     |
| ---- | --------------------------------------------------------------- | ---------- | ---------------------------- |
| 1    | Classic card boundary plus card-local footer marker             | High       | Adopt                        |
| 2    | SDUI collection link plus exact marker and structural card root | Medium     | Adopt with strict validation |
| 3    | Exact marker anywhere in a generic `li`                         | Low        | Reject                       |
| 4    | Generated/hash-like LinkedIn classes                            | Low        | Reject                       |
| 5    | Path-only activation for `/jobs/search/`                        | Low        | Reject                       |
| 6    | Substring search across full card text                          | Unsafe     | Reject                       |

## Sanitized Fixture Catalog

| Fixture                        | View                     | Layout  | Classification |
| ------------------------------ | ------------------------ | ------- | -------------- |
| `jobs-home-promoted.html`      | Jobs home                | SDUI    | Promoted       |
| `jobs-home-organic.html`       | Jobs home                | SDUI    | Organic        |
| `classic-search-promoted.html` | Direct search            | Classic | Promoted       |
| `classic-search-organic.html`  | Direct search            | Classic | Organic        |
| `preload-search-promoted.html` | Client-navigation frame  | Classic | Promoted       |
| `top-applicant-organic.html`   | Top-applicant collection | Classic | Organic        |

The machine-readable catalog is
`test/fixtures/linkedin/fixture-index.json`. Fixture tests verify layout and
classification coverage, reject tracking parameters, absolute URLs, images,
profile links, email addresses, and require generic placeholder content.

## Edge Cases for Phase 3

- The visible search list may live in a `/preload/` iframe after client-side
  navigation.
- SDUI Jobs-home DOM may remain in the top document while framed search results
  are visible.
- Classic lists contain virtualized placeholders without `data-job-id` or a job
  link until hydrated.
- A filter can produce a page where every loaded result is promoted; hiding
  cards must not remove pagination, feedback, or surrounding layout.
- Current search uses pagination, but mutations still occur during hydration,
  filter changes, page changes, and future LinkedIn experiments.
- Footer metadata can combine `Saved`, `Promoted`, `Easy Apply`, and other
  statuses. Only an exact leaf marker is relevant.
- Detail panes can contain longer phrases such as `Promoted by hirer`; these
  are not promoted-card markers.
- Generated classes and A/B-tested SDUI wrappers may change independently of
  the semantic link/marker relationship.
- Only English was verified live. Existing translated labels remain unverified
  until a corresponding fixture or live check is added.
- Unknown layouts and unsupported LinkedIn pages must fail open.

## Phase 2 Acceptance Check

- [x] Path and layout inventory covers Jobs home, direct/filtered search,
      client navigation, preload frame, and collection views.
- [x] Initial load, filter, scroll/pagination, and client-side navigation were
      inspected.
- [x] Stable markers, boundaries, accessibility evidence, and localization
      behavior are recorded.
- [x] Six sanitized fixtures include three promoted and three organic examples.
- [x] The decision does not depend on generated classes or full generic-`li`
      text.
- [x] Automated fixture privacy and coverage checks pass.

## Sources

- Live LinkedIn Jobs DOM inspection on 2026-07-01; raw DOM was not retained.
- `test/fixtures/linkedin/fixture-index.json` and its sanitized HTML fixtures.
- `test/fixture-coverage.test.js` for fixture privacy and coverage enforcement.
- `ext/js/hide.js` for comparison with the current path and global-`li` logic.
