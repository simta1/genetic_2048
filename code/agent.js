let predictDepth = 4;

class Agent {
    constructor() {
        // this.weight = new Array(size * size).fill(0);
        this.weight = [1, 3, 7, 15, 255, 127, 63, 31, 511, 1023, 2047, 4095, 65535, 32767, 16383, 8191]; 
        this.iter = 6; // makeNewNumber 횟수
    }

    run(game) {
        let board = game.curBoard.reduce((acc, cur) => acc.concat(cur), []); // flatten 2D array
        let bestMove = this.findBestMove(board);
        game.applyMove(bestMove);
    }

    findBestMove(board, depth=0) {
        if (depth == predictDepth) return this.evaluate(board);

        let bestScore = -Infinity;
        let bestMove;
        
        let possibleMoves = [Move.UP, Move.LEFT, Move.DOWN, Move.RIGHT];
        for (let move of possibleMoves) {
            let pushed = this.applyMove(board, move);
            if (this.checkArraysEqual(pushed, board)) continue;

            let worstPossibleScore = Infinity;

            for (let i = 0; i < this.iter; i++) {
                let nextBoard = this.makeNewNumber(pushed);
                let curScore = this.findBestMove(nextBoard, depth + 1);
                worstPossibleScore = min(worstPossibleScore, curScore);
            }

            if (bestScore < worstPossibleScore) {
                bestScore = worstPossibleScore;
                if (depth == 0) bestMove = move;
            }
        }
        
        if (depth) return bestScore;
        return bestMove;
    }
    
    checkArraysEqual(a, b) {
        for (let i = 0; i < size * size; i++) {
            if (a[i] != b[i]) return false;
        }
        return true;
    }

    evaluate(board) {
        let score = 0;
        for (let i = 0; i < size * size; i++) score += this.weight[i] * board[i];
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