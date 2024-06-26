class Agent {
    constructor(weights, predictDepth=3, repeatLimit=3, undoThreshold=1.25) {
        this.weights = weights;
        this.predictDepth = predictDepth;
        this.repeatLimit = repeatLimit; // number of checking makeNewNumber
        this.undoThreshold = undoThreshold; // if less then 1, bot repeat undo forever

        // block to repeat undo forever
        this.prevPrevMove = null;
        this.prevMove = null;
        this.repeatedUndoCnt = 0;
        this.blockRepeatUndo = false;
    }

    setPredictDepth(predictDepth) {
        this.predictDepth = predictDepth;
    }

    setUndoThreshold(undoThreshold) {
        this.undoThreshold = undoThreshold;
    }

    run(game) {
        if (game.gameover || game.applyMoveTimer.isWorking() || game.newNumberTimer.isWorking()) return;
        
        let board = game.curBoard.reduce((acc, cur) => acc.concat(cur), []); // flatten 2D array
        let [bestScore, bestMove] = this.findBestMove(board, this.predictDepth);
        
        if (game.canUndo && !this.blockRepeatUndo) {
            let prevBoard = game.prevBoard.reduce((acc, cur) => acc.concat(cur), []); // flatten 2D array
            let [undoBestScore, _] = this.findBestMove(prevBoard, this.predictDepth - 1);
            if (undoBestScore / bestScore > this.undoThreshold) bestMove = Move.UNDO;
        }

        if (bestMove === -1) {
            let possibleMoves = [Move.UP, Move.LEFT, Move.DOWN, Move.RIGHT];
            bestMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        }
        game.applyMove(bestMove);

        // block to repeat undo forever
        if (bestMove == Move.UNDO && this.prevPrevMove == Move.UNDO) {
            if (++this.repeatedUndoCnt >= 100) this.blockRepeatUndo = true;
        }
        if (bestMove != Move.UNDO && this.prevMove != Move.UNDO) {
            this.repeatedUndoCnt = 0;
            this.blockRepeatUndo = false;
        }
        
        this.prevPrevMove = this.prevMove;
        this.prevMove = bestMove;
    }

    findBestMove(board, depth) {
        if (depth == 0) return [this.evaluate(board), -1];

        let bestScore = -Infinity;
        let bestMove = -1;
        
        let possibleMoves = [Move.UP, Move.LEFT, Move.DOWN, Move.RIGHT];
        for (let move of possibleMoves) {
            let pushed = this.applyMove(board, move);
            if (this.checkArraysEqual(pushed, board)) continue;

            let worstPossibleScore = Infinity;

            for (let i = 0; i < this.repeatLimit; i++) {
                let nextBoard = this.makeNewNumber(pushed);
                let [curScore, _] = this.findBestMove(nextBoard, depth - 1);
                worstPossibleScore = min(worstPossibleScore, curScore);
            }

            if (bestScore < worstPossibleScore) {
                bestScore = worstPossibleScore;
                bestMove = move;
            }
        }
        
        return [bestScore, bestMove];
    }
    
    checkArraysEqual(a, b) {
        for (let i = 0; i < size * size; i++) {
            if (a[i] != b[i]) return false;
        }
        return true;
    }

    evaluate(board) {
        let score = 0;
        for (let i = 0; i < size * size; i++) score += this.weights[i] * board[i];
        return score;
    }

    applyMove(board, move) {
        switch (move) {
        case Move.UP:
            return this.pushArray(board, 0, 1, size);
        case Move.LEFT:
            return this.pushArray(board, 0, size, 1);
        case Move.DOWN:
            return this.pushArray(board, size * (size - 1), 1, -size);
        case Move.RIGHT:
            return this.pushArray(board, size - 1, size, -1);
        }
    }

    pushArray(board, a, b, c) {
        let pushed = new Array(size * size).fill(0);
        
        for (let i = 0; i < size; i++) {
            let stack = [];
            for (let j = 0; j < size; j++) {
                let num = board[a + b * i + c * j];
                if (!num) continue;

                if (stack.length && stack[stack.length - 1].num == num && stack[stack.length - 1].canMerge) {
                    stack[stack.length - 1].num <<= 1;
                    stack[stack.length - 1].canMerge = false;
                }
                else stack.push(new Data(num));
            }

            let idx = 0;
            for (let {num} of stack) {
                pushed[a + b * i + c * idx] = num;
                ++idx;
            }
        }
        
        return pushed;
    }

    makeNewNumber(board) {
        let newBoard = board.slice();
        let rand;
        do {
            rand = Math.floor(Math.random() * board.length);
        } while (board[rand]);

        newBoard[rand] = (Math.random() < 0.1) ? 4 : 2;
        return newBoard;
    }
}