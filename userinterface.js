const c_PageContainer = document.getElementById("page-container");
const c_PromptWindow = document.getElementById("prompt-container");
const c_LoginErrorMessage = document.getElementById("login-error-message");
const c_RegisterErrorMessage = document.getElementById("register-error-message");
const c_BoardContainer = document.getElementById("board-container");
const c_InputWindow = document.getElementById("game-input-container");

const c_Screens = new Map([
	["loginScreen", document.getElementById("login-screen")],
	["registerScreen", document.getElementById("register-screen")],
	["difficultyScreen", document.getElementById("difficulty-screen")],
	["boardScreen", document.getElementById("board-screen")]
]);

const c_Prompts = new Map([
	["victoryPrompt", document.getElementById("prompt-game-win-button-container")],
	["confirmPrompt", document.getElementById("prompt-confirm-button-container")],
	["dialogPrompt", document.getElementById("prompt-dialog-button-container")]
]);

const c_BoardCells = new Map();

const c_MinZoom = 0.25;
const c_MaxZoom = (window.screen.height * window.devicePixelRatio >= 1920) ? 2 : 1.4;
const c_ZoomStep = 0.01;

const c_PageContainerInitialWidth = c_PageContainer.offsetWidth;
const c_PageContainerInitialHeight = c_PageContainer.offsetHeight;
const c_PageContainerWidthScaleStep = Math.floor(c_PageContainerInitialWidth * c_ZoomStep);
const c_PageContainerHeightScaleStep = Math.floor(c_PageContainerInitialHeight * c_ZoomStep);

let zoomLevel = 1;

let promptActive = false;
let promptResult = false;

let difficultySetting;
let selectedCellIndex = [];

///////////////////////////////////////////////////////////////////////////

function createInterfaceElements() {
	let boardContainer = document.getElementById("board-container");
	let numInputButtonContainer = document.getElementById("number-button-container");
	for (let i = 0; i < 9; ++i) {
		let numInputButton = document.createElement("button");
		numInputButton.setAttribute("class", "number-input-button");
		numInputButton.setAttribute("value", i + 1);
		numInputButton.innerHTML = i + 1;
		numInputButtonContainer.appendChild(numInputButton);

		let boardBox = document.createElement("div");
		boardBox.setAttribute("class", "board-box");
		boardBox.setAttribute("id", `board-box-${i}`);
		boardContainer.appendChild(boardBox);
	}

	let boxIndex = 0;
	for (let offsetY = 0; offsetY <= 6; offsetY += 3) {
		for (let offsetX = 0; offsetX <= 6; offsetX += 3) {
			for (let y = offsetY; y < offsetY + 3; ++y) {
				for (let x = offsetX; x < offsetX + 3; ++x) {
					let boardCell = document.createElement("button");
					boardCell.setAttribute("class", "board-cell");
					boardCell.setAttribute("id", `${y}-${x}`);
					c_BoardCells.set(boardCell.id, boardCell);
					boardContainer.children[boxIndex].appendChild(boardCell);
				}
			}
			boxIndex++;
		}
	}
}

///////////////////////////////////////////////////////////////////////////

function showScreen(screenToShow) {
	hideErrorMessages();
	for (let screen of c_Screens.values()) {
		screen.style.display = "none";
	}
	c_Screens.get(screenToShow).style.display = "block";
}

function showLoginErrorMessage(message) {
	c_LoginErrorMessage.style.visibility = "visible";
	c_LoginErrorMessage.innerHTML = message; 
}

function showRegistrationErrorMessage(message) {
	c_RegisterErrorMessage.style.visibility = "visible";
	c_RegisterErrorMessage.innerHTML = message; 
}

function hideErrorMessages() {
	c_LoginErrorMessage.style.visibility = "hidden";
	c_LoginErrorMessage.innerHTML = "ErrorMessage";

	c_RegisterErrorMessage.style.visibility = "hidden";
	c_RegisterErrorMessage.innerHTML = "ErrorMessage";
}

function showBoardScreenAndStartNewGameWithSelectedDifficulty(selectedDifficulty) {
	difficultySetting = selectedDifficulty;
	startNewGame(difficultySetting);
	showScreen("boardScreen");
}

///////////////////////////////////////////////////////////////////////////

function selectBoardCell(boardCell) {
	selectedCellIndex = boardCell.id.split('-');
	c_InputWindow.style.visibility = "visible";
	paintOptionsCells();
}

function deselectBoardCell() {
	repaintCellsAsDefault();
	c_InputWindow.style.visibility = "hidden";
	selectedCellIndex.length = 0;
	document.activeElement.blur();	
}

function deselectBoardCellIfClickOnBody(event) {
	if (event.target == document.body) { deselectBoardCell(); }
}

function clearSelectedBoardCell() {
	if (selectedCellIndex.length > 0) {
		gameBoard[selectedCellIndex[0]][selectedCellIndex[1]] = 0;
		let boardCell = c_BoardCells.get(selectedCellIndex.join('-'));
		boardCell.innerHTML = '';
		boardCell.focus();
	}
}

function applyNumberValueToSelectedBoardCell(numberValue) {
	if (selectedCellIndex.length > 0) {
		gameBoard[selectedCellIndex[0]][selectedCellIndex[1]] = parseInt(numberValue);
		c_BoardCells.get(selectedCellIndex.join('-')).innerHTML = numberValue;
		deselectBoardCell();
	}
}

function applyNumberValueToSelectedBoardCellViaKeyboard(keyboardEvent) {
	if (document.activeElement.id == keyboardEvent.target.id) {
		if (keyboardEvent.key == "Escape") {
			deselectBoardCell();
		} else if (keyboardEvent.key == "Delete" || keyboardEvent.key == "Backspace") {
			clearSelectedBoardCell();
		} else if ((keyboardEvent.key >= 1 && keyboardEvent.key <= 9)) {
			applyNumberValueToSelectedBoardCell(keyboardEvent.key);
		}
	}
}

