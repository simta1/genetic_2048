class Individual {
    constructor() {
        this.chromosome = [];
        for (let i = 0; i < size * size; i++) this.chromosome.push(Math.random());

        this.game = new Game();
        this.agent = new Agent(this.chromosome, agentPedictDepth, agentRepeatLimit);
    }

    run() {
        this.agent.run(this.game);
        this.game.run();
    }
    
    show() {
        this.game.show();
    }
}