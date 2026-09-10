# Drawing Pro — verification

Run: 2026-09-08T15:42:44.697Z
Browser: Google Chrome 152.0.7977.76, installed on the host Mac.

**112 passed, 0 failed, 0 flaky, 0 skipped.** 56 cases run at both 1× and 2× device pixel ratios. Duration: 72.7 seconds. Node syntax checks passed.

The suite performs actual mouse clicks and drags, keyboard events, and Chrome DevTools touch input. Assertions inspect canvas pixels, cursor geometry, downloaded PNG bytes, history, and IndexedDB restoration. The app's diagnostics expose read-only state, not mutation hooks.

## Coverage

- All 16 palette colors: clicks, uppercase/lowercase shortcut handling, drawn RGB pixels, and immediate cursor updates.
- Thickness 1, 12, 25 and 50: measured raster widths, true-size previews and scaled cursors; mouse-driven slider endpoints and range limits.
- All drawing tools, transparency, erasing, bounded/whole-canvas fills, eyedropper, and single-click dots.
- Undo/redo, branching history, confirm/cancel/undo clear, and the 80-action undo limit while retaining older art.
- HEX and RGB validation, HSV mouse and keyboard control, modal focus containment, and shortcut suppression while typing.
- Pointer capture outside the canvas, Escape cancellation, touch cancellation, Shift-constrained geometry and pen-release regression.
- Reload persistence of exact drawing and settings; real 1200×800 white-background PNG downloads and sanitized filenames.
- 390px responsive layout, touch drawing without page scroll, 1px cursor sizing at small fit zoom, and optional sample artwork protection.

## Build–test–improve loop

First run: 102 passed, 2 failed. Both failures came from the HSV test clicking the 1px inset of a rounded corner. Browser hit-testing confirmed this hit the surrounding form, not the picker. The test now clicks the visible picker interior, checks the exact resulting color, then uses Shift+arrow keys to reach fully saturated green.

Code review also fixed the tiny-brush cursor at low zoom and a final off-angle point on Shift-constrained pen release. New regression tests cover both, plus cancelled touch and history retention. The final complete suite passed without retries.

## Visual review

Six screenshots were captured. Desktop blank state, drawing state, color picker, mobile layout, mobile picker, and a 100% zoom thickness demonstration are in tests/artifacts/. The 50px preview and cursor each measured exactly 50×50 CSS pixels. No browser page or console errors were observed during the preview capture.

## Boundaries

Automated Chrome desktop/Retina and emulated touch were exercised. This does not constitute Safari/Firefox validation, physical stylus/pressure testing, a formal accessibility audit, or a storage-quota/long-duration stress test. This is a single-document local drawing app, without layers or cloud collaboration.

## Reproduce

Run npm ci, npm run check, npm test. Inspect tests/artifacts/report/index.html or tests/artifacts/test-results.json. Run node tests/preview.mjs for named screenshots while the app server is running.
