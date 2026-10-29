# B Chess Analyzer — Sounds, Blunder & Mistake Detection, Game Rating

## New Features Added:
1. **Interactive Audio System (Web Audio API)**:
   - **Piece Move Sound**: Realistic wooden click sound on standard moves.
   - **Capture Sound**: Crisp strike sound when a piece is captured.
   - **Check Sound**: Audible chime alert on Check (+).
   - **Checkmate Sound**: Triumphant musical chord arpeggio on Checkmate (#).
   - **Sound Toggle**: Easy one-click mute/unmute button (`🔊 Sound: ON / OFF`) in the header bar.

2. **Game Review, Blunders & Mistakes Detection (Chess.com Style)**:
   - Tracks each move's centipawn evaluation before and after the move.
   - Classifies each move:
     - **★ Best** (Optimal Stockfish line)
     - **✓ Good** (Solid playable move)
     - **?! Inaccuracy** (Minor loss of advantage)
     - **? Mistake** (Loss of advantage / tactical oversight)
     - **?? Blunder** (Major game-turning mistake / hanging pieces)
   - Live **Blunder & Mistake Counter** for both White and Black.
   - Move history items display color-coded quality badges.

3. **Game Performance Rating (Estimated Elo) & Accuracy %**:
   - Calculates real-time **Move Accuracy %** (e.g. 85%, 92%) based on centipawn loss curves.
   - Computes an **Estimated Game Performance Elo Rating** (e.g. ~1450 Elo, ~1820 Elo) based on how well you play throughout the game.

4. **Preserved Features**:
   - Mobile tap-to-move with green destination dots and red capture rings.
   - Stockfish engine with evaluation bar & arrow guide.
   - Gambit & opening detection.
   - Play vs Bot with customizable ratings (800 to 2500+).

## How to Deploy to GitHub Pages:
1. Extract this ZIP file.
2. Upload `index.html`, `style.css`, `script.js` to your GitHub repository.
3. Commit and refresh your live site after 1 minute!
