/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


const getEnemyList = () : Array<Function> => [
    Slime
];


class Slime extends Enemy {


    constructor(x : number, y : number) {

        super(x, y, 1);
    }


    protected updateAI(ev : GameEvent) {
        
        this.spr.animate(this.spr.getRow(), 0, 3, 10, ev.step);
    }
}
