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

// Creates singular tile/squate
function createTile(color, row, col) {
  const tile = document.createElement("div");
  tile.classList.add("tile");
  tile.style.backgroundColor = color;

  // Temporary for now (will add more later)
  tile.dataset.row = row;
  tile.dataset.col = col;

  return tile;
}

// Creates 8x8 board
function createBoard() {
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const randomColor =
        tileTypes[Math.floor(Math.random() * tileTypes.length)];

      const tile = createTile(randomColor, row, col);
      board.appendChild(tile);
    }
  }
}

// Start
createBoard();