# Changelog

All notable changes to this maintained fork are documented here.

## 1.6.0 - 2026-07-01

### Added

- Manifest V3 service-worker and toolbar-action support for current Chromium
  browsers.
- Frame-aware handling for LinkedIn's `/preload/` Jobs navigation flow.
- Isolated, conservative promoted-card detection for classic search results and
  Jobs home collection cards.
- Sanitized fixtures and automated coverage for detection, dynamic hydration,
  navigation, restoration, permissions, and release metadata.
- Chrome and Brave installation, update, rollback, troubleshooting, privacy,
  and maintenance documentation.

### Changed

- Mutation handling now processes affected subtrees instead of repeatedly
  rescanning the full document.
- Hidden cards removed by LinkedIn virtualization are restored before the
  extension releases its ownership metadata.
- Disabling the extension restores exact original inline display values and
  removes all extension ownership metadata.
- Unsupported pages and uncertain card structures fail open.

### Verified

- All 32 release tests, lint, formatting, dependency audit, and extension
  packaging passed during release preparation.
- Direct loads, filters, client navigation, pagination, toggle restoration,
  restart persistence, organic-card checks, and unsupported pages passed in
  Chrome 149 and Brave 149 on macOS.
- The final checksum-verified `1.6.0` archive installed cleanly in fresh,
  disposable Chrome 149 and Brave 149 profiles with the extension enabled and
  its service worker active.
- The product owner confirmed that promoted job cards remained hidden during
  normal browsing in both target browsers.

## 1.5 - 2025-01-26

- Upstream baseline published by
  [`winterhazel/hide-promoted-jobs`](https://github.com/winterhazel/hide-promoted-jobs).
