# Drawing Pro 2

A minimal, local-first drawing app. The header is 28px high and the icon-only toolbar is 30px high. No account, cloud service, analytics, or runtime third-party scripts.

## Run

```sh
cd ~/project/newlessagettest/drawing-pro
npm start
```

Open http://127.0.0.1:4173. Node 20+ is required. Keep this origin and port to access your saved paintings.

## Canvas and brushes

New paintings are **500 × 500**, blank, and displayed at **100%**. Resizing the window never scales the painting automatically. Smaller windows scroll; Fit is available explicitly in the bottom-right corner.

The default brush is **50px**, adjustable from 1–50px. Both thin sliders are exactly **50 CSS pixels wide** at every window size. The sidebar shows the actual brush footprint at 100% zoom.

Brushes: round, square, triangle, diamond, flat, and star stamps. Clicking places the selected shape; dragging paints with that tip. Round strokes have circular ends. New brushes use the requested opacity directly: **100% is opaque**, with no hidden marker multiplier. Live previews are composited separately from committed artwork.

Eraser, line, rectangle/ellipse outlines, fill, eyedropper, undo/redo, full color picker, and all 16 color shortcuts remain available. Undo reaches the last 80 actions in each painting.

## Paintings

The new-document icon saves the current painting and opens a blank one without confirmation. The folder immediately to its right opens a searchable list with thumbnails on the left. Names default to the local creation date and time; typing a name overrides that default.

Paintings, history, settings, and thumbnails autosave in IndexedDB. The status dot's tooltip reports save success/failure. A failed save prevents switching away from unsaved artwork. Export PNG keeps a separate, white-backed copy. Clearing site data removes browser saves.

Version 1's previous painting is copied into the gallery without changing its original stored record, dimensions, or appearance. New strokes use the corrected brushes. Conflicting edits from separate tabs save as separate copies; this is not live collaboration.

## Keys and tests

1 round · 2 square · 3 triangle · 4 diamond · V flat · U star · 5 eraser · 6 line · 7 rectangle · 8 ellipse · 9 fill · 0 eyedropper. Color letters appear on the palette. Brackets resize; Ctrl/Cmd Z undoes; Ctrl/Cmd Shift Z redoes. Press ? for the full guide. Shortcuts pause in text fields and dialogs.

```sh
npm ci
npm run check
npm test
```

Tests use installed Google Chrome at standard and Retina pixel densities. Results and screenshots: `tests/artifacts/v2/`. See `TESTING.md` for the verified run and boundaries. The browser app is `index.html`, `styles.css`, and `app.js`; original files remain in `backups/v1/`.
