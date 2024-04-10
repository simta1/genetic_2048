const numberColors = [
    'rgb(204, 192, 179)', // X
    'rgb(238, 228, 218)', // 2
    'rgb(237, 224, 200)', // 4
    'rgb(242, 177, 121)', // 8
    'rgb(245, 149, 99)', // 16
    'rgb(245, 125, 98)', // 32
    'rgb(247, 93, 59)', // 64
    'rgb(237, 206, 155)', // 128
    'rgb(237, 202, 98)', // 256
    'rgb(238, 199, 82)', // 512
    'rgb(238, 198, 66)', // 1024
    'rgb(239, 105, 106)', // 2048
    'rgb(241, 76, 92)', // 4096
    'rgb(248, 66, 65)', // 8192
    'rgb(255, 59, 66)', // 16384
    'rgb(116, 182, 214)', // 32768
    'rgb(93, 161, 222)', // 65536
    'rgb(12, 103, 174)' // 131072
];

class Position {
    constructor(i, j) {
        this.i = i;
        this.j = j;
    }
}

const Move = {
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right',
    UNDO : 'undo'
};
Object.freeze(Move);

class Game {
    constructor() {
        this.prevBoard = new Array(size).fill(0).map(() => new Array(size).fill(0));
        this.curBoard = new Array(size).fill(0).map(() => new Array(size).fill(0));
        this.nextBoard = new Array(size).fill(0).map(() => new Array(size).fill(0));

        this.prevScore = 0;
        this.curScore = 0;
        this.nextScore = 0;

        this.canUndo = false;

        this.time = 0;
        this.gameover = false;

        // applyMove
        this.inputBuffer = [];
        this.applyMoveTimer = new Timer();
        this.movedPos = new Array(size).fill(0).map(() => new Array(size).fill(new Position(0, 0)));

        // make new number
        this.newNumberTimer = new Timer();
        this.makeNewNumber();
        this.makeNewNumber();
    }

    setMoveAnimationDuration(duration) {
        this.applyMoveTimer.setDuration(duration);
    }

    setNewNumberAnimationDuration(duration) {
        this.newNumberTimer.setDuration(duration);
    }

    makeNewNumber() {
        let i, j;
        do {
            i = Math.floor(Math.random() * size);
            j = Math.floor(Math.random() * size);
        } while (this.curBoard[i][j] > 0);

        this.newi = i;
        this.newj = j;
        this.curBoard[i][j] = (Math.random() < 0.1) ? 4 : 2;

        this.newNumberTimer.start();
    }

    run() {
        if (this.gameover) return;

        // update game play time
        this.time += 1 / frameRate();
        
        // apply move in buffer
        if (this.inputBuffer.length && !this.newNumberTimer.isWorking() && !this.applyMoveTimer.isWorking()) {
            this.applyMove(this.inputBuffer.shift());
        }

        // update curBoard and makeNewNumber after move animation ends
        if (this.applyMoveTimer.work()) {
            this.prevBoard = this.curBoard;
            this.curBoard = this.nextBoard;

            this.prevScore = this.curScore;
            this.curScore = this.nextScore;

            this.canUndo = true;

            this.makeNewNumber();
        }
        
        // check gameover after new number making animation ends
        if (this.newNumberTimer.work()) {
            this.checkGameOver();
        }
    }

    checkGameOver() {
        if (this.checkFull() && !this.checkCanMove()) this.gameover = true;
    }

