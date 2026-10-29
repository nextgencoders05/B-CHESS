// B Chess Analyzer — Stockfish Engine + Mobile Tap-to-Move + Gambits & Openings

let board = null;
const game = new Chess();
let redoStack = [];
let stockfish = null;
let engineReady = false;
let currentBestMoveUci = null;
let showBestMoveArrow = true;
let targetDepth = 15;

// Click-to-Move / Tap state
let selectedSquare = null;

// Game Mode State: 'analysis' or 'bot'
let currentMode = 'analysis';
let playerColor = 'w'; // 'w' or 'b'
let botRating = 1400;  // 800, 1100, 1400, 1700, 2000, 2500
let isBotThinking = false;

// Bot skill settings
const BOT_PROFILES = {
  800:  { skill: 0,  depth: 1,  moveTime: 300, blunderRate: 0.35 },
  1100: { skill: 3,  depth: 2,  moveTime: 400, blunderRate: 0.18 },
  1400: { skill: 6,  depth: 4,  moveTime: 500, blunderRate: 0.06 },
  1700: { skill: 10, depth: 7,  moveTime: 650, blunderRate: 0.01 },
  2000: { skill: 15, depth: 10, moveTime: 800, blunderRate: 0.00 },
  2500: { skill: 20, depth: 14, moveTime: 1000, blunderRate: 0.00 }
};

