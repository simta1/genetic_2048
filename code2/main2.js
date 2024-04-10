const size = 4;
let generation;

// population = populWidth * populHeight
let populWidth = 5;
let populHeight = 3;

// agent
const agentPedictDepth = 2;
const agentRepeatLimit = 8;

// design
const margin = 4;
const cellLength = 45;
const curv = 3; // curvature
const boardLength = margin + (cellLength + margin) * size;
const boardMargin = 10;

const gui1Height = 40;
const gui2Height = 20;

function setup() {
    let totalWidth = boardMargin + (boardLength + boardMargin) * populWidth;
    let totalHeight = boardMargin + (boardLength + boardMargin) * populHeight;

    createCanvas(totalWidth, gui1Height + gui2Height + totalHeight);
    
    // make generation
    generation = new Generation(populWidth * populHeight);
}

function draw() {
    background(255);
    generation.run();
    generation.show();
}