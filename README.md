# B-CHESS — Free Chess Analyzer (Fixed Version)

## What Was Fixed:
1. **Chess Pieces Broken Image Issue Fixed**: Configured `pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'` so the chess pieces load reliably on both local machines and GitHub Pages (`nextgencoders05.github.io/B-CHESS/`).
2. **Stockfish Engine Integrated**: Built-in Web Worker running Stockfish 10 directly in the browser for real-time Best Move, Evaluation (`+0.00`), and Depth calculation.
3. **Interactive Controls**: Undo, Redo, Flip Board, Reset, Theme Switcher (Green & White / Wood), and FEN Loader.

## How to Upload to GitHub:
1. Extract this ZIP file.
2. Upload `index.html`, `style.css`, and `script.js` to the root of your `B-CHESS` GitHub repository.
3. Commit the changes and refresh `https://nextgencoders05.github.io/B-CHESS/` after 1 minute.