// Rich Opening & Gambit Dictionary
const OPENINGS_LIST = [
  // Gambits
  { moves: ["e4", "e5", "f4"], name: "King's Gambit" },
  { moves: ["e4", "e5", "f4", "exf4"], name: "King's Gambit Accepted" },
  { moves: ["e4", "e5", "f4", "d5"], name: "Falkbeer Counter-Gambit" },
  { moves: ["d4", "d5", "c4"], name: "Queen's Gambit" },
  { moves: ["d4", "d5", "c4", "dxc4"], name: "Queen's Gambit Accepted (QGA)" },
  { moves: ["d4", "d5", "c4", "c6"], name: "Slav Defense" },
  { moves: ["d4", "d5", "c4", "e6"], name: "Queen's Gambit Declined (QGD)" },
  { moves: ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Bc4"], name: "Scotch Gambit" },
  { moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "b4"], name: "Evans Gambit" },
  { moves: ["e4", "e5", "d4", "exd4", "c3"], name: "Danish Gambit" },
  { moves: ["e4", "e5", "Nf3", "d5"], name: "Elephant Gambit" },
  { moves: ["e4", "e5", "Nf3", "f5"], name: "Latvian Gambit" },
  { moves: ["d4", "Nf6", "c4", "e5"], name: "Budapest Gambit" },
  { moves: ["d4", "f5", "e4"], name: "Staunton Gambit" },
  { moves: ["d4", "c5", "d5", "b5"], name: "Benko Gambit" },
  { moves: ["e4", "c5", "b4"], name: "Sicilian Wing Gambit" },
  { moves: ["e4", "c5", "d4", "cxd4", "c3"], name: "Smith-Morra Gambit" },
  { moves: ["d4", "d5", "e4"], name: "Blackmar-Diemer Gambit" },
  { moves: ["e4", "e6", "d4", "d5", "c4"], name: "Diemer-Duhm Gambit" },
  { moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "Na5"], name: "Two Knights Defense" },
  { moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "d4"], name: "Two Knights: Modern Bishop's Opening" },
  { moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"], name: "Giuoco Piano (Italian Game)" },
  { moves: ["e4", "e5", "Nf3", "Nc6", "Bc4"], name: "Italian Game" },
  { moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6"], name: "Ruy Lopez: Morphy Defense" },
  { moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"], name: "Ruy Lopez (Spanish Opening)" },
  { moves: ["e4", "e5", "Nf3", "Nc6", "d4"], name: "Scotch Game" },
  { moves: ["e4", "e5", "Nf3", "Nf6"], name: "Petrov's Defense (Russian Game)" },
  { moves: ["e4", "e5", "Nf3", "d6"], name: "Philidor Defense" },
  { moves: ["e4", "e5", "Nc3"], name: "Vienna Game" },
  { moves: ["e4", "e5", "Bc4"], name: "Bishop's Opening" },
  { moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6"], name: "Sicilian Defense: Najdorf Variation" },
  { moves: ["e4", "c5", "Nf3", "Nc6", "d4", "cxd4", "Nxd4", "g6"], name: "Sicilian Defense: Accelerated Dragon" },
  { moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "g6"], name: "Sicilian Defense: Dragon Variation" },
  { moves: ["e4", "c5", "c3"], name: "Sicilian Defense: Alapin Variation" },
  { moves: ["e4", "c5", "Nc3"], name: "Closed Sicilian" },
  { moves: ["e4", "c5"], name: "Sicilian Defense" },
  { moves: ["e4", "e6", "d4", "d5"], name: "French Defense" },
  { moves: ["e4", "e6"], name: "French Defense" },
  { moves: ["e4", "c6", "d4", "d5"], name: "Caro-Kann Defense" },
  { moves: ["e4", "c6"], name: "Caro-Kann Defense" },
  { moves: ["e4", "d6", "d4", "Nf6"], name: "Pirc Defense" },
  { moves: ["e4", "Nf6"], name: "Alekhine's Defense" },
  { moves: ["e4", "d5"], name: "Scandinavian Defense (Center Counter)" },
  { moves: ["e4", "g6"], name: "Modern Defense" },
  { moves: ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7"], name: "King's Indian Defense (KID)" },
  { moves: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4"], name: "Nimzo-Indian Defense" },
  { moves: ["d4", "Nf6", "c4", "e6", "Nf3", "b6"], name: "Queen's Indian Defense" },
  { moves: ["d4", "Nf6", "c4", "c5"], name: "Benoni Defense" },
  { moves: ["d4", "f5"], name: "Dutch Defense" },
  { moves: ["d4", "d5", "Bf4"], name: "London System" },
  { moves: ["d4", "Nf6", "Bf4"], name: "London System" },
  { moves: ["c4"], name: "English Opening" },
  { moves: ["Nf3"], name: "Réti Opening" },
  { moves: ["b3"], name: "Nimzo-Larsen Attack" },
  { moves: ["f4"], name: "Bird's Opening" },
  { moves: ["e4", "e5"], name: "Open Game (1. e4 e5)" },
  { moves: ["e4"], name: "King's Pawn Opening (1. e4)" },
  { moves: ["d4"], name: "Queen's Pawn Opening (1. d4)" }
];

function detectOpening() {
  const history = game.history();
  if (history.length === 0) return "Starting Position";

  let matchedOpening = null;
  let maxMatchedLen = 0;

  for (const item of OPENINGS_LIST) {
    if (item.moves.length <= history.length) {
      let match = true;
      for (let i = 0; i < item.moves.length; i++) {
        if (history[i] !== item.moves[i]) {
          match = false;
          break;
        }
      }
      if (match && item.moves.length > maxMatchedLen) {
        maxMatchedLen = item.moves.length;
        matchedOpening = item.name;
      }
    }
  }

  return matchedOpening || "Unorthodox / Custom Variation";
}

// 1. Initialize Stockfish Engine
async function initStockfish() {
  const urls = [
    'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js',
    'https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js'
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const scriptText = await response.text();
      const blob = new Blob([scriptText], { type: 'application/javascript' });
      stockfish = new Worker(URL.createObjectURL(blob));
      setupStockfishListeners();
      stockfish.postMessage('uci');
      return;
    } catch (e) {
      console.warn('Trying next Stockfish CDN...', e);
    }
  }

  document.getElementById('engineBadge').textContent = 'Offline Mode';
  document.getElementById('engineSubtext').textContent = 'Could not load remote Stockfish worker.';
}

function setupStockfishListeners() {
  stockfish.onmessage = function(event) {
    const line = typeof event.data === 'string' ? event.data : '';
    if (!line) return;

    if (line === 'uciok') {
      engineReady = true;
      document.getElementById('engineBadge').textContent = 'Stockfish 10 Ready';
      if (currentMode === 'analysis') {
        analyzePosition();
      }
    }

    if (line.startsWith('info depth')) {
      const depthMatch = line.match(/depth (\d+)/);
      const scoreMatch = line.match(/score cp (-?\d+)/);
      const mateMatch = line.match(/score mate (-?\d+)/);
      const pvMatch = line.match(/ pv ([a-h1-8qrbn\s]+)/);

      if (depthMatch) {
        document.getElementById('depthVal').textContent = `${depthMatch[1]} / ${targetDepth}`;
      }

      if (pvMatch) {
        const pvMoves = pvMatch[1].trim().split(/\s+/);
        const topUci = pvMoves[0];
        if (topUci && topUci.length >= 4) {
          currentBestMoveUci = topUci;
          if (currentMode === 'analysis') {
            updateBestMoveDisplay(topUci);
            drawBestMoveArrow(topUci);
          }
        }
        document.getElementById('pvLineText').textContent = `Engine Line: ${pvMoves.slice(0, 5).join(' → ')}`;
      }

      const turnMultiplier = game.turn() === 'w' ? 1 : -1;

      if (mateMatch) {
        const mateRaw = parseInt(mateMatch[1], 10) * turnMultiplier;
        const mateText = `M${Math.abs(mateRaw)}`;
        document.getElementById('evalScore').textContent = mateRaw > 0 ? `+${mateText}` : `-${mateText}`;
        updateEvalBar(mateRaw > 0 ? 10 : -10, mateText);
      } else if (scoreMatch) {
        const cpWhite = (parseInt(scoreMatch[1], 10) * turnMultiplier) / 100;
        const sign = cpWhite > 0 ? '+' : '';
        const formatted = `${sign}${cpWhite.toFixed(2)}`;
        document.getElementById('evalScore').textContent = formatted;
        updateEvalBar(cpWhite, `${sign}${cpWhite.toFixed(1)}`);
      }
    }

    if (line.startsWith('bestmove')) {
      const parts = line.split(' ');
      const bestUci = parts[1];

      if (currentMode === 'bot' && isBotThinking) {
        isBotThinking = false;
        executeBotMove(bestUci);
        return;
      }

      if (bestUci && bestUci !== '(none)') {
        currentBestMoveUci = bestUci;
        if (currentMode === 'analysis') {
          updateBestMoveDisplay(bestUci);
          drawBestMoveArrow(bestUci);
        }
      }
    }
  };
}

function updateBestMoveDisplay(uci) {
  if (!uci || uci.length < 4) return;
  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  const promotion = uci.length > 4 ? uci[4] : 'q';

  const tempGame = new Chess(game.fen());
  const moveObj = tempGame.move({ from, to, promotion });
  const sanText = moveObj ? moveObj.san : `${from}→${to}`;

  document.getElementById('bestMoveText').textContent = `${sanText} (${from.toUpperCase()} → ${to.toUpperCase()})`;
  document.getElementById('engineSubtext').textContent = `Move piece from ${from.toUpperCase()} to ${to.toUpperCase()}`;
}

function updateEvalBar(cpWhite, displayScore) {
  const clamped = Math.max(-10, Math.min(10, cpWhite));
  const whitePercent = 50 + (clamped / 10) * 46;

  document.getElementById('evalBarWhite').style.height = `${whitePercent}%`;
  document.getElementById('evalBarText').textContent = displayScore;

  const wProb = Math.round(whitePercent);
  const bProb = 100 - wProb;
  document.getElementById('whiteProbBar').style.width = `${wProb}%`;
  document.getElementById('whiteProbBar').textContent = `White ${wProb}%`;
  document.getElementById('blackProbBar').style.width = `${bProb}%`;
  document.getElementById('blackProbBar').textContent = `Black ${bProb}%`;

  const explainEl = document.getElementById('evalExplainText');
  if (cpWhite > 1.5) explainEl.textContent = 'White has a winning advantage.';
  else if (cpWhite > 0.4) explainEl.textContent = 'White is slightly better.';
  else if (cpWhite < -1.5) explainEl.textContent = 'Black has a winning advantage.';
  else if (cpWhite < -0.4) explainEl.textContent = 'Black is slightly better.';
  else explainEl.textContent = 'Position is balanced.';
}

function drawBestMoveArrow(uci) {
  clearHighlights();
  const arrowEl = document.getElementById('bestMoveArrow');

  if (!showBestMoveArrow || currentMode === 'bot' || !uci || uci.length < 4 || game.game_over()) {
    arrowEl.setAttribute('visibility', 'hidden');
    return;
  }

  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);

  $(`#myBoard .square-${from}`).addClass('highlight-from');
  $(`#myBoard .square-${to}`).addClass('highlight-to');

  const coordsFrom = squareToSvgCoords(from);
  const coordsTo = squareToSvgCoords(to);

  arrowEl.setAttribute('x1', coordsFrom.x);
  arrowEl.setAttribute('y1', coordsFrom.y);
  arrowEl.setAttribute('x2', coordsTo.x);
  arrowEl.setAttribute('y2', coordsTo.y);
  arrowEl.setAttribute('visibility', 'visible');
}

function squareToSvgCoords(square) {
  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1], 10) - 1;
  const orientation = board.orientation();

  let col, row;
  if (orientation === 'white') {
    col = file;
    row = 7 - rank;
  } else {
    col = 7 - file;
    row = rank;
  }

  return {
    x: col * 12.5 + 6.25,
    y: row * 12.5 + 6.25
  };
}

