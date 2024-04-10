const selectionPressure = 3;
const replaceRate = 0.3;
const mutationProbability = 0.2;

class Generation {
    constructor(population) {
        this.century = 1;
        this.averageScore = -1;
        this.population = population;
        this.individuals = [];
        for (let i = 0; i < population; i++) this.individuals.push(new Individual());
    }

    run() {
        for (let individual of this.individuals) individual.run();

        if (this.individuals.every(individual => individual.isGameover())) {
            this.averageScore = this.individuals.reduce((acc, cur) => {return acc + cur.getScore();}, 0) / this.population;
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
        if (selectedIdx.length == 0) selectedIdx.push(this.population - 1); // 실수 오차로 선택 안 됐을 때
        
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
        if (selectedIdx.length == 1) { // 실수 오차로 선택 안 됐을 때
            if (selectedIdx[0] == this.population - 1) selectedIdx.push(this.population - 2);
            else selectedIdx.push(this.population - 1);
        }
        print("scores", scores, "\nfitnesses", fitnesses, "\nselection", selectedIdx);
        
        // rank
        let indexes = [];
        for (let i = 0; i < this.population; i++) indexes.push(i);
        indexes.sort((a, b) => {
            return this.individuals[a].getScore() - this.individuals[b].getScore();
        });

        // make new generation
        let chromosomes = [];
        for (let individual of this.individuals) chromosomes.push(individual.getChromosome());
        let parentChromosome1 = chromosomes[selectedIdx[0]].slice();
        let parentChromosome2 = chromosomes[selectedIdx[1]].slice();

        let replacePopulation = this.population * replaceRate;
        for (let i = 0; i < replacePopulation; i++) {
            let chromosome = chromosomes[indexes[i]];
            
            // crossover
            let idx = Math.floor(Math.random() * chromosome.length);
            for (let i = 0; i < idx; i++) chromosome[i] = parentChromosome1[i];
            for (let i = idx; i < chromosome.length; i++) chromosome[i] = parentChromosome2[i];

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
        fill(255, 0, 0); textSize(30); textAlign(CENTER, CENTER);
        text(this.century + "th generation", width / 2, gui1Height / 2);

        translate(0, gui1Height);

        fill(0); textSize(13); textAlign(LEFT, BOTTOM);
        if (~this.averageScore) text("average score of the previous generation : " + this.averageScore.toFixed(2), boardMargin, gui2Height);

        translate(0, gui2Height);

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
    }
}