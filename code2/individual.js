class Individual {
    constructor() {
        this.chromosome = [];
        for (let i = 0; i < size * size; i++) this.chromosome.push(Math.random());

        this.game = new Game();
        print(this.game.curBoard);
        this.agent = new Agent(this.chromosome, agentPedictDepth, agentRepeatLimit);
    }

    run() {
        this.game.run();
        this.agent.run(this.game);
    }
    
    show() {
        this.game.show();
    }
}