function clearHighlights() {
  $('#myBoard .square-55d63').removeClass('highlight-from highlight-to');
}

function clearClickHighlights() {
  $('#myBoard .square-55d63').removeClass('square-selected legal-dest-dot legal-dest-capture');
}

function showLegalDestinations(sourceSquare) {
  clearClickHighlights();
  $(`#myBoard .square-${sourceSquare}`).addClass('square-selected');

  const legalMoves = game.moves({ square: sourceSquare, verbose: true });
  for (const m of legalMoves) {
    const $target = $(`#myBoard .square-${m.to}`);
    if (m.captured || game.get(m.to)) {
      $target.addClass('legal-dest-capture');
    } else {
      $target.addClass('legal-dest-dot');
    }
  }
}

function analyzePosition() {
  if (!stockfish || !engineReady) return;
  if (game.game_over()) {
    document.getElementById('bestMoveText').textContent = 'Game Over';
    document.getElementById('bestMoveArrow').setAttribute('visibility', 'hidden');
    return;
  }

  document.getElementById('bestMoveText').textContent = 'Analyzing...';
  stockfish.postMessage('stop');
  stockfish.postMessage('setoption name Skill Level value 20');
  stockfish.postMessage('position fen ' + game.fen());
  stockfish.postMessage('go depth ' + targetDepth);
}

