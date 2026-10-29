const boardEl = document.getElementById("chessboard");
const historyEl = document.getElementById("moveHistory");

const start = [
  ["br","bn","bb","bq","bk","bb","bn","br"],
  ["bp","bp","bp","bp","bp","bp","bp","bp"],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["wp","wp","wp","wp","wp","wp","wp","wp"],
  ["wr","wn","wb","wq","wk","wb","wn","wr"]
];

const pieceNames = {
  wk:"white-k", wq:"white-q", wr:"white-r", wb:"white-b", wn:"white-n", wp:"white-p",
  bk:"black-k", bq:"black-q", br:"black-r", bb:"black-b", bn:"black-n", bp:"black-p"
};

let position = structuredClone(start);
let flipped = false;
let selected = null;
let moves = [];

function renderBoard(){
  boardEl.innerHTML = "";
  const rows = [...Array(8).keys()];
  const cols = [...Array(8).keys()];
  if(flipped){ rows.reverse(); cols.reverse(); }

  rows.forEach(r=>{
    cols.forEach(c=>{
      const sq=document.createElement("button");
      sq.className="square "+(((r+c)%2===0)?"light":"dark");
      sq.dataset.r=r; sq.dataset.c=c;

      if(selected && selected.r===r && selected.c===c) sq.classList.add("selected");

      const piece=position[r][c];
      if(piece){
        const img=document.createElement("img");
        img.className="piece";
        img.alt="";
        img.src=`pieces/${pieceNames[piece]}.png`;
        sq.appendChild(img);
      }
      sq.addEventListener("click",()=>selectSquare(r,c));
      boardEl.appendChild(sq);
    });
  });
}

function selectSquare(r,c){
  if(!selected){
    if(position[r][c]){ selected={r,c}; renderBoard(); }
    return;
  }
  if(selected.r===r && selected.c===c){ selected=null; renderBoard(); return; }

  const moving=position[selected.r][selected.c];
  const target=position[r][c];

  // Visual move preview only in this build; full legal chess rules come next.
  if(moving && (!target || moving[0]!==target[0])){
    position[r][c]=moving;
    position[selected.r][selected.c]="";
    moves.push(`${squareName(selected.r,selected.c)}${squareName(r,c)}`);
    historyEl.textContent=moves.join("  ");
  }
  selected=null;
  renderBoard();
}

function squareName(r,c){
  return "abcdefgh"[c]+(8-r);
}

document.getElementById("flipBtn").onclick=()=>{
  flipped=!flipped; selected=null; renderBoard();
};
document.getElementById("resetBtn").onclick=()=>{
  position=structuredClone(start); moves=[]; selected=null;
  historyEl.textContent="No moves yet"; renderBoard();
};
document.getElementById("undoBtn").onclick=()=>alert("Full Undo/Redo will be enabled with the legal move system.");
document.getElementById("redoBtn").onclick=()=>alert("Full Undo/Redo will be enabled with the legal move system.");

const themes=[
  ["Green & White",""],
  ["Black & White","theme-black"],
  ["Premium Wood","theme-premium"]
];
let themeIndex=0;
document.getElementById("themeBtn").onclick=()=>{
  document.body.classList.remove("theme-black","theme-premium");
  themeIndex=(themeIndex+1)%themes.length;
  const [label,cls]=themes[themeIndex];
  if(cls) document.body.classList.add(cls);
  document.getElementById("themeBtn").innerHTML=`${label} <span>⌄</span>`;
};

renderBoard();
