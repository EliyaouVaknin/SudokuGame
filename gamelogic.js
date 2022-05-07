let gameBoard;
let gameBoardAtStart;

///////////////////////////////////////////////////////////////////////////

function generateRandomBoard() {
	let row = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
	let outArray = new Array(9).fill([]);
	for (let i = 0; i < 9; ++i) {
		if (i > 0) { row = shiftPosition(row, (i % 3 == 0) ? 1 : 3); }
		outArray[i] = row;
	}
	let rotateCount = Math.floor((Math.random() * 3) + 1);
	for (let i = 0; i < rotateCount; ++i) {
		outArray = rotateMatrix(outArray);
	}
	return outArray;
}

function shuffle(array) {
	for (let i in array) {
		let j = Math.floor(Math.random() * 9);
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

function shiftPosition(array, shiftCount) {
	let outArray = Array.from(array);
	for (let i = 0; i < shiftCount; ++i) {
		outArray.push(outArray.shift());
	}
	return outArray;
}

function rotateMatrix(matrix) {
	let outArray = Array(9).fill([]);
	for (let x in matrix) {
		let column = new Array(9);
		for (let y in matrix) {
			column[y] = matrix[y][x];
		}
		outArray[x] = column;
	}
	return outArray;
}

///////////////////////////////////////////////////////////////////////////

function startNewGame(gameDifficulty = difficultySetting) {
	gameBoardAtStart = generateRandomBoard();
	clearCellsAccordingToDifficultySetting(gameDifficulty);
	clearGameBoardAndRefillWithCurrentBoardDataAndLockOccupiedCells();
	repaintCellsAsDefault();
}

function clearCellsAccordingToDifficultySetting(difficulty = "easy") {
	let cellsToClear = 0;
	switch (difficulty) {
		case "debug":
			break;
		case "cake":
			cellsToClear = Math.floor(81 * 0.15);
			break;
		case "medium":
			cellsToClear = Math.floor(81 * 0.5);
			break;
		case "hard":
			cellsToClear = Math.floor(81 * 0.75);
			break;
		case "insane":
			cellsToClear = Math.floor(81 * 0.85);
			break;
		default:
			cellsToClear = Math.floor(81 * 0.25);
	}
	for (let i = 0; i < cellsToClear;) {
		let randomBox = Math.floor(Math.random() * 9);
		let randomPosInBox = Math.floor(Math.random() * 9);
		if (gameBoardAtStart[randomBox][randomPosInBox] != 0) {
			gameBoardAtStart[randomBox][randomPosInBox] = 0;
			i++;
		}
	}
}

function clearGameBoardAndRefillWithCurrentBoardDataAndLockOccupiedCells() {
	gameBoard = cloneGameBoard(gameBoardAtStart);
	for (let boardCell of c_BoardCells.values()) {
		boardCell.innerHTML = '';
		boardCell.removeAttribute("disabled", '');
	}
	for (let y in gameBoard) {
		for (let x in gameBoard[y]) {
			let cellValue = gameBoard[y][x];
			if (cellValue > 0) {
				let boardCell = c_BoardCells.get(`${y}-${x}`);
				boardCell.innerHTML = cellValue;
				boardCell.setAttribute("disabled", '');
			}
		}
	}	
}

function currentBoardDifferentFromBoardAtStart() {
	for (let i in gameBoard) {
		for (let j in gameBoard[i]) {
			if (gameBoard[i][j] != gameBoardAtStart[i][j]) {
				return true;
			}
		}
	}
	return false;
}

///////////////////////////////////////////////////////////////////////////

function checkBoard() {
	//let result = checkAllRows() && checkAllColumns() && checkAllBoxes();
	//let result = checkIfWinRows() && checkIfWinColumns() && checkIfWinBoxes();

	let result = checkIfWinRows() && checkAllColumns() && checkIfWinBoxes();
	showPrompt(result ? "Congratulations! You win!" : "Uh oh, looks like something isn't right...", result ? "victoryPrompt" : "confirmPrompt");
}

function checkSequence(row) {
	for (let i = 1; i <= 9; ++i) {
		if (row.indexOf(i) == -1) {
			return false;
		}
	}
	return true;
}

function checkIfWinRows() {
	for (let i of gameBoard) {
		if (!checkSequence(i)) {
			return false;
		}
	}
	return true;
}

/*
function checkIfWinColumns() {
	let columnsArray = [];
	let checkColumns = new Array(9).fill([]);
	for ( let colSquare = 0; colSquare < 3; colSquare++) {
		for (let colCell = 0; colCell < 3; colCell++) {
			for (let i = 0; i < 9; i += 3) {
				for (let j = 0; j < 9; j += 3) {
					columnsArray.push(gameBoard[i + colSquare][j + colCell])
				}
			}
		}
	}
	checkColumns = makeGameBoardMatrixFromArray(columnsArray);
	console.log(...checkColumns);
	for (let i of checkColumns) {
		if (!checkSequence(i)) {
			return false;
		}
	}
	return true;
}
*/

function checkIfWinBoxes() {
	let boxesArray = [];
	let checkBoxes = new Array(9).fill([]);

	for (let rowCnt = 0; rowCnt < 9; rowCnt += 3) {
		for (let cellCnt = 0; cellCnt < 9; cellCnt += 3) {
			for (let i = rowCnt; i < 3 + rowCnt; ++i) {
				for (let j = cellCnt; j < 3 + cellCnt; ++j) {
					boxesArray.push(gameBoard[i][j]);
				}
			}
		}
	}
	checkBoxes = makeGameBoardMatrixFromArray(boxesArray);
	for (let i of checkBoxes) {
		if (!checkSequence(i)) {
			return false;
		}
	}
	return true;
}

///////////////////////////////////////////////////////////////////////////

/*
function checkAllRows() {
	for (let row of gameBoard) {
		if (!checkSequence(row)) {
			return false;
		}
	}
	return true;
}
*/

function checkAllColumns() {
	for (let x in gameBoard) {
		let column = new Array(9);
		for (let y in gameBoard) {
			column[y] = gameBoard[y][x];
		}
		if (!checkSequence(column)) {
			return false;
		}
	}
	return true;
}

/*
function checkAllBoxes() {
	for (let offsetY = 0; offsetY <= 6; offsetY += 3) {
		for (let offsetX = 0; offsetX <= 6; offsetX += 3) {
			let box = new Array(9);
			let indexCounter = 0;
			for (let y = offsetY; y < offsetY + 3; ++y) {
				for (let x = offsetX; x < offsetX + 3; ++x) {		
					box[indexCounter] = gameBoard[y][x];	
					indexCounter++;
				}
			}
			if (!checkSequence(box)) {
				return false;
			}
		}
	}
	return true;
}
*/