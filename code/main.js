let size;
let game;
let agent;
let agentActivated;

// design
const margin = 4;
const length = 45;
const curv = 3; // curvature
let totalLength;

function setup() {
    // get size from URL
    const urlParams = new URLSearchParams(window.location.search);
    const sizeParam = urlParams.get('size');
    if (sizeParam) size = parseInt(sizeParam);
    else size = 4; // default

    // calculate total length of game screen
    totalLength = margin + (length + margin) * size;
    createCanvas(totalLength, totalLength + 10);

    // make game and agent
    game = new Game();
    agent = new Agent(3, 20);
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

    // checkbox
    let chkbox = document.getElementById('toggleBotCheckbox');
    chkbox.addEventListener('change', function() {
        agentActivated = !agentActivated;
    });
}

function draw() {
    background(220);
    game.run();
    game.show();
    if (agentActivated) agent.run(game);
}

function keyPressed() {
    if (agentActivated) return;

    if (keyCode == UP_ARROW) game.applyMove(Move.UP);
    else if (keyCode == DOWN_ARROW) game.applyMove(Move.DOWN);
    else if (keyCode == LEFT_ARROW) game.applyMove(Move.LEFT);
    else if (keyCode == RIGHT_ARROW) game.applyMove(Move.RIGHT);
    else if (keyCode == BACKSPACE) game.applyMove(Move.UNDO);
}

const Move = {
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right',
    UNDO : 'undo'
};
Object.freeze(Move);