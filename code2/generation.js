class Generation {
    constructor(population) {
        this.population = population;
        this.individuals = [];
        for (let i = 0; i < population; i++) this.individuals.push(new Individual());
    }

    run() {
        for (let individual of this.individuals) individual.run();
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
    }
}