function requestBotMove() {
  if (game.game_over() || !stockfish || !engineReady) return;
  isBotThinking = true;

  document.getElementById('bestMoveText').textContent = `Bot (${botRating}) is thinking...`;
  document.getElementById('engineSubtext').textContent = 'Calculating response...';
  document.getElementById('pvLineText').textContent = 'Bot turn in progress...';
  document.getElementById('bestMoveArrow').setAttribute('visibility', 'hidden');

  const profile = BOT_PROFILES[botRating] || BOT_PROFILES[1400];

  if (Math.random() < profile.blunderRate) {
    const legalMoves = game.moves({ verbose: true });
    if (legalMoves.length > 0) {
      const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      setTimeout(() => {
        if (!isBotThinking) return;
        isBotThinking = false;
        const uciMove = randomMove.from + randomMove.to + (randomMove.promotion || '');
        executeBotMove(uciMove);
      }, profile.moveTime);
      return;
    }
  }

  stockfish.postMessage('stop');
  stockfish.postMessage(`setoption name Skill Level value ${profile.skill}`);
  stockfish.postMessage('position fen ' + game.fen());
  stockfish.postMessage(`go depth ${profile.depth} movetime ${profile.moveTime}`);
}

function executeBotMove(uci) {
  if (!uci || uci === '(none)') {
    isBotThinking = false;
    return;
  }

  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  const promotion = uci.length > 4 ? uci[4] : 'q';

  const move = game.move({ from, to, promotion });
  if (move) {
    redoStack = [];
    board.position(game.fen());
    updateUI();
  }
}

// Drag & Drop Handlers
function onDragStart(source, piece) {
  if (game.game_over()) return false;
  if (isBotThinking) return false;

  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false;
  }

  if (currentMode === 'bot' && game.turn() !== playerColor) {
    return false;
  }

  showLegalDestinations(source);
}

function onDrop(source, target) {
  clearClickHighlights();
  selectedSquare = null;

  const move = game.move({
    from: source,
    to: target,
    promotion: 'q'
  });

  if (move === null) return 'snapback';

  redoStack = [];
  updateUI();
  checkBotTrigger();
}

function onSnapEnd() {
  board.position(game.fen());
}

