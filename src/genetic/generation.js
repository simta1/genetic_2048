const selectionPressure = 3;
const replaceRate = 0.3;
const mutationProbability = 0.2;

const eliteRate = 0.05;
const geneMutationRate = 0.10;
const mutationStep = 0.10;
const clampMin = -1.0, clampMax = 1.0;

class Generation {
    constructor(population) {
        this.century = 1;
        this.scoreHistory = [];
        this.averageScore = null;

        this.prevBestGame = new Game();
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                this.prevBestGame.curBoard[i][j] = 0;
            }
        }

        this.population = population;
        this.individuals = [];
        for (let i = 0; i < population; i++) this.individuals.push(new Individual());
    }

    run() {
        for (let individual of this.individuals) individual.run();

        if (this.individuals.every(individual => individual.isGameover())) {
            this.averageScore = this.individuals.reduce((acc, cur) => {return acc + cur.getScore();}, 0) / this.population;
            let curBestScore = this.individuals.reduce((acc, cur) => {return max(acc, cur.getScore());}, -Infinity);
            this.scoreHistory.push([this.averageScore, curBestScore]);
            averageScoreGraph.addPoint(this.century, this.averageScore);
            bestScoreGraph.addPoint(this.century, curBestScore);
            
            this.evolve();
        }
    }

    evolve() {
        const scores = this.individuals.map(ind => ind.getScore());

        let worstScore = Infinity, bestScore = -Infinity;
        for (let s of scores) {
            if (s < worstScore) worstScore = s;
            if (s > bestScore) bestScore = s;
        }

        let fitnesses = [];
        if (bestScore === worstScore) {
            fitnesses = new Array(this.population).fill(1);
        }
        else {
            const base = (bestScore - worstScore) / (selectionPressure - 1);
            for (let i = 0; i < this.population; i++) fitnesses.push((scores[i] - worstScore) + base);
        }

        const indexes = Array.from({ length: this.population }, (_, i) => i)
            .sort((a, b) => this.individuals[a].getScore() - this.individuals[b].getScore());

        this.prevBestGame = this.individuals[indexes[this.population - 1]].game;

        const eliteCount = Math.max(1, Math.floor(this.population * eliteRate));
        const elites = indexes.slice(this.population - eliteCount); // 상위 인덱스들

        const chromosomes = this.individuals.map(ind => ind.getChromosome());

        const pickByRoulette = () => {
            const total = fitnesses.reduce((a, b) => a + b, 0);
            let r = Math.random() * total;
            for (let i = 0; i < fitnesses.length; i++) {
                r -= fitnesses[i];
                if (r <= 0) return i;
            }
            return this.population - 1; // fallback
        };

        const replaceCount = Math.floor(this.population * replaceRate);
        const victims = indexes.slice(0, replaceCount);

        for (let victim of victims) {
            const p1 = pickByRoulette();
            let p2 = pickByRoulette();
            if (p1 === p2) p2 = (p2 + 1) % this.population;

            const a = chromosomes[p1];
            const b = chromosomes[p2];
            const child = new Array(a.length);

            for (let g = 0; g < child.length; g++) {
                let gene = Math.random() < 0.5 ? a[g] : b[g];
                if (Math.random() < geneMutationRate) {
                    gene += (Math.random() * 2 - 1) * mutationStep;
                }
                if (gene < clampMin) gene = clampMin;
                if (gene > clampMax) gene = clampMax;
                child[g] = gene;
            }

            chromosomes[victim] = child;
        }

        for (let i = 0; i < eliteCount; i++) {
            const idx = elites[i];
            chromosomes[idx] = chromosomes[idx].slice();
        }

        for (let i = 0; i < this.population; i++) {
            this.individuals[i].init(chromosomes[i]);
        }
        ++this.century;
    }
    
    show() {
        let idx = 0;
        for (let i = 0; i < populHeight; i++) {
            for (let j = 0; j < populWidth; j++) {
                let x = boardMargin + (boardLength + boardMargin) * j;
                let y = boardMargin + (boardLength + boardMargin) * i;

                push(); translate(x, y);
                    this.individuals[idx++].show();
                pop();
            }
        }

        let indexes = [];
        for (let i = 0; i < this.population; i++) indexes.push(i);
        indexes.sort((a, b) => {
            return this.individuals[a].getScore() - this.individuals[b].getScore();
        });

        const replacePopulation = Math.floor(this.population * replaceRate);
        for (let i = 0; i < replacePopulation; i++) {
            idx = indexes[i];
            let x = boardMargin + (boardLength + boardMargin) * (idx % populWidth);
            let y = boardMargin + (boardLength + boardMargin) * Math.floor(idx / populWidth);

            push(); translate(x, y);
                stroke('rgb(255, 0, 0)'); strokeWeight(4); fill(255, 0, 0, 50);
                rect(0, 0, boardLength, boardLength, curv, curv, curv, curv);

                fill(0); noStroke(); textSize(30); textAlign(CENTER, CENTER);
                text((i + 1) + "th BAD", boardLength / 2, boardLength - cellMargin - cellLength / 2);
            pop();
        }

        idx = indexes[this.population - 1];
        let x = boardMargin + (boardLength + boardMargin) * (idx % populWidth);
        let y = boardMargin + (boardLength + boardMargin) * Math.floor(idx / populWidth);

        push(); translate(x, y);
            stroke('rgb(0, 255, 0)'); strokeWeight(5); fill(0, 255, 255, 100); // rgb(0, 255, 255)
            rect(0, 0, boardLength, boardLength, curv, curv, curv, curv);
            
            fill(0); noStroke(); textSize(30); textAlign(CENTER, CENTER);
            text("BEST", boardLength / 2, boardLength - cellMargin - cellLength / 2);
        pop();
    }
}