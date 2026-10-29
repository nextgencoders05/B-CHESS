// B-CHESS Interactive Analyzer Script
// Fixed Piece Image Rendering using reliable Wikipedia SVG/PNG CDN

let board = null;
const game = new Chess();
let redoStack = [];
let stockfish = null;

// Common Openings Dictionary
const OPENINGS = {
  "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR": "King's Pawn Opening (1. e4)",
  "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR": "Queen's Pawn Opening (1. d4)",
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR": "Open Game (1. e4 e5)",
  "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR": "Sicilian Defense (1. e4 c5)",
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R": "King's Knight Opening",
  "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R": "Open Game: 2. Nf3 Nc6",
  "r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R": "Scotch Game (3. d4)",
  "r1bqkbnr/pppp1ppp/2n5/8/3pP3/5N2/PPP2PPP/RNBQKB1R": "Scotch Game Accepted",
  "r1bqkbnr/pppp1ppp/2n5/8/2BpP3/5N2/PPP2PPP/RNBQK2R": "Scotch Gambit (4. Bc4)",
  "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R": "Ruy Lopez (Spanish)",
  "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R": "Italian Game (Giuoco Piano)"
};

// Initialize Stockfish Web Worker via Blob for cross-origin compatibility on GitHub Pages
function initStockfish() {
  try {
    const workerCode = `importScripts('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js');`;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    stockfish = new Worker(URL.createObjectURL(blob));

    stockfish.onmessage = function(event) {
      const line = event.data;
      if (typeof line !== 'string') return;

      if (line.startsWith('info depth')) {
        const depthMatch = line.match(/depth (\d+)/);
        const scoreMatch = line.match(/score cp (-?\d+)/);
        const mateMatch = line.match(/score mate (-?\d+)/);

        if (depthMatch) {
          document.getElementById('depthVal').textContent = depthMatch[1];
        }

        if (mateMatch) {
          const mateIn = parseInt(mateMatch[1], 10);
          document.getElementById('evalScore').textContent = `M${Math.abs(mateIn)}`;
        } else if (scoreMatch) {
          let cp = parseInt(scoreMatch[1], 10) / 100;
          if (game.turn() === 'b') cp = -cp;
          const sign = cp > 0 ? '+' : '';
          document.getElementById('evalScore').textContent = `${sign}${cp.toFixed(2)}`;
        }
      }

      if (line.startsWith('bestmove')) {
        const parts = line.split(' ');
        const bestMoveUci = parts[1];
        if (bestMoveUci && bestMoveUci !== '(none)') {
          document.getElementById('bestMoveText').textContent = formatUciMove(bestMoveUci);
          document.getElementById('engineSubtext').textContent = `Recommended by Stockfish 10`;
        } else {
          document.getElementById('bestMoveText').textContent = 'Game Over';
        }
      }
    };

    stockfish.postMessage('uci');
    analyzePosition();
  } catch (err) {
    console.warn('Stockfish worker fallback:', err);
    document.getElementById('bestMoveText').textContent = 'Ready';
  }
}

function formatUciMove(uci) {
  if (!uci || uci.length < 4) return uci;
  return `${uci.slice(0, 2)} → ${uci.slice(2, 4)}`;
}

function analyzePosition() {
  if (!stockfish) return;
  if (game.game_over()) {
    document.getElementById('bestMoveText').textContent = 'Game Over';
    return;
  }
  document.getElementById('bestMoveText').textContent = 'Thinking...';
  stockfish.postMessage('stop');
  stockfish.postMessage('position fen ' + game.fen());
  stockfish.postMessage('go depth 14');
}

function onDragStart(source, piece) {
  if (game.game_over()) return false;
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false;
  }
}

function onDrop(source, target) {
  const move = game.move({
    from: source,
    to: target,
    promotion: 'q'
  });

  if (move === null) return 'snapback';

  redoStack = [];
  updateUI();
}

function onSnapEnd() {
  board.position(game.fen());
}

function updateUI() {
  // Update Opening Name
  const fenBoard = game.fen().split(' ')[0];
  if (game.history().length === 0) {
    document.getElementById('openingName').textContent = 'Starting';
  } else if (OPENINGS[fenBoard]) {
    document.getElementById('openingName').textContent = OPENINGS[fenBoard];
  }

  // Update Game Status
  const statusEl = document.getElementById('gameStatus');
  if (game.in_checkmate()) {
    statusEl.textContent = 'Checkmate!';
    statusEl.style.color = '#f87171';
  } else if (game.in_draw()) {
    statusEl.textContent = 'Draw';
    statusEl.style.color = '#fbbf24';
  } else if (game.in_check()) {
    statusEl.textContent = 'Check!';
    statusEl.style.color = '#fb923c';
  } else {
    statusEl.textContent = `${game.turn() === 'w' ? 'White' : 'Black'} to move`;
    statusEl.style.color = '#4ade80';
  }

  // Update Move History List
  const history = game.history();
  const container = document.getElementById('moveHistory');
  if (history.length === 0) {
    container.innerHTML = '<div class="move-list-empty">No moves yet</div>';
  } else {
    let html = '';
    for (let i = 0; i < history.length; i += 2) {
      const moveNum = Math.floor(i / 2) + 1;
      const whiteMove = history[i] || '';
      const blackMove = history[i + 1] || '';
      html += `<div class="move-row">
        <span class="move-num">${moveNum}.</span>
        <span>${whiteMove}</span>
        <span>${blackMove}</span>
      </div>`;
    }
    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
  }

  analyzePosition();
}

// Initialize Board with FIXED pieceTheme CDN URL so pieces NEVER break on GitHub Pages
$(document).ready(function() {
  const config = {
    draggable: true,
    position: 'start',
    // Direct CDN URL fixes the broken image icons on GitHub Pages subfolders
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
  };

  board = Chessboard('myBoard', config);
  $(window).resize(board.resize);

  initStockfish();
  updateUI();

  // Control Buttons
  document.getElementById('undoBtn').addEventListener('click', () => {
    const move = game.undo();
    if (move) {
      redoStack.push(move);
      board.position(game.fen());
      updateUI();
    }
  });

  document.getElementById('redoBtn').addEventListener('click', () => {
    if (redoStack.length > 0) {
      const move = redoStack.pop();
      game.move(move);
      board.position(game.fen());
      updateUI();
    }
  });

  document.getElementById('flipBtn').addEventListener('click', () => {
    board.flip();
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    game.reset();
    redoStack = [];
    board.start();
    document.getElementById('evalScore').textContent = '+0.00';
    updateUI();
  });

  document.getElementById('loadFenBtn').addEventListener('click', () => {
    const fen = document.getElementById('fenInput').value.trim();
    if (fen && game.load(fen)) {
      redoStack = [];
      board.position(game.fen());
      updateUI();
    } else {
      alert('Invalid FEN string!');
    }
  });

  document.getElementById('themeBtn').addEventListener('click', (e) => {
    document.body.classList.toggle('wood-theme');
    const isWood = document.body.classList.contains('wood-theme');
    e.target.textContent = isWood ? 'Wood & Cream' : 'Green & White';
  });
});