// Universal Click & Touch handler for mobile & desktop
function handleSquareClick(square) {
  if (game.game_over() || isBotThinking) return;

  if (selectedSquare) {
    const clickedPiece = game.get(square);
    if (clickedPiece && clickedPiece.color === game.turn() &&
        (currentMode !== 'bot' || clickedPiece.color === playerColor)) {
      if (selectedSquare === square) {
        clearClickHighlights();
        selectedSquare = null;
        return;
      }
      selectedSquare = square;
      showLegalDestinations(square);
      return;
    }

    const move = game.move({
      from: selectedSquare,
      to: square,
      promotion: 'q'
    });

    clearClickHighlights();
    selectedSquare = null;

    if (move) {
      redoStack = [];
      board.position(game.fen());
      updateUI();
      checkBotTrigger();
      return;
    }
  }

  const piece = game.get(square);
  if (!piece) return;

  if (piece.color !== game.turn()) return;
  if (currentMode === 'bot' && piece.color !== playerColor) return;

  selectedSquare = square;
  showLegalDestinations(square);
}

function checkBotTrigger() {
  if (currentMode === 'bot' && !game.game_over()) {
    if (game.turn() !== playerColor) {
      setTimeout(() => {
        requestBotMove();
      }, 250);
    }
  }
}

function updateUI() {
  const currentOpening = detectOpening();
  document.getElementById('openingName').textContent = currentOpening;

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

  const history = game.history();
  const emptyHtml = '<div class="move-list-empty">No moves yet</div>';
  if (history.length === 0) {
    document.getElementById('moveHistory').innerHTML = emptyHtml;
    document.getElementById('quickMoveHistory').innerHTML = emptyHtml;
  } else {
    let html = '';
    for (let i = 0; i < history.length; i += 2) {
      const moveNum = Math.floor(i / 2) + 1;
      html += `<div class="move-row">
        <span class="move-num">${moveNum}.</span>
        <span>${history[i] || ''}</span>
        <span>${history[i + 1] || ''}</span>
      </div>`;
    }
    document.getElementById('moveHistory').innerHTML = html;
    document.getElementById('quickMoveHistory').innerHTML = html;
  }

  if (currentMode === 'analysis') {
    analyzePosition();
  }
}

function setGameMode(mode) {
  currentMode = mode;
  selectedSquare = null;
  clearClickHighlights();

  if (mode === 'bot') {
    document.getElementById('modeBotBtn').classList.add('active');
    document.getElementById('modeAnalyzeBtn').classList.remove('active');
    document.getElementById('botControls').style.display = 'flex';
    document.getElementById('playBestBtn').style.display = 'none';
    document.getElementById('panelPrimaryLabel').textContent = 'Bot Status';
    document.getElementById('bestMoveArrow').setAttribute('visibility', 'hidden');
    clearHighlights();
  } else {
    document.getElementById('modeAnalyzeBtn').classList.add('active');
    document.getElementById('modeBotBtn').classList.remove('active');
    document.getElementById('botControls').style.display = 'none';
    document.getElementById('playBestBtn').style.display = 'block';
    document.getElementById('panelPrimaryLabel').textContent = 'Best Move Suggestion';
    analyzePosition();
  }
}

function startNewBotGame() {
  game.reset();
  redoStack = [];
  selectedSquare = null;
  isBotThinking = false;
  clearClickHighlights();
  clearHighlights();

  playerColor = document.getElementById('botSideSelect').value;
  botRating = parseInt(document.getElementById('botRatingSelect').value, 10);

  board.orientation(playerColor === 'w' ? 'white' : 'black');
  board.start();

  updateEvalBar(0, '0.0');
  document.getElementById('evalScore').textContent = '+0.00';
  updateUI();

  if (playerColor === 'b') {
    setTimeout(() => {
      requestBotMove();
    }, 400);
  } else {
    document.getElementById('bestMoveText').textContent = 'Your turn!';
    document.getElementById('engineSubtext').textContent = `Playing against Stockfish bot (${botRating})`;
    document.getElementById('pvLineText').textContent = 'Make your opening move...';
  }
}

