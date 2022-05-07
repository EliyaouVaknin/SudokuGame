function logGameBoard(arr) {
    for (let i of arr) {
        console.log(i.toString());
    }
}

function cloneGameBoard(gameBoard) {
    let newGameBoard = new Array(9).fill([]);
    for (let i in gameBoard) {
        newGameBoard[i] = Array.from(gameBoard[i]);
    }
    return newGameBoard;
}

function makeGameBoardMatrixFromArray(array) {
    let matrix = [];
    for (let i = 0, j = -1; i < array.length; i++) {
        if (i % 9 == 0) {
            j++;
            matrix[j] = [];
        }
        matrix[j].push(array[i]);
    }
    return matrix;
}