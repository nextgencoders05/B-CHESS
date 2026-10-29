# B-CHESS PRO — Stockfish Engine, Click-to-Move & Play vs Bot

## New Features Added:
1. **Click-to-Move Option**:
   - You can now move pieces by simply **clicking a piece** and then **clicking the destination square** (in addition to standard drag-and-drop) [cite: 1, 3].
   - Visual green dots show valid empty destination squares, red indicators show legal captures, and a glowing highlight shows the currently selected square [cite: 2].
2. **Play vs Bot with Elo Rating Selection**:
   - Switch between **Free Analysis Mode** and **Play vs Bot Mode** [cite: 1, 3].
   - Configurable bot rating: **800 (Beginner)**, **1100 (Casual)**, **1400 (Intermediate)**, **1700 (Advanced)**, **2000 (Expert)**, or **2500+ (Master)**.
   - Choose to play as **White** or **Black** (the board flips automatically when playing as Black) [cite: 1].
   - Bot skill levels, search depth, and move latency are calibrated to realistic human rating bands.
3. **Smart Mode Controls**:
   - In "Play vs Bot" mode, undo seamlessly takes back both the bot's move and your move so you can try again [cite: 1].
   - In "Free Analysis" mode, full deep Stockfish analysis, PV lines, and arrow suggestions remain instantly active [cite: 1, 3].

## Included Files:
- `index.html`: Updated with Mode switcher, Bot Elo selector, and Play-as White/Black options [cite: 3].
- `style.css`: Clean dark theme UI styling for mode toggles, dropdowns, and destination dot indicators [cite: 2].
- `script.js`: Complete chess logic supporting both click-move and drag-move, plus Stockfish Bot integration [cite: 1].
- `README.md`: Setup and deployment instructions [cite: 4].

## How to Deploy to GitHub Pages:
1. Extract the `.zip` archive.
2. Upload the updated files (`index.html`, `style.css`, `script.js`, `README.md`) directly into your repository [cite: 4].
3. Push to `main`/`master` and your GitHub Pages site will be updated automatically [cite: 4].
