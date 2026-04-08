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

/**********************\
| Start/Initialisation |
\**********************/
generateBoardData();
renderBoard();