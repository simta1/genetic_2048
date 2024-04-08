let game;

function setup() {
    createCanvas(400, 400);
    game = new Game();
}

function draw() {
    background(220);
    game.run();
    game.show();
}

function keyPressed() {
    if (keyCode == UP_ARROW) game.applyMove(Move.UP);
    else if (keyCode == DOWN_ARROW) game.applyMove(Move.DOWN);
    else if (keyCode == LEFT_ARROW) game.applyMove(Move.LEFT);
    else if (keyCode == RIGHT_ARROW) game.applyMove(Move.RIGHT);
}

const Move = {
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right'
};
Object.freeze(Move);