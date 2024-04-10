let size;
let game;
let agent;
let agentActivated;

// design
const margin = 4;
const cellLength = 45;
const curv = 3; // curvature
let boardLength;

function setup() {
    // get size from URL
    const urlParams = new URLSearchParams(window.location.search);
    const sizeParam = urlParams.get('size');
    if (sizeParam) size = parseInt(sizeParam);
    else size = 4; // default

    // calculate total length of game screen
    boardLength = margin + (cellLength + margin) * size;
    createCanvas(boardLength, boardLength + 10);
    
    // make weights for agent (greddy, no genetic)
    let weights = new Array(size * size).fill(0);
    let weight = 1;
    for (let i = 0; i < size; i++) {
        if (i & 1) {
            for (let j = size - 1; j >= 0; j--) {
                let idx = size * i + j;
                weights[idx] = weight;
                weight = (weight << 1) + 1;
            }
        }
        else {
            for (let j = 0; j < size; j++) {
                let idx = size * i + j;
                weights[idx] = weight;
                weight = (weight << 1) + 1;
            }
        }
    }
    print("greddy weight", weights);

    // game
    game = new Game();

    // agent
    agent = new Agent(weights);
    agentActivated = false;

    // scrollbar
    let moveScb = document.getElementById('moveAnimationScrollbar');
    moveScb.addEventListener('input', function() {
        game.setMoveAnimationDuration(this.value);
        document.getElementById('moveAnimationDuration').innerText = this.value;
    });
    moveScb.dispatchEvent(new Event('input'));

    // scrollbar
    let newScb = document.getElementById('newNumberAnimationScrollbar');
    newScb.addEventListener('input', function() {
        game.setNewNumberAnimationDuration(this.value);
        document.getElementById('newNumberAnimationDuration').innerText = this.value;
    });
    newScb.dispatchEvent(new Event('input'));

    // scrollbar
    let depthScb = document.getElementById('agentPredictDepthScrollbar');
    depthScb.addEventListener('input', function() {
        agent.setPredictDepth(this.value);
        document.getElementById('agentPredictDepth').innerText = this.value;
    });
    depthScb.dispatchEvent(new Event('input'));

    // scrollbar
    let undoScb = document.getElementById('agentUndoThresholdScrollbar');
    undoScb.addEventListener('input', function() {
        agent.setUndoThreshold(this.value / 100);
        document.getElementById('agentUndoThreshold').innerText = this.value / 100;
    });
    undoScb.dispatchEvent(new Event('input'));

    // checkbox
    let chkbox = document.getElementById('toggleBotCheckbox');
    chkbox.addEventListener('change', function() {
        agentActivated = !agentActivated;
    });
}

function draw() {
    background(255);
    if (agentActivated) agent.run(game);
    game.run();
    
    game.show();
    if (game.gameover) {
        fill(0, 200); textSize(15); textAlign(CENTER, CENTER);
        text('pree space to restart', width / 2 , height * 0.63);
    }
}

function keyPressed() {
    if (!agentActivated) {
        if (keyCode == UP_ARROW) game.applyMove(Move.UP);
        else if (keyCode == DOWN_ARROW) game.applyMove(Move.DOWN);
        else if (keyCode == LEFT_ARROW) game.applyMove(Move.LEFT);
        else if (keyCode == RIGHT_ARROW) game.applyMove(Move.RIGHT);
        else if (keyCode == BACKSPACE) game.applyMove(Move.UNDO);
    }
    
    if (key == ' ' && game.gameover) game = new Game();
}