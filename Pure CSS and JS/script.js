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

/***************\
| Tile creation |
\***************/

// Creates singular tile/squate for the board
function createTile(color, row, col) {
  const tile = document.createElement("div");
  tile.classList.add("tile","idle");
  tile.style.animationDelay = `${Math.random()*2}s`

  //Storing positions
  tile.dataset.row = row;
  tile.dataset.col = col;

  if(color !== null) {
      tile.style.backgroundColor = color;
      tile.addEventListener("click", () => tileClick(tile))
  } else {
    tile.classList.add("empty");
  }

  return tile;
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

  if(areAdjacent(orgTile, tile)) {
    tileSwap(orgTile, tile);

    let matches = matchCheck();
    while (matches.length > 0) {
      removeMatch(matches);
      tileFall();
      refillTiles();
      matches = matchCheck();
    }

    orgTile.classList.remove("selected");
    tile.classList.remove("selected");
    selectedTile = null;
    refreshBoardVisuals();
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
  for(let col = 0; col < gridSize; col++){
    let emptyRow = gridSize - 1;
    
    for(let row = gridSize - 1; row >= 0; row--){
      if(boardData[row][col] !== null){
        boardData[emptyRow][col] = boardData[row][col];

        if(emptyRow !== row){
          boardData[row][col] = null;
        }
        emptyRow--;
      }
    }
  }
}

/*************\
| Tile Refill |
\*************/

function refillTiles(){
  for(let row = 0; row < gridSize; row++){
    for(let col = 0; col < gridSize; col++){
      if(boardData[row][col] === null){
        const randomColor = tileTypes[Math.floor(Math.random() * tileTypes.length)];
        boardData[row][col] = randomColor;
      }
    }
  }
}

/*******************\
| Animation Scripts |
\*******************/

function swapAnimation(tileA, tileB){
  const rowA = parseInt(tileA.dataset.row);
  const rowB = parseInt(tileB.dataset.row);
  const colA = parseInt(tileA.dataset.col);
  const colB = parseInt(tileB.dataset.col);

  const moveX = (colB - colA) * tileA.offsetWidth;
  const moveY = (rowB - rowA) * tileA.offsetHeight;

  tileA.classList.add("swap");
  tileB.classList.add("swap");

  tileA.style.transform = `translate(${moveX}px, ${moveY}px)`;
  tileB.style.transform = `translate(${-moveX}px, ${-moveY}px)`;
}

function tileAnimationReset(tile){
  tile.style.transform = "";
  tile.classList.remove("selected","swap")
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