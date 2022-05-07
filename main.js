window.onload = () => {
	createInterfaceElements();
	adjustContentSizeToFitWindow();

	window.addEventListener("resize", adjustContentSizeToFitWindow);
	window.addEventListener("orientationchange", adjustContentSizeToFitWindow);

	document.body.addEventListener("click", deselectBoardCellIfClickOnBody);

	document.getElementById("button-login-submit").addEventListener("click", checkUserLogin);
	document.getElementById("link-register").addEventListener("click", () => { showScreen("registerScreen") });

	document.getElementById("button-register-submit").addEventListener("click", registerNewUser);
	document.getElementById("link-login").addEventListener("click", () => { showScreen("loginScreen") });

	for (let difficultyButton of document.getElementsByClassName("difficulty-button")) {
		difficultyButton.addEventListener("click", () => { showBoardScreenAndStartNewGameWithSelectedDifficulty(difficultyButton.value); }); 
	}
	document.getElementById("button-logout").addEventListener("click", () => { showScreen("loginScreen"); });

	for (let boardCell of c_BoardCells.values()) {
		boardCell.addEventListener("mousedown", () => { selectBoardCell(boardCell); });
		boardCell.addEventListener("keydown", (keyboardEvent) => { applyNumberValueToSelectedBoardCellViaKeyboard(keyboardEvent); });
	}

	document.getElementById("button-check").addEventListener("click", checkBoard);
	document.getElementById("button-clear-board").addEventListener("click", () => { confirmActionIfBoardWasModified("clearBoard"); });
	document.getElementById("button-new-game").addEventListener("click", () => { confirmActionIfBoardWasModified("startNewGame"); });
	document.getElementById("button-change-difficulty").addEventListener("click", () => { confirmActionIfBoardWasModified("changeDifficulty"); });

	for (let numButton of document.getElementsByClassName("number-input-button")) {
		numButton.addEventListener("click", () => { applyNumberValueToSelectedBoardCell(numButton.value); });
	}
	document.getElementById("button-input-clear").addEventListener("click", clearSelectedBoardCell);
	document.getElementById("button-input-close").addEventListener("click", deselectBoardCell);
	
	document.getElementById("button-prompt-confirm").addEventListener("click", hidePrompt);

	document.getElementById("button-prompt-dialog-yes").addEventListener("click", () => { promptResult = true; });
	document.getElementById("button-prompt-dialog-no").addEventListener("click", hidePrompt);

	document.getElementById("button-prompt-change-difficulty").addEventListener("click", () => { hidePrompt(); showScreen("difficultyScreen"); });
	document.getElementById("button-prompt-new-game").addEventListener("click", () => { hidePrompt(); repaintCellsAsDefault(); startNewGame(difficultySetting); });

	showScreen("loginScreen");

	// debug
	//showPrompt();	
	//showScreen("registerScreen");
	//showScreen("difficultyScreen");

	/*
	showScreen("boardScreen");
	difficultySetting = "debug";
	startNewGame();
	*/
}