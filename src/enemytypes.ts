/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


const getEnemyList = () : Array<Function> => [
    Slime, Bat, Spider
];


class Slime extends Enemy {

    
    private dir : Vector2;


    constructor(x : number, y : number, 
        flyingText : ObjectGenerator<FlyingText>,
        collectibles : ObjectGenerator<Collectible>) {

        super(x, y, 1, 5, flyingText, collectibles);

        this.shadowType = 1;
        this.spr.setFrame((Math.random() * 4) | 0, this.spr.getRow());

        this.friction = new Vector2(0.0125, 0.0125);
        this.dir = new Vector2(0, 1);

        this.radius = 4;
        this.damage = 2;

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

        this.dir = Vector2.direction(this.pos, pl.getPos());
    }


    protected wallCollisionEvent(dirx : number, diry : number, ev : GameEvent) {

        if (Math.abs(dirx) > 0)
            this.speed.x *= -1;

        if (Math.abs(diry) > 0)
            this.speed.y *= -1;
    }
}


class Bat extends Enemy {

    
    private dir : Vector2;


    constructor(x : number, y : number, 
        flyingText : ObjectGenerator<FlyingText>,
        collectibles : ObjectGenerator<Collectible>) {

        super(x, y, 2, 7, flyingText, collectibles);

        this.shadowType = 1;
        this.spr.setFrame((Math.random() * 4) | 0, this.spr.getRow());

        this.friction = new Vector2(0.025, 0.025);
        this.dir = new Vector2(0, 1);

        this.radius = 4;
        this.damage = 2;

        this.hitbox = new Vector2(6, 4);
        this.collisionBox = this.hitbox.clone();
        this.damageBox = new Vector2(10, 10);

        this.avoidWater = false;
    }


    protected updateAI(ev : GameEvent) {
        
        const ANIM_SPEED = 8;
        const MOVE_SPEED = 0.25;

        this.spr.animate(this.spr.getRow(), 0, 3, ANIM_SPEED, ev.step);

        this.target = Vector2.scalarMultiply(this.dir, MOVE_SPEED);
    }


    protected playerEvent(pl : Player, ev : GameEvent) {

        this.dir = Vector2.direction(this.pos, pl.getPos());
    }

}


class Spider extends Enemy {

    
    private dir : Vector2;
    private moveTimer : number;
    private moving : boolean;


    static MOVE_TIME = 60;


    constructor(x : number, y : number, 
        flyingText : ObjectGenerator<FlyingText>,
        collectibles : ObjectGenerator<Collectible>) {

        super(x, y, 3, 10, flyingText, collectibles);

        this.shadowType = 0;
        this.spr.setFrame(0, this.spr.getRow());

        this.mass = 1.5;
        this.friction = new Vector2(0.05, 0.05);
        this.dir = new Vector2(0, 1);

        this.radius = 5;
        this.damage = 3;

        this.hitbox = new Vector2(8, 6);
        this.collisionBox = this.hitbox.clone();
        this.damageBox = new Vector2(12, 10);

        this.moveTimer = Spider.MOVE_TIME/2 + ((Math.random() * Spider.MOVE_TIME/2) | 0);
        this.moving = false;
    }


    protected updateAI(ev : GameEvent) {
        
        const ANIM_SPEED = 6;
        const MOVE_SPEED = 0.75;

        let angle : number;
        if ((this.moveTimer -= ev.step) <= 0) {

            if (!this.moving) {

                angle = Math.random() * Math.PI*2;
                this.dir = new Vector2(Math.cos(angle), Math.sin(angle));
                this.target = Vector2.scalarMultiply(this.dir, MOVE_SPEED);
            }
            this.moving = !this.moving;

            this.moveTimer += Spider.MOVE_TIME;
        }

        if (this.moving) {

            
            this.flip = this.target.x < 0 ? Flip.None : Flip.Horizontal;

            this.spr.animate(this.spr.getRow(), 0, 3, ANIM_SPEED, ev.step);
        }
        else {

            this.target.zeros();
            this.spr.setFrame(0, this.spr.getRow());
        }
    }


    protected wallCollisionEvent(dirx : number, diry : number, ev : GameEvent) {

        if (Math.abs(dirx) > 0) {

            this.target.x *= -1;
            this.speed.x *= -1;
        }

        if (Math.abs(diry) > 0) {
         
            this.target.y *= -1;
            this.speed.y *= -1;
        }
    }
}

