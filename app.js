const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const currentEl = document.getElementById("current");
const xScoreEl = document.getElementById("xScore");
const oScoreEl = document.getElementById("oScore");
const tieScoreEl = document.getElementById("tieScore");

const pvpBtn = document.getElementById("pvpBtn");
const pvcBtn = document.getElementById("pvcBtn");
const resetBtn = document.getElementById("resetBtn");
const undoBtn = document.getElementById("undoBtn");
const clearScoreBtn = document.getElementById("clearScore");

let board = Array(9).fill(null);
let current = "X";
let isPvC = false;
let gameOver = false;
let history = [];

const winningCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function loadScores() {
  const scores = JSON.parse(localStorage.getItem("xo_scores") || "{}");
  xScoreEl.textContent = scores.x || 0;
  oScoreEl.textContent = scores.o || 0;
  tieScoreEl.textContent = scores.t || 0;
}

function saveScores() {
  const scores = {
    x: +xScoreEl.textContent,
    o: +oScoreEl.textContent,
    t: +tieScoreEl.textContent,
  };
  localStorage.setItem("xo_scores", JSON.stringify(scores));
}

function render() {
  boardEl.innerHTML = "";
  board.forEach((val, idx) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    if (val) cell.classList.add(val.toLowerCase());
    cell.dataset.index = idx;
    cell.innerHTML = val || "";
    cell.addEventListener("click", () => onCellClick(idx));
    boardEl.appendChild(cell);
  });
  currentEl.textContent = current;
}

function onCellClick(i) {
  if (gameOver || board[i]) return;
  makeMove(i, current);
  if (isPvC && !gameOver) {
    setTimeout(() => computerMove(), 300);
  }
}

function makeMove(i, player) {
  board[i] = player;
  history.push({ i, player });
  render();
  const result = checkWin();
  if (result) {
    handleEnd(result);
    return;
  }
  current = player === "X" ? "O" : "X";
  render();
}

function checkWin() {
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return { winner: board[a], combo };
  }
  if (board.every(Boolean)) return { tie: true };
  return null;
}

function handleEnd(result) {
  gameOver = true;
  if (result.tie) {
    statusEl.innerHTML = "Result: <strong>It's a tie!</strong>";
    tieScoreEl.textContent = +tieScoreEl.textContent + 1;
  } else {
    statusEl.innerHTML = `Winner: <strong>${result.winner}</strong>`;
    highlightWin(result.combo);
    if (result.winner === "X")
      xScoreEl.textContent = +xScoreEl.textContent + 1;
    else oScoreEl.textContent = +oScoreEl.textContent + 1;
  }
  saveScores();
}

function highlightWin(combo) {
  combo.forEach((i) => {
    const cell = boardEl.querySelector(`[data-index='${i}']`);
    if (cell) cell.classList.add("win");
  });
}

function computerMove() {
  if (gameOver) return;
  let move = findWinningMove("O");
  if (move === null) move = findWinningMove("X");
  if (move === null && !board[4]) move = 4;
  if (move === null) {
    const corners = [0, 2, 6, 8].filter((i) => !board[i]);
    if (corners.length)
      move = corners[Math.floor(Math.random() * corners.length)];
  }
  if (move === null) {
    const available = board
      .map((v, i) => (v ? null : i))
      .filter((n) => n !== null);
    move = available[Math.floor(Math.random() * available.length)];
  }
  makeMove(move, "O");
}

function findWinningMove(player) {
  for (let i = 0; i < 9; i++) {
    if (board[i]) continue;
    board[i] = player;
    const win = winningCombos.some(
      ([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c]
    );
    board[i] = null;
    if (win) return i;
  }
  return null;
}

pvpBtn.addEventListener("click", () => {
  isPvC = false;
  pvpBtn.classList.add("primary");
  pvcBtn.classList.remove("primary");
  resetGame();
});

pvcBtn.addEventListener("click", () => {
  isPvC = true;
  pvcBtn.classList.add("primary");
  pvpBtn.classList.remove("primary");
  resetGame();
});

resetBtn.addEventListener("click", resetGame);
undoBtn.addEventListener("click", undo);
clearScoreBtn.addEventListener("click", () => {
  localStorage.removeItem("xo_scores");
  loadScores();
});

function resetGame() {
  board = Array(9).fill(null);
  current = "X";
  gameOver = false;
  history = [];
  statusEl.innerHTML = "Current: <strong>" + current + "</strong>";
  render();
}

function undo() {
  if (!history.length || gameOver) return;
  const last = history.pop();
  board[last.i] = null;
  if (isPvC && history.length) {
    const last2 = history.pop();
    board[last2.i] = null;
  }
  current =
    history.length && history[history.length - 1].player === "X" ? "O" : "X";
  gameOver = false;
  statusEl.innerHTML = "Current: <strong>" + current + "</strong>";
  render();
}

function init() {
  loadScores();
  pvpBtn.classList.add("primary");
  statusEl.innerHTML = "Current: <strong>" + current + "</strong>";
  render();
}
init();
