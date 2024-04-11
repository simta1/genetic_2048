const size = 4;
let generation;

// population = populWidth * populHeight
let populWidth = 9;
let populHeight = 6;

// design
const cellMargin = 4; // cellMargin
const cellLength = 45;
const curv = 3; // curvature
const boardLength = cellMargin + (cellLength + cellMargin) * size;
const boardMargin = 10;
const zoomScale = 0.45;

const generationWidth = zoomScale * (boardMargin + (boardLength + boardMargin) * populWidth);
const generationHeight = zoomScale * (boardMargin + (boardLength + boardMargin) * populHeight);

const gui1Height = 40;
const gui2Height = 20;
const bottomAdditionalMargin = 30;
const leftGuiWidth = 200;

function setup() {
    createCanvas(generationWidth + leftGuiWidth, gui1Height + gui2Height + generationHeight + bottomAdditionalMargin);
    
    // make generation
    generation = new Generation(populWidth * populHeight);
}

function draw() {
    background(255);
    generation.run();
    
    push(); translate(0, gui1Height + gui2Height); scale(zoomScale);
        generation.show();
    pop();

    fill(255, 0, 0); textSize(30); textAlign(CENTER, CENTER);
    text(generation.century + "th generation", width / 2, gui1Height / 2);

    push(); translate(0, gui1Height);
        fill(0); textSize(13); textAlign(LEFT, BOTTOM);
        if (generation.averageScore !== null) text("average score of the previous generation : " + generation.averageScore.toFixed(2), boardMargin, gui2Height);
    pop();

    push(); translate(generationWidth, gui1Height + gui2Height);
        noFill(); stroke(0);
        rect(0, 0, leftGuiWidth, generationHeight);

        let leftGuiMargin = (leftGuiWidth - zoomScale * boardLength) / 2;
        push(); translate(leftGuiMargin, leftGuiMargin);
            if (generation.prevBestGame !== null) {
                push(); scale(zoomScale);
                    generation.prevBestGame.show();
                pop();
            }
        pop();
    pop();
}