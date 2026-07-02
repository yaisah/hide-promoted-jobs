# Phase 5: Publish, Package, and Maintain

## Status

Release candidate verified. The branch and reviewed pull request are public,
automated and independent review gates pass, and the deterministic archive
installed cleanly in fresh disposable Chrome and Brave profiles. Merge, tag,
and GitHub release publication are the remaining steps.

## Source and Publishing State

- Release branch: `fix/manifest-and-compatibility`
- Verified release-candidate branch: `fix/manifest-and-compatibility`
- Fork pull request:
  [`yaisah/hide-promoted-jobs#2`](https://github.com/yaisah/hide-promoted-jobs/pull/2)
- Pull-request target: Yaisah's `main` at upstream baseline `8b476ab`
- Upstream fetch remote: `https://github.com/winterhazel/hide-promoted-jobs.git`
- Upstream push URL: disabled
- Planned tag: `v1.6.0`

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

The approved path is therefore:

1. Publish Yaisah's tested `v1.6.0` fork release.
2. Obtain Yaisah's approval of the exact upstream issue title and body.
3. Open the focused issue with links to the fork release and reviewed fork pull
   request, and ask whether Chromium-first scope is acceptable or Firefox
   parity is required.
4. Create no upstream pull request unless the maintainer confirms interest and
   browser scope.
5. If invited, port only accepted runtime code, tests, sanitized fixtures, and
   public documentation from a clean branch based on `upstream/main`.

The exact public message is maintained in Yaisah's Obsidian output
`Hide Promoted Jobs Upstream Issue Draft.md`; publication remains pending
Yaisah's approval.

## Remaining Publication Steps

1. Mark pull request `#2` ready, merge it after green CI, tag the merge commit,
   and publish the archive plus checksum as release `v1.6.0`.
2. Confirm the public release links, update this report with the merge and tag
   commit, and post the already approved exact upstream issue message.
