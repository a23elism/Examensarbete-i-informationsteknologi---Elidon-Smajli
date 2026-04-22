/***********\
| Game data |
\***********/

const board = document.getElementById("board");

const gridSize = 8;
const tileSize = 64;
const gridGap = 4;
const gridStep = tileSize + gridGap;
const boardPadding = 8;

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
    tile.classList.add("tile", "idle");

    //Storing positions
    tile.dataset.row = row;
    tile.dataset.col = col;

    if (color !== null) {
        tile.style.backgroundColor = color;
        tile.addEventListener("click", () => tileClick(tile));

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

function createTileClone(tile, row, col) {
    const clone = tile.cloneNode(true);
    clone.classList.remove("selected", "idle", "swap");
    clone.classList.add("clone");

    gsap.killTweensOf(clone);
    clone.style.transition = "none";
    clone.style.transform = "none";

    clone.style.width = `${tileSize}px`;
    clone.style.height = `${tileSize}px`;
    clone.style.left = `${boardPadding + col * gridStep}px`;
    clone.style.top = `${boardPadding + row * gridStep}px`;

    board.appendChild(clone);
    return clone;
}

/*-----*\
| Match |
\*-----*/

function createMatchTile(row, col, color) {
    const piece = document.createElement("div");
    piece.classList.add("explodeTile");
    piece.style.transition = "none";

    piece.style.width = `${tileSize / 2}px`;
    piece.style.height = `${tileSize / 2}px`;
    piece.style.backgroundColor = color;

    piece.style.left = `${boardPadding + col * gridStep + tileSize / 4}px`;
    piece.style.top = `${boardPadding + row * gridStep + tileSize / 4}px`;

    board.appendChild(piece);
    return piece;
}

/***************************\
| Board creation/generation |
\***************************/

// Creates/Generates data for the 8x8 board
function generateBoardData() {
    boardData.length = 0;
    for (let row = 0; row < gridSize; row++) {
        const currrentRow = [];

        for (let col = 0; col < gridSize; col++) {
            const randomColor = tileTypes[Math.floor(Math.random() * tileTypes.length)];
            currrentRow.push(randomColor);
        }
        boardData.push(currrentRow);
    }
}

/*****************\
| Board Rendering |
\*****************/

function renderBoard() {
    board.innerHTML = "";

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
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

function tileClick(tile) {
    if (isAnimating) return;

    if (selectedTile === tile) {
        tile.classList.remove("selected");
        tile.classList.add("idle");
        selectedTile = null;
        return;
    }

    if (!selectedTile) {
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

        swapAnimation(orgTile, tile, () => {
            tileSwap(orgTile, tile);
            refreshBoardVisuals();

            const matches = matchCheck();

            if (matches.length > 0) {
                allMatches(matches);
                return;
            }

            selectedTile = null;
            isAnimating = false;
        });

        return;
    }

    orgTile.classList.remove("selected");
    orgTile.classList.add("idle");

    selectedTile = tile;
    tile.classList.add("selected");
    tile.classList.remove("idle");
}

/***********\
| Tile Swap |
\***********/

function areAdjacent(tileA, tileB) {
    const rowA = parseInt(tileA.dataset.row);
    const rowB = parseInt(tileB.dataset.row);
    const colA = parseInt(tileA.dataset.col);
    const colB = parseInt(tileB.dataset.col);

    const rowDiff = Math.abs(rowA - rowB);
    const colDiff = Math.abs(colA - colB);

    return rowDiff + colDiff === 1;
}

function tileSwap(tileA, tileB) {
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
    for (let row = 0; row < gridSize; row++) {
        let count = 1;
        for (let col = 1; col < gridSize; col++) {
            const currrent = boardData[row][col];
            const previous = boardData[row][col - 1];

            if (currrent !== null && currrent === previous) {
                count++;
            } else {
                if (count >= 3) {
                    for (let i = 0; i < count; i++) {
                        matchPos.push([row, col - 1 - i]);
                    }
                }
                count = 1;
            }
        }
        if (count >= 3) {
            for (let i = 0; i < count; i++) {
                matchPos.push([row, gridSize - 1 - i]);
            }
        }
    }

    /**********\
    | Vertical |
    \**********/
    for (let col = 0; col < gridSize; col++) {
        let count = 1;
        for (let row = 1; row < gridSize; row++) {
            const currrent = boardData[row][col];
            const previous = boardData[row - 1][col];

            if (currrent !== null && currrent === previous) {
                count++;
            } else {
                if (count >= 3) {
                    for (let i = 0; i < count; i++) {
                        matchPos.push([row - 1 - i, col]);
                    }
                }
                count = 1;
            }
        }
        if (count >= 3) {
            for (let i = 0; i < count; i++) {
                matchPos.push([gridSize - 1 - i, col]);
            }
        }
    }

    return matchPos;
}

function removeMatch(match) {
    for (const [row, col] of match) {
        boardData[row][col] = null;
    }
}

/***********\
| Tile Fall |
\***********/

function tileFall() {
    const fallingTiles = [];
    for (let col = 0; col < gridSize; col++) {
        let emptyRow = gridSize - 1;
        for (let row = gridSize - 1; row >= 0; row--) {
            if (boardData[row][col] !== null) {
                if (emptyRow !== row) {
                    fallingTiles.push({
                        color: boardData[row][col],
                        fromRow: row,
                        toRow: emptyRow,
                        col: col,
                        isNew: false
                    });
                }
                boardData[emptyRow][col] = boardData[row][col];

                if (emptyRow !== row) {
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

function refillTiles() {
    const newTiles = [];
    for (let col = 0; col < gridSize; col++) {
        let spawnOffset = 0;
        for (let row = gridSize - 1; row >= 0; row--) {
            if (boardData[row][col] === null) {
                const randomColor = tileTypes[Math.floor(Math.random() * tileTypes.length)];
                boardData[row][col] = randomColor;
                newTiles.push({
                    color: randomColor,
                    fromRow: -1 - spawnOffset,
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

function swapAnimation(tileA, tileB, onComplete) {
    const rowA = parseInt(tileA.dataset.row);
    const rowB = parseInt(tileB.dataset.row);
    const colA = parseInt(tileA.dataset.col);
    const colB = parseInt(tileB.dataset.col);

    const cloneA = createTileClone(tileA, rowA, colA);
    const cloneB = createTileClone(tileB, rowB, colB);

    const moveX = (colB - colA) * gridStep;
    const moveY = (rowB - rowA) * gridStep;

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
            tileB.style.visibility = "visible";
            if (onComplete) onComplete();
        }
    });
}

function tileAnimationReset(tile) {
    tile.style.transform = "";
    tile.classList.remove("selected", "swap");
    tile.classList.add("idle");
}

/*---------------*\
| Match Animation |
\*---------------*/

function animateMatch(matchPositions, onComplete) {
    const tl = gsap.timeline({ onComplete });

    const uniquePositions = [];
    const seen = new Set();

    for (const [row, col] of matchPositions) {
        const key = `${row}-${col}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniquePositions.push([row, col]);
        }
    }
    for (const [row, col] of uniquePositions) {
        const tile = document.querySelector(
            `.tile[data-row="${row}"][data-col="${col}"]`
        );

        const color = boardData[row][col];

        if (tile && color !== null) {
            tile.classList.remove("idle", "selected");
            tile.classList.add("matched");
            tile.style.visibility = "hidden";

            for (let i = 0; i < 4; i++) {
                const piece = createMatchTile(row, col, color);

                tl.to(piece, {
                    x: (Math.random() - 0.5) * 180,
                    y: (Math.random() - 0.5) * 180,
                    rotation: (Math.random() - 0.5) * 360,
                    scale: 0.4,
                    opacity: 0,
                    duration: 0.45,
                    ease: "power2.out",
                    onComplete: () => piece.remove()
                }, 0);
            }
        }
    }

    if (tl.getChildren().length === 0 && onComplete) {
        onComplete();
    }
}

function allMatches(matches) {
    if (matches.length === 0) {
        selectedTile = null;
        isAnimating = false;
        refreshBoardVisuals();
        return;
    }

    animateMatch(matches, () => {
        removeMatch(matches);

        const fallenTiles = tileFall();
        const newTiles = refillTiles();

        animateFall([...fallenTiles, ...newTiles], () => {
            refreshBoardVisuals();

            const newMatches = matchCheck();
            allMatches(newMatches);
        });
    });
}

/*---------------*\
| Fall Animation |
\*---------------*/

function animateFall(fallingData, onComplete) {
    const tl = gsap.timeline({ onComplete });

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
        piece.style.transition = "none";

        piece.style.width = `${tileSize}px`;
        piece.style.height = `${tileSize}px`;
        piece.style.borderRadius = "12px";
        piece.style.border = "2px solid grey";
        piece.style.backgroundColor = item.color;

        piece.style.left = `${boardPadding + item.col * gridStep}px`;
        piece.style.top = `${boardPadding + item.fromRow * gridStep}px`;

        board.appendChild(piece);

        tl.to(piece, {
            y: (item.toRow - item.fromRow) * gridStep,
            duration: 0.3,
            ease: "bounce.out",
            onComplete: () => piece.remove()
        }, 0);
    });
    if (tl.getChildren().length === 0 && onComplete) {
        onComplete();
    }
}

/**********************\
| Start/Initialisation |
\**********************/
generateBoardData();
let matches = matchCheck();
while (matches.length > 0) {
    removeMatch(matches);
    tileFall();
    refillTiles();
    matches = matchCheck();
}
renderBoard();

/**************\
| Testing Tool |
\**************/

class PerformanceTester {
    constructor() {
        this.performanceData = [];
        this.frames = 0;
        this.longTaskCount = 0;
        this.lastTime = performance.now();
        this.startTime = performance.now();
        this.isRunning = false;
        this.botInterval = null;
        this.observer = null;
    }

    setupObserver() {
        try {
            this.observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.longTaskCount++;
                }
            });
            this.observer.observe({ type: 'longtask', buffered: true });
        } catch (e) {
            console.warn("Long Task observation not working ¯\_(ツ)_/¯ (i dont know why)");
        }
    }

    measureMetrics = () => {
        if (!this.isRunning) return;

        this.frames++;
        const now = performance.now();

        if (now - this.lastTime >= 1000) {
            const fps = Math.round((this.frames * 1000) / (now - this.lastTime));
            const elapsedTime = Math.round((now - this.startTime) / 1000);

            let memoryMB = 0;
            if (performance.memory) {
                memoryMB = Math.round(performance.memory.usedJSHeapSize / (1024 * 1024));
            }

            this.performanceData.push({
                second: elapsedTime,
                fps: fps,
                memory: memoryMB,
                LongTasks: this.longTaskCount
            });

            console.log(`Time: ${elapsedTime} | FPS: ${fps} | RAM: ${memoryMB} | Stutters ${this.longTaskCount}`);

            this.frames = 0;
            this.longTaskCount = 0;
            this.lastTime = now;
        }

        requestAnimationFrame(this.measureMetrics);
    };

    runBot() {
        this.botInterval = setInterval(() => {
            if(typeof isAnimating !== undefined && isAnimating) return;

            const tiles = Array.from(document.querySelectorAll(".tile:not(.empty)"));
            if(tiles.length === 0) return;

            const randomTile = tiles[Math.floor(Math.random() * tiles.length)];
            const row = parseInt(randomTile.dataset.row);
            const col = parseInt(randomTile.dataset.col);
            
            const adjacentTiles = tiles.filter(t => {
                const tRow = parseInt(t.dataset.row);
                const tCol = parseInt(t.dataset.col);
                return(tRow === row && tCol === col +1) || (tRow === row +1 && tCol === col);
            });

            if(adjacentTiles.length > 0) {
                const neighbor = adjacentTiles[Math.floor(Math.random() * adjacentTiles.length)];
                randomTile.click();
                setTimeout(() => neighbor.click(), 100);
            }
        }, 400);
    }
}