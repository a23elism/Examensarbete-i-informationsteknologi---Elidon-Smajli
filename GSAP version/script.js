/***********\
| Game data |
\***********/

const board = document.getElementById("board");

const gridSize = 8;

const tileTypes = [
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "orange"
];

const boardData = [];

let selectedTile = null;
let isAnimating = false;

/***************\
| Tile creation |
\***************/

/*------*\
| Normal |
\*------*/
// Creates singular tile/squate for the board
function createTile(color, row, col) {
  const tile = document.createElement("div");
  tile.classList.add("tile","idle");

  //Storing positions
  tile.dataset.row = row;
  tile.dataset.col = col;

  if(color !== null) {
      tile.style.backgroundColor = color;
      tile.addEventListener("click", () => tileClick(tile))

      gsap.to(tile, {
        scale: 0.92,
        duration: 0.8 + Math.random() * 0.4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: Math.random() * 2 
      });
  } else {
    tile.classList.add("empty");
  }

  return tile;
}

/*-----*\
| Clone |
\*-----*/

function createTileClone(tile) {
  const rect = tile.getBoundingClientRect();
  const boardRect = board.getBoundingClientRect();

  const clone = tile.cloneNode(true);
  clone.classList.remove("selected", "idle", "swap");
  clone.classList.add("clone");

  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  clone.style.left = `${rect.left - boardRect.left}px`;
  clone.style.top = `${rect.top - boardRect.top}px`;

  board.appendChild(clone);
  return clone;
}

/*-----*\
| Match |
\*-----*/

function createMatchTile(tile, color){
  const tileRect = tile.getBoundingClientRect();
  const boardRect = board.getBoundingClientRect();

  const piece = document.createElement("div");
  piece.classList.add("explodeTile");

  piece.style.width = `${tileRect.width / 2}px`;
  piece.style.height = `${tileRect.height / 2}px`;
  piece.style.backgroundColor = color;

  piece.style.left = `${tileRect.left - boardRect.left + tileRect.width / 4}px`;
  piece.style.top = `${tileRect.top - boardRect.top + tileRect.height / 4}px`;

  board.appendChild(piece);
  return piece;
}

/***************************\
| Board creation/generation |
\***************************/

// Creates/Generates data for the 8x8 board
function generateBoardData(){
  boardData.length = 0;
  for (let row = 0; row < gridSize; row++) {
    const currrentRow = [];

    for (let col = 0; col < gridSize; col++) {
      const randomColor = tileTypes[Math.floor(Math.random() * tileTypes.length)];
      currrentRow.push(randomColor);
    }
    boardData.push(currrentRow)
  }
}

/*****************\
| Board Rendering |
\*****************/

function renderBoard(){
  board.innerHTML = "";

  for(let row = 0; row < gridSize; row++){
    for(let col = 0; col < gridSize; col++){
      const tile = createTile(boardData[row][col], row, col);
      board.appendChild(tile);
    }
  }
}

function updateTileVisual(tile, value) {
  tile.style.backgroundColor = value !== null ? value : "";
  tile.classList.toggle("empty", value === null);

  tile.classList.remove("matched");
  tile.style.visibility = "visible";

  if (!tile.classList.contains("selected")) {
    tile.classList.add("idle");
  }
}

function refreshBoardVisuals() {
  const tiles = document.querySelectorAll(".tile");

  tiles.forEach(tile => {
    const row = parseInt(tile.dataset.row);
    const col = parseInt(tile.dataset.col);

    updateTileVisual(tile, boardData[row][col]);
  });
}

/*******************\
| User Interactions |
\*******************/

function tileClick(tile){
  if (isAnimating) return;
  if(selectedTile === tile){
    tile.classList.remove("selected");
    tile.classList.add("idle");
    selectedTile = null;
    return;
  }

  if(!selectedTile){
    selectedTile = tile;
    tile.classList.add("selected");
    tile.classList.remove("idle");
    return;
  }

  const orgTile = selectedTile;

  if (areAdjacent(orgTile, tile)) {
  isAnimating = true;

  orgTile.classList.remove("selected", "idle");
  tile.classList.remove("selected", "idle");

  swapAnimation(orgTile, tile);

  setTimeout(() => {
    tileSwap(orgTile, tile);
    refreshBoardVisuals();
    let matches = matchCheck();

    if (matches.length > 0) {
      allMatches(matches);
      return;
    }

    selectedTile = null;
    isAnimating = false;
  }, 200);

  return;
}

  orgTile.classList.remove("selected");
  selectedTile = tile;
  tile.classList.add("selected");
}

