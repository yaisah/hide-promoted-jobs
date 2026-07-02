# Phase 1: Manifest V3 Migration

## Goal

Restore the extension runtime in current Brave and Google Chrome without changing LinkedIn card-detection behavior.

## Migration Scope

- Converted `ext/manifest.json` from Manifest V2 to Manifest V3.
- Replaced `browser_action` with `action`.
- Replaced the persistent background script declaration with a service worker.
- Converted web-accessible resources to the Manifest V3 object format.
- Replaced Firefox-style `browser.*` calls with Chromium `chrome.*` APIs.
- Registered toolbar and lifecycle listeners once at service-worker startup.
- Preserved the enabled state in local extension storage across worker restarts.
- Added a locale fallback for language-region values such as `en-US`.
- Added a `data-hide-promoted-jobs` state marker to the document root for
  privacy-safe injection diagnostics.

LinkedIn paths, list selectors, promoted-label matching, and card selection remain unchanged for Phase 2 investigation.

## Automated Evidence

Run:

```sh
npm run check
```

The check covers manifest structure, minimum permissions, service-worker initialization and restart behavior, toolbar toggling, storage persistence, content-script initialization, linting, formatting, and release packaging.

## Browser Verification

| Check                                            | Brave | Chrome |
| ------------------------------------------------ | ----- | ------ |
| Unpacked extension loads without manifest errors | Pass  | Pass   |
| Service worker starts without uncaught errors    | Pass  | Pass   |
| Toolbar badge and toggle update correctly        | Pass  | Pass   |
| Enabled state survives browser restart           | Pass  | Pass   |
| Content script initializes on LinkedIn Jobs      | Pass  | Pass   |

## Verification Evidence

Verified on 2026-07-01 with Brave `149.1.91.180` and Google Chrome
`149.0.7827.201`:

- Both browsers loaded the repository's `ext/` directory as extension
  `jhedelbndagmgladjfklnpohcolgoiml` with no disable reasons.
- Both profiles registered and started the version `1.5` service worker with
  `action.onClicked`, `runtime.onInstalled`, and `runtime.onStartup` listeners.
- Both toolbar badges changed `ON` to `OFF` to `ON`, while local extension
  storage persisted `true` to `false` to `true`.
- Both browsers restarted into new processes, restored the unpacked extension,
  and retained the enabled state.
- LinkedIn Jobs at `/jobs/` reported `data-hide-promoted-jobs="enabled"` in both
  browsers, proving content-script initialization after restart.
- Chrome reported no extension-origin console errors during the LinkedIn check.
