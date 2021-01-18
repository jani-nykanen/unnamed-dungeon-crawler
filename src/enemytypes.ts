/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


const getEnemyList = () : Array<Function> => [
    Slime
];


class Slime extends Enemy {

    
    private dir : Vector2;


    constructor(x : number, y : number) {

        super(x, y, 1);

        this.shadowType = 1;
        this.spr.setFrame((Math.random() * 4) | 0, this.spr.getRow());

        this.friction = new Vector2(0.0125, 0.0125);
        this.dir = new Vector2(0, 1);

        this.radius = 4;

        this.hitbox = new Vector2(6, 4);
        this.collisionBox = this.hitbox.clone();
        this.damageBox = new Vector2(10, 10);
    }


    protected updateAI(ev : GameEvent) {
        
        const ANIM_SPEED = 12;
        const RUSH_SPEED = 0.5;

        let oldFrame = this.spr.getColumn();
        this.spr.animate(this.spr.getRow(), 0, 3, ANIM_SPEED, ev.step);

        if (oldFrame == 0 && this.spr.getColumn() != oldFrame) {

            this.speed = Vector2.scalarMultiply(this.dir, RUSH_SPEED);
            this.flip = this.speed.x < 0 ? Flip.None : Flip.Horizontal;
        }   
    }


    protected playerEvent(pl : Player, ev : GameEvent) {

        this.dir = Vector2.normalize(
            new Vector2(
                pl.getPos().x - this.pos.x, 
                pl.getPos().y - this.pos.y)
            );
    }


    protected wallCollisionEvent(dirx : number, diry : number, ev : GameEvent) {

        if (Math.abs(dirx) > 0)
            this.speed.x *= -1;

        if (Math.abs(diry) > 0)
            this.speed.y *= -1;
    }
}
