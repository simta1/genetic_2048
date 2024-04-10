class Individual {
    constructor() {
        this.chromosome = [];
        for (let i = 0; i < size * size; i++) this.chromosome.push(1 - 2 * Math.random()); // random -1 ~ 1

        this.game = new Game();
        this.agent = new Agent(this.chromosome);
    }

    run() {
        this.agent.run(this.game);
        this.game.run();
    }

    isGameover() {
        return this.game.gameover;
    }

    getScore() {
        return this.game.curScore;
    }

    getChromosome() {
        return this.chromosome.slice();
    }

    init(chromosome) {
        this.chromosome = chromosome;
        this.game = new Game();
        this.agent = new Agent(this.chromosome, agentPedictDepth, agentRepeatLimit);
    }

    show() {
        this.game.show();
    }
}