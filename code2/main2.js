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
const leftGuiMargin = 2;
const leftGuiTextHeight = 20;

function setup() {
    createCanvas(generationWidth + leftGuiWidth, gui1Height + gui2Height + generationHeight + bottomAdditionalMargin);
    
    // make generation
    generation = new Generation(populWidth * populHeight);
}

function draw() {
    background(255);
    generation.run();
    
    // show games of generation
    push(); translate(0, gui1Height + gui2Height); scale(zoomScale);
        generation.show();
    pop();

    // show gui1 : "x th generation"
    fill(255, 0, 0); textSize(30); textAlign(CENTER, CENTER);
    text(generation.century + "th generation", width / 2, gui1Height / 2);

    // show gui2 : "average score of the previous generation : x"
    push(); translate(0, gui1Height);
        fill(0); textSize(13); textAlign(LEFT, BOTTOM);
        if (generation.averageScore !== null) text("average score of the previous generation : " + generation.averageScore.toFixed(2), boardMargin, gui2Height);
    pop();

    // show left gui
    push(); translate(generationWidth, gui1Height + gui2Height);
        // draw room for gui
        noFill(); stroke(0);
        rect(0, 0, leftGuiWidth, generationHeight);

        // draw best game of previous generation
        fill(0); strokeWeight(0.1); textSize(10); textAlign(CENTER, CENTER);
        text("best game of previous generation", leftGuiWidth / 2, leftGuiTextHeight / 2);

        let curScale = (leftGuiWidth - 2 * leftGuiMargin) / boardLength;
        push(); translate(leftGuiMargin, leftGuiTextHeight + leftGuiMargin); scale(curScale);
            generation.prevBestGame.show();
            if (generation.century == 1) {
                fill(0, 100); strokeWeight(0.1); textSize(30); textAlign(CENTER, CENTER);
                text("no previous\ngeneration", boardLength / 2, boardLength / 2);
            }
        pop();
    pop();
}