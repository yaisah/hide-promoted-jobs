# Hide Promoted Jobs

Hide promoted job cards while browsing LinkedIn Jobs so organic results are
easier to review. Version 1.6.0 is a maintained fork of
[`winterhazel/hide-promoted-jobs`](https://github.com/winterhazel/hide-promoted-jobs)
that restores current Chromium support and handles LinkedIn's current Jobs
layouts.

<div align="center">
  <img src=".github/images/before.png" alt="LinkedIn Jobs before promoted cards are hidden" width="49%"> <img src=".github/images/after.png" alt="LinkedIn Jobs after promoted cards are hidden" width="49%">
</div>

## Browser Support

| Browser       | Version 1.6.0 status                             |
| ------------- | ------------------------------------------------ |
| Google Chrome | Verified from final archive on macOS, Chrome 149 |
| Brave         | Verified from final archive on macOS, Brave 149  |
| Firefox       | Not verified for this fork; support is deferred  |

The original upstream store listings may still contain an older release. Install
this fork manually to use version 1.6.0.

## Install

### Release Archive

1. Download `hide_promoted_jobs-1.6.0.zip` from the
   [latest release](https://github.com/yaisah/hide-promoted-jobs/releases/latest).
2. Verify its SHA-256 checksum against the attached `.sha256` file.
3. Unzip the archive into a permanent local folder.
4. Open `chrome://extensions` in Chrome or `brave://extensions` in Brave.
5. Enable **Developer mode**.
6. Select **Load unpacked** and choose the unzipped folder containing
   `manifest.json`.
7. Pin **Hide Promoted Jobs**. Its badge should read `ON`.

### Developer Checkout

```bash
git clone https://github.com/yaisah/hide-promoted-jobs.git
cd hide-promoted-jobs
npm ci
npm run check
```

Load the repository's `ext/` directory from the browser extension page.

## Use

When the badge reads `ON`, confirmed promoted job cards are hidden on supported
LinkedIn Jobs views. Select the toolbar icon to switch between `ON` and `OFF`.
Turning the extension off immediately restores cards hidden by the extension;
turning it on hides confirmed promoted cards again without reloading.

The enabled state persists across browser restarts. Detection runs locally and
fails open, so uncertain cards remain visible.

## Update

For a Git checkout:

```bash
git switch main
git pull --ff-only
npm ci
npm run check
```

Then select **Reload** for the extension on `chrome://extensions` or
`brave://extensions` and refresh LinkedIn.

For a release archive, download and verify the new archive, unzip it into the
same permanent folder, and reload the extension. Keep the previous folder until
the new version has been verified.

## Troubleshoot

1. Confirm the extension is enabled and its badge reads `ON`.
2. Confirm version `1.6.0` appears on the browser extension details page.
3. Select **Reload** on the browser extension page, then refresh LinkedIn.
4. Test a direct LinkedIn Jobs search and toggle `OFF`, then `ON`.
5. Review the extension service-worker console for errors.
6. Report a regression with the repository issue template. Do not include
   account data, full tracking URLs, or unsanitized LinkedIn HTML.

## Roll Back

The last verified pre-release revision is commit `6c30e86`. To load it without
changing your current checkout:

```bash
git fetch origin
git worktree add --detach ../hide-promoted-jobs-rollback 6c30e86
```

Load `../hide-promoted-jobs-rollback/ext/` and verify the `ON` badge. Return to
the current release by loading the main checkout's `ext/` directory again. The
rollback commit remains Manifest V3 and its 29 automated tests pass.

## Privacy

The extension performs all detection in the browser. It requests only local
extension storage and access to LinkedIn pages. It has no analytics, remote API,
or collection of account, job-search, or browsing data.

## Development

- Run all checks: `npm run check`
- Build and verify a reproducible release: `npm run release`
- Maintenance and fixture workflow: [`docs/maintenance.md`](docs/maintenance.md)
- Release history: [`CHANGELOG.md`](CHANGELOG.md)

## License and Credits

This project remains available under the MIT License. The original extension
was created by Fabricio Duarte and based on
[u/mothibault's LinkedIn script](https://www.reddit.com/r/linkedin/comments/nhzcyz/comment/hrdq2fk).
Version 1.6.0 is maintained in Yaisah's fork while an issue-first contribution
path is prepared for the upstream project.
