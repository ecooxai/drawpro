from pathlib import Path
root = Path(__file__).parent
parts = 'core ui viewport zoom geometry shapes fill render history pointers picker-fragment storage-base storage-write persistence documents migration gallery file-actions keyboard export bootstrap'.split()
text = '\n'.join((root / (name + ('.txt' if name == 'picker-fragment' else '.js'))).read_text() for name in parts)
(root / 'app.js').write_text(text)
