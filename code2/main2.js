const size = 4;
let generation;

// population = populWidth * populHeight
let populWidth = 8;
let populHeight = 5;

// design
const margin = 4;
const cellLength = 45;
const curv = 3; // curvature
const boardLength = margin + (cellLength + margin) * size;
const boardMargin = 10;
const zoomScale = 0.5;

const gui1Height = 40;
const gui2Height = 20;
const bottomAdditionalMargin = 20;

function setup() {
    let generationWidth = boardMargin + (boardLength + boardMargin) * populWidth;
    let generationHeight = boardMargin + (boardLength + boardMargin) * populHeight;

    createCanvas(generationWidth * zoomScale, gui1Height + gui2Height + generationHeight * zoomScale + bottomAdditionalMargin);
    
    // make generation
    generation = new Generation(populWidth * populHeight);
}

function draw() {
    background(255);
    generation.run();
    generation.show();
}