$(document).ready(function() {
  const config = {
    draggable: true,
    position: 'start',
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
  };

  board = Chessboard('myBoard', config);

  // Click & Mobile Touch event delegation
  let lastTouchTime = 0;
  $('#myBoard').on('touchstart', '.square-55d63', function() {
    lastTouchTime = Date.now();
  });

  $('#myBoard').on('click touchend', '.square-55d63', function(e) {
    if (e.type === 'click' && Date.now() - lastTouchTime < 450) {
      return; // prevent duplicate trigger after touch
    }
    const square = $(this).attr('data-square');
    if (square) {
      handleSquareClick(square);
    }
  });

  $(window).resize(() => {
    board.resize();
    if (currentBestMoveUci && currentMode === 'analysis') {
      drawBestMoveArrow(currentBestMoveUci);
    }
  });

  initStockfish();
  updateUI();

  // Mode Switchers
  document.getElementById('modeAnalyzeBtn').addEventListener('click', () => {
    setGameMode('analysis');
  });

  document.getElementById('modeBotBtn').addEventListener('click', () => {
    setGameMode('bot');
    startNewBotGame();
  });

  document.getElementById('startBotGameBtn').addEventListener('click', () => {
    startNewBotGame();
  });

  document.getElementById('botRatingSelect').addEventListener('change', (e) => {
    botRating = parseInt(e.target.value, 10);
  });

  // Undo Button
  document.getElementById('undoBtn').addEventListener('click', () => {
    if (isBotThinking) return;
    clearClickHighlights();
    selectedSquare = null;

    if (currentMode === 'bot') {
      game.undo();
      game.undo();
    } else {
      const move = game.undo();
      if (move) redoStack.push(move);
    }
    board.position(game.fen());
    updateUI();
  });

  // Redo Button
  document.getElementById('redoBtn').addEventListener('click', () => {
    if (currentMode === 'bot' || isBotThinking) return;
    clearClickHighlights();
    selectedSquare = null;
    if (redoStack.length > 0) {
      const move = redoStack.pop();
      game.move(move);
      board.position(game.fen());
      updateUI();
    }
  });

  // Flip Board
  document.getElementById('flipBtn').addEventListener('click', () => {
    board.flip();
    if (currentBestMoveUci && currentMode === 'analysis') {
      drawBestMoveArrow(currentBestMoveUci);
    }
  });

  // Play Best Move Button
  document.getElementById('playBestBtn').addEventListener('click', () => {
    if (currentMode === 'bot' || !currentBestMoveUci || game.game_over()) return;
    clearClickHighlights();
    selectedSquare = null;
    const from = currentBestMoveUci.slice(0, 2);
    const to = currentBestMoveUci.slice(2, 4);
    const promotion = currentBestMoveUci.length > 4 ? currentBestMoveUci[4] : 'q';

    const move = game.move({ from, to, promotion });
    if (move) {
      redoStack = [];
      board.position(game.fen());
      updateUI();
    }
  });

  // Reset Button
  document.getElementById('resetBtn').addEventListener('click', () => {
    clearClickHighlights();
    selectedSquare = null;
    if (currentMode === 'bot') {
      startNewBotGame();
    } else {
      game.reset();
      redoStack = [];
      board.start();
      updateEvalBar(0, '0.0');
      document.getElementById('evalScore').textContent = '+0.00';
      updateUI();
    }
  });

  // Toggle Best Move Arrow
  document.getElementById('arrowToggleBtn').addEventListener('click', (e) => {
    showBestMoveArrow = !showBestMoveArrow;
    e.target.textContent = showBestMoveArrow ? '🏹 Arrow: ON' : '🏹 Arrow: OFF';
    e.target.classList.toggle('active-pill', showBestMoveArrow);
    if (currentBestMoveUci && currentMode === 'analysis') {
      drawBestMoveArrow(currentBestMoveUci);
    }
  });

  // Theme Toggle
  document.getElementById('themeBtn').addEventListener('click', (e) => {
    document.body.classList.toggle('wood-theme');
    const isWood = document.body.classList.contains('wood-theme');
    e.target.textContent = isWood ? 'Wood & Cream' : 'Green & White';
  });

  // Load FEN
  document.getElementById('loadFenBtn').addEventListener('click', () => {
    const fen = document.getElementById('fenInput').value.trim();
    if (fen && game.load(fen)) {
      redoStack = [];
      clearClickHighlights();
      selectedSquare = null;
      board.position(game.fen());
      updateUI();
    } else {
      alert('Invalid FEN string!');
    }
  });

  // Tabs Switching
  document.querySelectorAll('.tab').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active-content'));
      tabBtn.classList.add('active');
      const targetId = tabBtn.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active-content');
    });
  });

  // Depth Slider
  document.getElementById('depthSlider').addEventListener('input', (e) => {
    targetDepth = parseInt(e.target.value, 10);
    document.getElementById('depthSliderVal').textContent = targetDepth;
    if (currentMode === 'analysis') {
      analyzePosition();
    }
  });
});
