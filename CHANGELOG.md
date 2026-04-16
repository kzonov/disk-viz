# Changelog

All notable changes to Disk Viz are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [SemVer](https://semver.org/).

## [Unreleased]

### Added
- MIT license.
- Screenshot in the README.
- Contributing section in the README.

### Changed
- README install section documents both the GUI "Open Anyway" path and the `xattr -cr` shortcut for first-launch unblocking.
- CI now syncs `package.json` version with the git tag so the DMG filename matches the release.

## [1.1.2] — 2026-04-16

### Added
- Ad-hoc codesigning of the packaged `.app` via an `afterSign` hook, so the "damaged / can't be opened" error no longer requires `xattr -cr` on install (first launch still needs a one-time Gatekeeper unblock).

## [1.1.1] — 2026-04-16

### Fixed
- Scanner crashing with `Cannot find module './lib/scanner.js'` in the packaged app — `lib/` was missing from the electron-builder `files` allowlist.

## [1.1.0] — 2026-03-23

### Added
- Right-click context menu on sectors with **Copy Path**, **Open in Finder**, and **Move to Trash** (via `shell.trashItem`).
- Text input for adding excluded paths directly.
- Vitest test suite (46 tests) covering formatting, colors, tree logic, and scanner behavior.
- DaisyDisk-style coloring: evenly distributed hues per top-level sector, children drift within the parent's band.

### Changed
- Worker serializes the scanned tree as a JSON string before `postMessage`, and prunes small nodes beforehand, to stay within V8 string limits on large scans.

### Fixed
- Scans no longer fail on unreadable directories (e.g. `EBADF` on `/dev/fd`); those entries are skipped instead.
- Double chart render on re-scan — the previous sunburst is now destroyed first.
- Double `lstat` and clone overhead in `applyExclusions`; HTML escaping in `innerHTML` sinks; files (not just directories) can now be excluded.
- `lstats` scope bug in the scanner worker.

## [1.0.0] — 2026-03-21

Initial release.

### Added
- Interactive sunburst chart with click-to-drill-down and click-center-to-go-back.
- Breadcrumb navigation.
- Path exclusion list.
- Background scanning with progress indicator.
- `electron-builder` config and GitHub Actions workflow producing a macOS `.dmg` on tag push.

[Unreleased]: https://github.com/kzonov/disk-viz/compare/v1.1.2...HEAD
[1.1.2]: https://github.com/kzonov/disk-viz/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/kzonov/disk-viz/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/kzonov/disk-viz/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/kzonov/disk-viz/releases/tag/v1.0.0
