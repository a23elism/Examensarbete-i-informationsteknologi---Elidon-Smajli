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
  tile.classList.add("tile");
  tile.style.backgroundColor = color;

  //Storing positions
  tile.dataset.row = row;
  tile.dataset.col = col;

  tile.addEventListener("click", () => tileClick(tile))

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
      const color = boardData[row][col];
      const tile = createTile(color, row, col);
      board.appendChild(tile);
    }

  }
}

/*******************\
| User Interactions |
\*******************/

function tileClick(tile){
  if(selectedTile === tile){
    tile.classList.remove("selected");
    selectedTile = null;
    return;
  }

  if(!selectedTile){
    selectedTile = tile;
    tile.classList.add("selected");
    return;
  }

  const orgTile = selectedTile;

  if (areAdjacent(orgTile, tile)) {
    tileSwap (orgTile, tile);
    selectedTile = null;
    renderBoard();
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

/**********************\
| Start/Initialisation |
\**********************/
generateBoardData();
renderBoard();