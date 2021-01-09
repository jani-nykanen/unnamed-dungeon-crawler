/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


// Needed for object generators
abstract class ExistingObject {

    protected exist : boolean;


    constructor() {

        this.exist = true;
    }


    public doesExist = () => this.exist;
} 


abstract class GameObject extends ExistingObject {
    

    protected pos : Vector2;
    protected oldPos : Vector2;
    protected speed : Vector2;
    protected target : Vector2;
    protected friction : Vector2;
    protected center : Vector2;

    protected dying : boolean;

    protected spr : Sprite;


    constructor(x : number, y : number) {

        super();

        this.pos = new Vector2(x, y);
        this.oldPos = this.pos.clone();
        this.speed = new Vector2();
        this.target = this.speed.clone();
        this.friction = new Vector2(1, 1);
        this.center = new Vector2();

        this.spr = new Sprite(0, 0);

        this.dying = false;
    }


    protected die = (ev : GameEvent) => true;
    protected updateLogic(ev : GameEvent) {}
    protected postUpdate(ev : GameEvent) {}


    private updateMovement(ev : GameEvent) {

        this.speed.x = updateSpeedAxis(this.speed.x,
            this.target.x, this.friction.x*ev.step);
        this.speed.y = updateSpeedAxis(this.speed.y,
            this.target.y, this.friction.y*ev.step);

        this.pos.x += this.speed.x * ev.step;
        this.pos.y += this.speed.y * ev.step;
    }


    public update(ev : GameEvent) {

        if (!this.exist) return;

        /*
        if (!this.inCamera) {

            this.outsideCameraEvent(ev);
            return;
        }
        */

        if (this.dying) {

            if (this.die(ev)) {

                this.exist = false;
                this.dying = false;
            }
            return;
        }

        this.oldPos = this.pos.clone();

        this.updateLogic(ev);
        this.updateMovement(ev);
        this.postUpdate(ev);
    }


    public stopMovement() {

        this.speed.zeros();
        this.target.zeros();
    }


    public draw(c : Canvas) {}


    public getPos = () => this.pos;
}


abstract class CollisionObject extends GameObject {


    constructor(x : number, y : number) {

        super(x, y);
    }

    //
    // TODO: Collisions
    //
}