/***********\
| Tile Swap |
\***********/

function areAdjacent(tileA, tileB){
  const rowA = parseInt(tileA.dataset.row);
  const rowB = parseInt(tileB.dataset.row);
  const colA = parseInt(tileA.dataset.col);
  const colB = parseInt(tileB.dataset.col);

  const rowDiff = Math.abs(rowA - rowB);
  const colDiff = Math.abs(colA - colB);
  
  return rowDiff + colDiff === 1;
}

function tileSwap(tileA, tileB){
  const rowA = parseInt(tileA.dataset.row);
  const rowB = parseInt(tileB.dataset.row);
  const colA = parseInt(tileA.dataset.col);
  const colB = parseInt(tileB.dataset.col);

  const temp = boardData[rowA][colA];
  boardData[rowA][colA] = boardData[rowB][colB];
  boardData[rowB][colB] = temp;
}

/****************\
| Match Checking |
\****************/

function matchCheck() {
  const matchPos = [];

  /************\
  | Horizontal |
  \************/
  for(let row = 0; row < gridSize; row++) {
    let count = 1;
    for(let col = 1; col < gridSize; col++) {
      const currrent = boardData[row][col];
      const previous = boardData[row][col - 1];

      if(currrent !== null && currrent === previous) {
        count++;
      } else{
        if(count >= 3){
          for(let i = 0; i < count; i++){
            matchPos.push([row, col - 1 - i]);
          }
        }
        count = 1;
      }
    }
    if(count >= 3) {
      for(let i = 0; i < count; i++) {
        matchPos.push([row, gridSize - 1 - i]);
      }
    }
  }

  /**********\
  | Vertical |
  \**********/
  for(let col = 0; col < gridSize; col++) {
    let count = 1;
    for(let row = 1; row < gridSize; row++) {
      const currrent = boardData[row][col];
      const previous = boardData[row - 1][col];

      if(currrent !== null && currrent === previous){
        count++;
      } else{
        if(count >= 3){
          for(let i = 0; i < count; i++){
            matchPos.push([row - 1 - i, col]);
          }
        }
        count = 1;
      }
    }
    if(count >= 3){
      for(let i = 0; i < count; i++){
        matchPos.push([gridSize - 1 - i, col])
      }
    }
  }

  return matchPos;
}

function removeMatch(match){
  for(const [row, col] of match){
    boardData[row][col] = null;
  }
}

/***********\
| Tile Fall |
\***********/

function tileFall(){
  const fallingTiles = [];
  for(let col = 0; col < gridSize; col++){
    let emptyRow = gridSize - 1;
    for(let row = gridSize - 1; row >= 0; row--){
      if (boardData[row][col] !== null) {
        if (emptyRow !== row){
          fallingTiles.push({
            color: boardData[row][col],
            fromRow: row,
            toRow: emptyRow,
            col: col,
            isNew: false
          });
        } 
        boardData[emptyRow][col] = boardData[row][col];

        if(emptyRow !== row){
          boardData[row][col] = null;
        }
        emptyRow--;
      }
    }
  }
  return fallingTiles;
}

/*************\
| Tile Refill |
\*************/

function refillTiles(){
  const newTiles = [];
  for (let col = 0; col < gridSize; col++){
    let spawnOffset = 0;
    for (let row = gridSize - 1; row >= 0; row--){
      if (boardData[row][col] === null){
        const randomColor = tileTypes[Math.floor(Math.random() * tileTypes.length)];
        boardData[row][col] = randomColor;
        newTiles.push({
          color: randomColor,
          fromRow: 0,
          toRow: row,
          col: col,
          isNew: true
        });
        spawnOffset++;
      }
    }
  }
  return newTiles;
}

/*******************\
| Animation Scripts |
\*******************/

/*--------------*\
| Swap Animation |
\*--------------*/

