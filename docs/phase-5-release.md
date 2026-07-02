# Phase 5: Publish, Package, and Maintain

## Status

Complete on 2026-07-02. The reviewed recovery is merged into Yaisah's `main`,
tagged as `v1.6.0`, and published with its deterministic archive and checksum.
The approved issue-first outreach is public upstream. After the maintainer
accepted Chromium-first scope, a clean draft pull request was opened for review.

## Source and Publishing State

- Release branch: `fix/manifest-and-compatibility`
- Verified release-candidate branch: `fix/manifest-and-compatibility`
- Fork pull request:
  [`yaisah/hide-promoted-jobs#2`](https://github.com/yaisah/hide-promoted-jobs/pull/2)
- Merge commit: `e5b55af9f10fa75f025feafb72e2d226effc5ea3`
- Tag: [`v1.6.0`](https://github.com/yaisah/hide-promoted-jobs/releases/tag/v1.6.0),
  pointing to the reviewed merge commit
- Release assets: `hide_promoted_jobs-1.6.0.zip` and its `.sha256` file
- Upstream issue:
  [`winterhazel/hide-promoted-jobs#4`](https://github.com/winterhazel/hide-promoted-jobs/issues/4)
- Upstream draft pull request:
  [`winterhazel/hide-promoted-jobs#5`](https://github.com/winterhazel/hide-promoted-jobs/pull/5)
- Upstream fetch remote: `https://github.com/winterhazel/hide-promoted-jobs.git`
- Upstream push URL: disabled

## Package Evidence

- Archive: `hide_promoted_jobs-1.6.0.zip`
- SHA-256:
  `e4d0f4415929b98c607b8176ed59bf8c8eb3122c622795a464059baa144b1dac`
- `npm run release` passed lint, formatting, 32 tests, extension validation,
  and two-build reproducibility verification on Node `24.14.0`.
- `npm audit` reported zero vulnerabilities.
- The archive allow-list contains only the manifest, three runtime scripts,
  localization data, and six icons. Fixtures, tests, documentation, artifacts,
  and duplicate local files are excluded.
- The checksum file verifies successfully against the generated archive.

## Browser and Rollback Evidence

- Phase 4 runtime workflows passed in Chrome `149.0.7827.201` and Brave
  `149.1.91.180` on macOS, followed by product-owner confirmation during normal
  LinkedIn Jobs browsing.
- The final archive was extracted into a clean temporary directory and loaded
  through each browser's documented **Load unpacked** flow in isolated,
  disposable profiles.
- Chrome `149.0.7827.201` reported version `1.6.0`, enabled state `ON`, extension
  loaded, and an active `js/background.js` service worker. A direct service
  worker check returned manifest version `1.6.0` and stored state
  `enabled: true`.
- Brave `149.1.91.180` reported the same version, enabled state, extension-loaded
  status, active service worker, manifest version, and stored enabled state.
- Both browsers loaded archive SHA-256
  `e4d0f4415929b98c607b8176ed59bf8c8eb3122c622795a464059baa144b1dac`;
  no normal browser profile was modified.
- Pre-release rollback commit `6c30e86` was checked out in a detached worktree;
  its 29 tests passed and its Manifest V3 `ext/` directory remains loadable
  without modifying the release checkout.

## Review Evidence

- QA Agent `Anscombe` independently audited release requirements, packaging,
  rollback, and publication gates.
- Reviewer Agent `Erdos` reviewed the complete public diff and the corrected
  release candidate. Detached-card cleanup, Node compatibility, rollback
  documentation, duplicate exclusion, and verification wording were resolved.
- The reviewer reran all 32 tests, lint, formatting, dependency audit,
  deterministic packaging, checksum verification, release allow-list, and the
  rollback worktree. No functional or security blocker remains.
- GitHub Actions `verify` passed on the current pull-request head.
- A final public-diff privacy scan found no LinkedIn account, search, company,
  authentication, tracking, employer, or local user-path data in added content.

## Upstream Contribution Path

The upstream project is public, unarchived, and accepts issues, but has no
`CONTRIBUTING.md`, issue template, pull-request template, or documented external
contribution workflow. Its prior regression issue `#2` followed an issue-first
pattern: the maintainer requested evidence, published a fix, and asked the
reporter to retest.

The approved path is:

1. Publish Yaisah's tested `v1.6.0` fork release.
2. Obtain Yaisah's approval of the exact upstream issue title and body.
3. Open the focused issue with links to the fork release and reviewed fork pull
   request, and ask whether Chromium-first scope is acceptable or Firefox
   parity is required.
4. Create no upstream pull request unless the maintainer confirms interest and
   browser scope.
5. If invited, port only accepted runtime code, tests, sanitized fixtures, and
   public documentation from a clean branch based on `upstream/main`.

Yaisah approved the exact public message after the release links were live. It
was published as upstream issue `#4` on 2026-07-02. Fabricio then approved a
Chromium-first contribution. Draft pull request `#5` was created from a clean,
single-commit branch based on `upstream/main`; it contains the portable runtime,
tests, sanitized fixtures, CI, packaging, and public maintenance documentation,
while excluding fork-only release records and personal artifacts. It awaits
maintainer review.

## Gate Decision

Phase 5 passes. The fork, release package, checksum, installation guidance,
rollback path, maintenance workflow, issue template, fresh browser installs,
reviewed merge, tag, release assets, and approved issue-first upstream outreach
all satisfy the release acceptance criteria.
