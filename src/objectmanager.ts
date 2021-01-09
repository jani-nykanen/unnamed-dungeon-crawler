/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


class ObjectManager {


    private player : Player;


    constructor() {

        this.player = new Player(80, 72);
    }


    public update(ev : GameEvent) {

        this.player.update(ev);
    }


    public draw(c : Canvas) {

        this.player.draw(c);
    }
}