///////////////////////////////////////////////////////////////////////////

function showPrompt(message, promptType) {
	c_PromptWindow.style.display = "flex";
	c_PromptWindow.children[0].children[0].innerHTML = message;

	for (let prompt of c_Prompts.values()) {
		prompt.style.display = "none";
	}
	c_Prompts.get(promptType).style.display = "flex";
	promptActive = true;
}

function hidePrompt() {
	c_PromptWindow.style.display = "none";
	promptActive = false;
	promptResult = false;
}

function confirmActionIfBoardWasModified(action) {
	if (currentBoardDifferentFromBoardAtStart()) {
		showPrompt("All progress will be lost, are you sure?", "dialogPrompt");
		waitForDialogPromptConfirm(action);
	} else {
		switch (action) {
			case "clearBoard":
				clearGameBoardAndRefillWithCurrentBoardDataAndLockOccupiedCells();
				break;
			case "startNewGame":
				startNewGame();
				break;
			case "changeDifficulty":
				showScreen("difficultyScreen");
				break;
			default:
				return;
		}
	}
}

function waitForDialogPromptConfirm(confirmationAction) {
	if (promptActive) {
		if (!promptResult) {
			setTimeout(() => { waitForDialogPromptConfirm(confirmationAction); }, 100);
		} else {
			switch (confirmationAction) {
				case "clearBoard":
					clearGameBoardAndRefillWithCurrentBoardDataAndLockOccupiedCells();
					break;
				case "startNewGame":
					startNewGame();
					break;
				case "changeDifficulty":
					showScreen("difficultyScreen");
					break;
				default:
					return;
			}
			hidePrompt();
		}
	}
}

///////////////////////////////////////////////////////////////////////////

function adjustContentSizeToFitWindow() {
	let pageContainerWidthAdjustedToZoom = Math.floor(c_PageContainerInitialWidth * zoomLevel);
	let pageContainerHeightAdjustedToZoom = Math.floor(c_PageContainerInitialHeight * zoomLevel);

	if ((window.innerWidth > c_PageContainerInitialWidth * c_MaxZoom) && (window.innerHeight > c_PageContainerInitialHeight * c_MaxZoom)) {
		upscaleOrDownscaleContent(true);
		if (zoomLevel <= c_MaxZoom) { setTimeout(adjustContentSizeToFitWindow, 5); }
	} else if (window.innerWidth < window.innerHeight) {
		let widthDiff = window.innerWidth - pageContainerWidthAdjustedToZoom;

		if (widthDiff - c_PageContainerWidthScaleStep > 0) {
			upscaleOrDownscaleContent(true);
			if (window.innerWidth < c_PageContainerInitialWidth * c_MaxZoom) { setTimeout(adjustContentSizeToFitWindow, 5); }
		} else if (widthDiff + c_PageContainerWidthScaleStep < 0) {
			upscaleOrDownscaleContent(false);
			if (window.innerWidth > c_PageContainerInitialWidth * c_MinZoom) { setTimeout(adjustContentSizeToFitWindow, 5); }
		}
	} else if (window.innerWidth > window.innerHeight) {
		let heightDiff = window.innerHeight - pageContainerHeightAdjustedToZoom;

		if (heightDiff - c_PageContainerHeightScaleStep > 0) {
			upscaleOrDownscaleContent(true);
			if (window.innerHeight < c_PageContainerInitialHeight * c_MaxZoom) { setTimeout(adjustContentSizeToFitWindow, 5); }
		} else if (heightDiff + c_PageContainerHeightScaleStep < 0) {
			upscaleOrDownscaleContent(false);
			if (window.innerHeight > c_PageContainerInitialHeight * c_MinZoom) { setTimeout(adjustContentSizeToFitWindow, 5); }
		}
	}
}

function upscaleOrDownscaleContent(upscale) {
	if (upscale) {
		zoomLevel = (zoomLevel >= c_MaxZoom) ? zoomLevel : zoomLevel + c_ZoomStep;
	} else {
		zoomLevel = (zoomLevel <= c_MinZoom) ? zoomLevel : zoomLevel - c_ZoomStep;
	}
	c_PageContainer.style.zoom = zoomLevel;
	c_PromptWindow.style.zoom = zoomLevel;
}

///////////////////////////////////////////////////////////////////////////

function paintOptionsCells() {
	let currentRow = selectedCellIndex[0];
	let currentCol = selectedCellIndex[1]; 

	repaintCellsAsDefault();
	for (let box of c_BoardContainer.children) {
		if (box == c_BoardCells.get(`${currentRow}-${currentCol}`).parentElement) {
			box.style.backgroundColor = "rgb(0, 173, 179)";			
		} 
	}

	for (let i = 0; i < 9; i++) {
		c_BoardCells.get(`${currentRow}-${i}`).style.border= "3px solid rgb(0, 173, 179)";
		c_BoardCells.get(`${i}-${currentCol}`).style.border = "3px solid rgb(0, 173, 179)";	
	}
}

function repaintCellsAsDefault() {
	for (let box of c_BoardContainer.children) {
		box.style.backgroundColor = "lightgray";			
	}
	
	for (let i = 0; i < 9; i++) {
		for (let j = 0; j < 9; j++) {
			let boardCell = c_BoardCells.get(`${i}-${j}`);
			if (!boardCell.disabled) {
				boardCell.style.border = "2px solid rgb(100, 100, 100)";
			} else {
				boardCell.style.border = "gray";
			}
		}
	}
}