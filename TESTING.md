# Drawing Pro 2 — verification

Browser: Google Chrome 152.0.7977.76 on the host Mac. Tests run in isolated browser contexts at 1× and 2× device pixel ratios, with real mouse movement, clicks, keyboard input, and Chrome-emulated touch. The final machine-readable result is `tests/artifacts/v2/test-results.json`.

**102 passed, 0 failed, 0 flaky, 0 skipped.** 51 cases run at both pixel densities. Final live-port run: 2026-09-08T16:42:40.016Z; duration 161.5 seconds.

## Coverage

- Compact 28px header and 30px icon-only toolbar; blank 500×500 canvas at 100%; 50px sliders and brush preview stay the same size at 1920, 1280, 800, and 390px viewport widths.
- All 16 colors: palette clicks, uppercase letter shortcuts, painted RGB/alpha pixels, and immediate cursor changes.
- All six brush tips: live and committed crossing strokes retain earlier artwork; 50% and 100% opacity are measured from actual pixels; round clicks produce circular dots.
- Measured 1, 12, 25, and 50px stroke widths; mouse-driven slider endpoints and bracket limits.
- Translucent-stroke accumulation, within-stroke uniformity, zero opacity, erasing followed by painting, and cancellation of a live overlapping stroke.
- Undo/redo, clear cancellation and undo, Shift-constrained outlines, bounded fill, eyedropper, HEX/RGB validation, and recent custom colors.
- New painting without a confirmation dialog; timestamp and custom names; gallery thumbnails on the left; opening and reloading exact artwork and history.
- One-time migration of a v1 drawing, with its original dimensions and appearance, while leaving its original stored record unchanged.
- Concurrent tab edits retained as separate copies, with both versions reopened and their pixels verified.
- Native-scale touch drawing at a narrow viewport, pointer capture, shortcut suppression while typing, and actual 500×500 PNG download contents at both pixel densities.

## Build and regression checks

The v1 marker was measured at alpha 84/255 despite a 100% opacity setting. New brush tools use opacity directly, with no hidden marker multiplier. Historical v1 brush operations remain supported only to preserve existing paintings' appearance.

The new rendering path keeps committed pixels separate from the live preview. Regression tests inspect unaffected pixels during and after crossing a prior stroke, not only after undo.

The first extended test run found a multi-tab conflict-copy alias that could redirect an explicitly reopened document. Clearing stale aliases after the write queue drains fixed the issue. Both versions are now checked by exact pixel assertions. Browser-tab tests explicitly bring the intended page to the foreground before mouse input.

## Visual review

Reviewed the desktop blank canvas, six shape brushes, gallery with left-side previews, and 390px layout. Narrow windows intentionally scroll the 500px canvas instead of silently scaling the art. Named screenshots are `01-blank.png` through `04-mobile-100-percent.png` in `tests/artifacts/v2/`. Preview capture reported no page errors.

## Boundaries

This verifies Chrome desktop/Retina and emulated touch, not Safari, Firefox, physical stylus pressure, a formal accessibility audit, or storage-quota/long-duration stress. This is a local, multiple-painting editor with one raster drawing surface per painting, not a layered editor or cloud collaboration service. Export PNG for a separate backup.

## Reproduce

```sh
npm ci
npm run check
npm test
APP_PORT=4173 node tests/v2/preview.mjs
```

Inspect `tests/artifacts/v2/report/index.html`, `test-results.json`, and `test-run.log`. Original v1 source and verification notes are retained under `backups/v1/`.
