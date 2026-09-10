# Drawing Pro

A dependency-free, local-first drawing studio. The browser app uses HTML, CSS and JavaScript; Node serves only the five application assets. There are no runtime third-party scripts, accounts, analytics, or external font requests.

## Run

```sh
cd ~/project/newlessagettest/drawing-pro
npm start
```

Open **http://127.0.0.1:4173**. Node 20+ is required. No npm installation is needed merely to run the app. To use another local port: `PORT=4180 npm start`. Keep the same origin and port to access that origin's saved drawing.

## Drawing

The left sidebar contains 16 one-click essential colors. Each swatch displays its letter shortcut. **More colors** opens a complete hue/saturation/brightness picker with validated HEX and RGB fields. Drag the shade area, adjust the hue slider, or type a value. Three- and six-digit hex values are accepted. The six most recent custom colors stay in the sidebar.

The canvas cursor immediately reflects the selected color. It shows the nominal brush diameter at the current canvas zoom, including when you change color while hovering. Erasing uses a neutral dashed ring; fill and eyedropper use a color-matched crosshair.

Brush size runs from **1 through 50 artwork pixels**. The wedge is 50 CSS pixels tall at its largest end, and the checkerboard preview holds a true-size circle, up to 50×50 CSS pixels. At **100%** zoom the solid pen diameter and preview match directly. At **Fit**, the canvas and cursor scale together while the preview continues to show the 100% size. Use the zoom controls or scroll the canvas viewport when zoomed in.

Tools: ink pen, textured pencil, translucent marker, soft brush, eraser, line, rectangle, ellipse, fill bucket, and eyedropper. Each continuous marker stroke applies opacity once, avoiding dark blobs at overlapping input samples. Soft brush and pencil show a nominal outer footprint; their centers and edges are intentionally different from solid ink.

## Keyboard

| Key | Color | Key | Color |
| --- | --- | --- | --- |
| K | Ink black | A | Slate gray |
| W | White | N | Brown |
| R | Red | O | Orange |
| Y | Yellow | L | Lime |
| G | Green | T | Teal |
| C | Cyan | B | Blue |
| I | Indigo | P | Purple |
| M | Magenta | S | Pink |

**1** Pen · **2** Pencil · **3** Marker · **4** Soft brush · **5** Eraser · **6** Line · **7** Rectangle · **8** Ellipse · **9** Fill · **0** Eyedropper. **E** and **F** also select eraser and fill.

**[ / ]** decrease/increase size. **Ctrl/Cmd Z** undoes; **Ctrl/Cmd Shift Z** or **Ctrl Y** redoes. **Shift** constrains lines to 45-degree increments and rectangles/ellipses to equal dimensions. **Escape** cancels a live stroke or closes a dialog. **?** opens the shortcut guide.

Typing in document-name, HEX, RGB, or other text fields never triggers drawing shortcuts. Global drawing shortcuts are suspended while a dialog is open. The color square supports arrow keys: left/right for saturation, up/down for brightness, and Shift for larger steps.

## Saving and export

The current drawing, name, selected tool, color, size, opacity, and custom-color history are saved to this browser's IndexedDB after changes. The top status confirms successful transactions and reports storage failure. Clearing the browser's site data removes its saved drawing. Private-browsing data may not persist after that session. Local storage is not a backup: use **Export PNG** to keep a separate copy.

PNG export is always **1200×800**, flattened onto white, and uses the document name as a sanitized filename. The introductory text and canvas rulers are interface elements, never part of the exported art. Erasing removes artwork pixels, rather than merely painting white.

Undo retains up to 80 actions; a clear operation is undoable. The optional inspiration illustration only works on a blank canvas and is one undoable action. Existing art is never replaced by the sample.

## Verification

```sh
npm ci
npm run check
npm test
```

The test suite uses installed **Google Chrome** in headless mode, not a browser mock. `@playwright/test` and `pngjs` are development-only dependencies. The suite runs at both 1× and 2× device pixel ratios. It drives actual mouse movements, drags, clicks, keyboard input, and Chrome touch input, then checks canvas pixels, cursor geometry, downloads and persisted state.

Results: `tests/artifacts/test-results.json`, `tests/artifacts/test-run.log`, and `tests/artifacts/report/index.html`. Failures retain traces and screenshots. Named preview screenshots are in `tests/artifacts/`.

## Scope

This is a single-document, single-raster-surface drawing app, not a layered image editor. There is no account, cloud sync, multi-user collaboration, image import, text tool, or pressure-sensitive stylus calibration. Mouse and emulated touch behavior are tested; physical tablet hardware, Safari and Firefox need separate validation. Treat one tab as the editor for a given local drawing; simultaneous tabs are not collaborative.

The artwork uses stable 1200×800 logical coordinates with a backing resolution up to 2× for Retina displays. Pointer capture preserves strokes outside the canvas and cancellation avoids a stuck pen. Stroke geometry is recorded for deterministic undo; only a small fixed set of rendering surfaces is used instead of storing a full bitmap for every history action.

## Files

- `index.html`, `styles.css`, `app.js`, `favicon.svg`: browser application.
- `server.mjs`: loopback-only, allowlisted static server.
- `package.json`, `package-lock.json`: scripts and reproducible development dependencies.
- `playwright.config.js`, `tests/drawing.spec.js`, `tests/regressions.spec.js`: executable browser tests.

## Latest verified run

112 Chrome checks passed with no failures or retries. See `TESTING.md` for exact coverage and limits. Run `node tests/preview.mjs` while the app is running to regenerate six visual previews.