    checkFull() {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (this.curBoard[i][j] == 0) return false;
            }
        }
        return true;
    }

    checkCanMove() {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (this.checkEqualAdjExist(i, j)) return true;
            }
        }
        return false;
    }

    checkEqualAdjExist(i, j) {
        if (i > 0 && this.curBoard[i][j] == this.curBoard[i - 1][j]) return true;
        if (j > 0 && this.curBoard[i][j] == this.curBoard[i][j - 1]) return true;
        if (i + 1 < size && this.curBoard[i][j] == this.curBoard[i + 1][j]) return true;
        if (j + 1 < size && this.curBoard[i][j] == this.curBoard[i][j + 1]) return true;
        return false;
    }

    applyMove(move) {
        if (this.gameover) return;

        if (this.newNumberTimer.isWorking() || this.applyMoveTimer.isWorking()) { // previous move was not applied yet
            this.inputBuffer.push(move);
            return;
        }

        this.nextBoard = this.curBoard.slice();
        this.nextScore = this.curScore;
        let tmp;

        switch (move) {
        case Move.UP:
            this.rotateArray(3);
            tmp = this.pushArray();
            this.rotateArray(1);

            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    let {i : mi, j : mj} = tmp[size - 1 - j][i];
                    this.movedPos[i][j] = new Position(mj, size - 1 - mi);
                }
            }
            break;

        case Move.LEFT:
            this.movedPos = this.pushArray();
            break;

        case Move.DOWN:
            this.rotateArray(1);
            tmp = this.pushArray();
            this.rotateArray(3);

            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    let {i : mi, j : mj} = tmp[j][size - 1 - i];
                    this.movedPos[i][j] = new Position(size - 1 - mj, mi);
                }
            }
            break;

        case Move.RIGHT:
            this.rotateArray(2);
            tmp = this.pushArray();
            this.rotateArray(2);

            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    let {i : mi, j : mj} = tmp[size - 1 - i][size - 1 - j];
                    this.movedPos[i][j] = new Position(size - 1 - mi, size - 1 - mj);
                }
            }
            break;
        
        case Move.UNDO:
            this.curBoard = this.prevBoard;
            this.curScore = this.prevScore;
            this.canUndo = false;
            break;

        default:
            print("Unknown move");
            return;
        }

        // move animation start
        if (move != Move.UNDO && !this.checkArraysEqual(this.curBoard, this.nextBoard)) this.applyMoveTimer.start();
    }

    checkArraysEqual(a, b) {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (a[i][j] != b[i][j]) return false;
            }
        }
        return true;
    }

    rotateArray(iter) { // rotate array 90 degrees clockwise
        while (iter--) {
            let rotated = new Array(size).fill(0).map(() => new Array(size).fill(0));

            for (let i = 0; i < size; i++) { 
                for (let j = 0; j < size; j++) {
                    rotated[i][j] = this.nextBoard[size - 1 - j][i];
                }
            }

            this.nextBoard = rotated;
        }
    }

    pushArray() { // push array to the left
        let pushed = new Array(size).fill(0).map(() => new Array(size).fill(0));
        let movedPos = new Array(size).fill(0).map(() => new Array(size).fill(new Position(0, 0)));

        for (let i = 0; i < size; i++) {
            let stack = [];
            for (let j = 0; j < size; j++) {
                let num = this.nextBoard[i][j];
                if (!num) continue;

                if (stack.length && stack[stack.length - 1].num == num && stack[stack.length - 1].canMerge) {
                    stack[stack.length - 1].num <<= 1;
                    stack[stack.length - 1].canMerge = false;
                    this.nextScore += stack[stack.length - 1].num;
                }
                else stack.push(new Data(num));
                
                movedPos[i][j] = new Position(i, stack.length - 1);
            }

            let idx = 0;
            for (let {num} of stack) pushed[i][idx++] = num;
        }

        this.nextBoard = pushed;
        return movedPos;
    }

    show() {
        noStroke();

        // draw background of game board
        fill('rgb(187, 173, 160)');
        rect(0, 0, boardLength, boardLength, curv, curv, curv, curv);

        // draw background of each room
        fill('rgb(204, 192, 179)');
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                let x = margin + (cellLength + margin) * j;
                let y = margin + (cellLength + margin) * i;
                rect(x, y, cellLength, cellLength, curv, curv, curv, curv);
            }
        }

        // draw each number
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (this.curBoard[i][j] == 0) continue;

                let x = margin + (cellLength + margin) * j;
                let y = margin + (cellLength + margin) * i;

                if (this.applyMoveTimer.isWorking()) {
                    let {i : mi, j : mj} = this.movedPos[i][j];
                    let rate = this.applyMoveTimer.elapsedRate();
                    x = margin + (cellLength + margin) * map(rate, 0, 1, j, mj);
                    y = margin + (cellLength + margin) * map(rate, 0, 1, i, mi);
                }
                
                // draw background of each number
                let c = Math.floor(Math.log2(this.curBoard[i][j]));
                c = constrain(c, 0, numberColors.length - 1);
                fill(numberColors[c]);

                if (this.newNumberTimer.isWorking() && i == this.newi && j == this.newj) {
                    rectMode(CENTER);
                    let newNumberLength = cellLength * this.newNumberTimer.elapsedRate();
                    rect(x + cellLength / 2, y + cellLength / 2, newNumberLength, newNumberLength, 3, 3, 3, 3);
                    rectMode(CORNER);
                }
                else rect(x, y, cellLength, cellLength, curv, curv, curv, curv);

                // draw number (text)
                if (this.curBoard[i][j] < 5) fill('rgb(119,110,101)');
                else fill('rgb(249,246,242)');
                
                if (this.newNumberTimer.isWorking() && i == this.newi && j == this.newj) textSize(40 * this.newNumberTimer.elapsedRate());
                else if (this.curBoard[i][j] <= 8) textSize(35);
                else if (this.curBoard[i][j] <= 64) textSize(30);
                else if (this.curBoard[i][j] <= 512) textSize(20);
                else if (this.curBoard[i][j] <= 8192) textSize(16);
                else if (this.curBoard[i][j] <= 65536) textSize(12);
                else textSize(11);
                
                textAlign(CENTER, CENTER);
                text(this.curBoard[i][j], x + cellLength / 2, y + cellLength / 2 + 1);
            }
        }
        
        // print score and time
        fill(0); textSize(10); textAlign(LEFT, CENTER);
        text("SCORE : " + this.curScore + ", TIME : " + this.time.toFixed(2) + "s", 0, boardLength + 6);

        // check and draw game over screen
        if (this.gameover) {
            // background of game over screen
            fill(255, 200);
            rect(0, 0, boardLength, boardLength, curv, curv, curv, curv);
            
            // print game over message
            fill(0, 100); textSize(30); textAlign(CENTER, CENTER);
            text("gameover", boardLength / 2, boardLength / 2);
        }
    }
}

class Data {
    constructor(num) {
        this.num = num;
        this.canMerge = true;
    }
}