function swapAnimation(tileA, tileB) {
  const cloneA = createTileClone(tileA);
  const cloneB = createTileClone(tileB);

  const rowA = parseInt(tileA.dataset.row);
  const rowB = parseInt(tileB.dataset.row);
  const colA = parseInt(tileA.dataset.col);
  const colB = parseInt(tileB.dataset.col);

  const moveX = (colB - colA) * tileA.offsetWidth;
  const moveY = (rowB - rowA) * tileA.offsetHeight;

  tileA.style.visibility = "hidden";
  tileB.style.visibility = "hidden";

  gsap.to(cloneA, {
    x: moveX,
    y: moveY,
    duration: 0.2,
    ease: "power1.inOut"
  });
  gsap.to(cloneB, {
    x: -moveX,
    y: -moveY,
    duration: 0.2,
    ease: "power1.inOut",
    onComplete: () => {
      cloneA.remove();
      cloneB.remove();
      tileA.style.visibility = "visible";
      tileA.style.visibility = "visible";
    }
  });
}

function tileAnimationReset(tile){
  tile.style.transform = "";
  tile.classList.remove("selected","swap")
  tile.classList.add("idle");
}

/*---------------*\
| Match Animation |
\*---------------*/

function explodeTile(tile, color){
  tile.classList.remove("idle", "selected");
  tile.classList.add("matched");
  tile.style.visibility = "hidden";

  const pieces = [];

  for (let i = 0; i < 4; i++) {
    const piece = createMatchTile(tile, color);
    pieces.push(piece);
  }

  requestAnimationFrame(() => {
    pieces.forEach(piece => {
      const moveX = (Math.random() - 0.5) * 180;
      const moveY = (Math.random() - 0.5) * 180;
      const rotate = (Math.random() - 0.5) * 360;

      piece.style.transform =
        `translate(${moveX}px, ${moveY}px) rotate(${rotate}deg) scale(0.4)`;
      piece.style.opacity = "0";
    });
  });

  setTimeout(() => {
    pieces.forEach(piece => piece.remove());
  }, 450);
}

function animateMatch(matchPositions) {
  for (const [row, col] of matchPositions) {
    const tile = document.querySelector(
      `.tile[data-row="${row}"][data-col="${col}"]`
    );

    const color = boardData[row][col];

    if (tile && color !== null) {
      explodeTile(tile, color);
    }
  }
}

function allMatches(matches) {
  if (matches.length === 0) {
    selectedTile = null;
    isAnimating = false;
    refreshBoardVisuals();
    return;
  }

  animateMatch(matches);

  setTimeout(() => {
    removeMatch(matches);

    const fallenTiles = tileFall();
    const newTiles = refillTiles();

    animateFall([...fallenTiles, ...newTiles]);

    setTimeout(() => {
      refreshBoardVisuals();

      const newMatches = matchCheck();
      allMatches(newMatches);
    }, 300);
  }, 450);
}

/*---------------*\
| Fall Animation |
\*---------------*/

function animateFall(fallingData){
  fallingData.forEach(item => {
    if (!item.isNew) {
      const originalTile = document.querySelector(
        `.tile[data-row="${item.fromRow}"][data-col="${item.col}"]`
      );

      if (originalTile) {
        originalTile.style.visibility = "hidden";
      }
    }

    const piece = document.createElement("div");
    piece.classList.add("clone");

    piece.style.width = "64px";
    piece.style.height = "64px";
    piece.style.borderRadius = "12px";
    piece.style.border = "2px solid grey";
    piece.style.backgroundColor = item.color;

    const tileSize = 64;
    const gap = 4;
    const padding = 8;
    const step = tileSize + gap;

    piece.style.left = `${padding + item.col * step}px`;
    piece.style.top = `${padding + item.fromRow * step}px`;

    board.appendChild(piece);

    requestAnimationFrame(() => {
      piece.style.transform = `translateY(${(item.toRow - item.fromRow) * step}px)`;
    });

    setTimeout(() => {
      piece.remove();
    }, 300);
  });
}

/**********************\
| Start/Initialisation |
\**********************/
generateBoardData();
let matches = matchCheck();
while(matches.length > 0){
  removeMatch(matches);
  tileFall();
  refillTiles();
  matches = matchCheck();
}
renderBoard();