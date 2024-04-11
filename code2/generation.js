const selectionPressure = 3;
const replaceRate = 0.3;
const mutationProbability = 0.2;

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
            this.scoreHistory.push(this.averageScore);
            scoreGraph.addPoint(this.century, this.averageScore);
            this.evolve();
        }
    }

    evolve() {
        // get scores from individuals
        let scores = [];
        for (let individual of this.individuals) scores.push(individual.getScore());
        
        // calculate fitness
        let worstScore = Infinity;
        let bestScore = -Infinity;
        for (let individual of this.individuals) {
            worstScore = min(worstScore, individual.getScore());
            bestScore = max(bestScore, individual.getScore());
        }

        let fitnesses = [];
        for (let individual of this.individuals) {
            let fitness = (individual.getScore() - worstScore) + (bestScore - worstScore) / (selectionPressure - 1);
            fitnesses.push(fitness);
        }

        // roulette wheel selection
        let selectedIdx = [];

        // roulette wheel selection : first selection
        let totalFitness = fitnesses.reduce((acc, cur) => { return acc + cur }, 0);
        let spin = Math.random() * totalFitness;
        let currentSum = 0;
        for (let i = 0; i < this.population; i++) {
            currentSum += fitnesses[i];
            if (spin < currentSum) {
                selectedIdx.push(i);
                break;
            }
        }
        if (selectedIdx.length == 0) selectedIdx.push(this.population - 1); // when nothing selected by rounding error
        
        // roulette wheel selection : second selection
        totalFitness -= fitnesses[selectedIdx[0]];
        spin = Math.random() * totalFitness;
        currentSum = 0;
        for (let i = 0; i < this.population; i++) if (i != selectedIdx[0]) {
            currentSum += fitnesses[i];
            if (spin < currentSum) {
                selectedIdx.push(i);
                break;
            }
        }
        if (selectedIdx.length == 1) { // when nothing selected by rounding error
            if (selectedIdx[0] == this.population - 1) selectedIdx.push(this.population - 2);
            else selectedIdx.push(this.population - 1);
        }
        
        // rank
        let indexes = [];
        for (let i = 0; i < this.population; i++) indexes.push(i);
        indexes.sort((a, b) => {
            return this.individuals[a].getScore() - this.individuals[b].getScore();
        });
        this.prevBestGame = this.individuals[indexes[this.population - 1]].game;

        // make new generation
        let chromosomes = [];
        for (let individual of this.individuals) chromosomes.push(individual.getChromosome());
        let parentChromosome1 = chromosomes[selectedIdx[0]].slice();
        let parentChromosome2 = chromosomes[selectedIdx[1]].slice();

        let replacePopulation = this.population * replaceRate;
        for (let i = 0; i < replacePopulation; i++) {
            let chromosome = chromosomes[indexes[i]];
            
            // crossover
            for (let i = 0; i < chromosome.length; i++) chromosome[i] = Math.random() < 0.5 ? parentChromosome1[i] : parentChromosome2[i];

            // mutation
            if (Math.random() < mutationProbability) {
                for (let i = 0; i < chromosome.length; i++) {
                    chromosome[i] += 0.1 - 0.2 * Math.random() // random -0.1 ~ 0.1
                    chromosome[i] = constrain(chromosome[i], -1, 1);
                }
            }
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

        let replacePopulation = this.population * replaceRate;
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