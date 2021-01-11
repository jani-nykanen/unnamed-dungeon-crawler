/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */

// It has "a_" to make sure TypeScript parses shit in
// the correct order


// Needed for object generators (or not)
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

    protected hitbox : Vector2;

    protected dying : boolean;
    protected inCamera : boolean;

    protected spr : Sprite;


    constructor(x : number, y : number) {

        super();

        this.pos = new Vector2(x, y);
        this.oldPos = this.pos.clone();
        this.speed = new Vector2();
        this.target = this.speed.clone();
        this.friction = new Vector2(1, 1);
        this.center = new Vector2();

        this.hitbox = new Vector2();

        this.spr = new Sprite(0, 0);

        this.dying = false;
        this.inCamera = true; // TODO: Make it false, once possible
    }


    protected die = (ev : GameEvent) => true;
    protected updateLogic(ev : GameEvent) {}
    protected postUpdate(ev : GameEvent) {}
    protected outsideCameraEvent() {}


    private updateMovement(ev : GameEvent) {

        this.speed.x = updateSpeedAxis(this.speed.x,
            this.target.x, this.friction.x*ev.step);
        this.speed.y = updateSpeedAxis(this.speed.y,
            this.target.y, this.friction.y*ev.step);

        this.pos.x += this.speed.x * ev.step;
        this.pos.y += this.speed.y * ev.step;
    }


    public update(ev : GameEvent) {

        if (!this.exist || !this.inCamera) return;

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


    public cameraCheck(cam : Camera) {

        let topLeft = cam.getPos();

        let oldState = this.inCamera;
        this.inCamera = boxOverlay(this.pos, this.center, this.hitbox,
            topLeft.x, topLeft.y, cam.width, cam.height);

        if (oldState && !this.inCamera) {

            this.outsideCameraEvent();
        }
    }


    public draw(c : Canvas) {}


    public getPos = () => this.pos.clone();
    public isInCamera = () => this.inCamera;
    public isDying = () => this.dying;

    // Faster than cloning the pos
    public getCoordX = () => this.pos.x;
    public getCoordY = () => this.pos.y;
}



abstract class SpawnableObject extends GameObject {

    abstract spawn(id : number, x : number, y : number, 
        speedx : number, speedy : number) : void;
}



abstract class CollisionObject extends SpawnableObject {


    protected radius : number;


    constructor(x : number, y : number) {

        super(x, y);

        this.radius = 0.0;
    }


    protected wallCollisionEvent(ev : GameEvent) {}


    private pointCollision(x : number, y : number, ev : GameEvent) {

        let dist = Math.hypot(this.pos.x - x, this.pos.y - y);

        if (dist > this.radius) 
            return false;

        let dir = (new Vector2(this.pos.x - x, this.pos.y - y)).normalize();

        this.pos.x += (this.radius - dist) * dir.x;
        this.pos.y += (this.radius - dist) * dir.y;

        this.speed.x += (this.radius-dist) * dir.x;
        this.speed.y += (this.radius-dist) * dir.y;

        return false;
    }


    private baseWallCollision(x1 : number, y1 : number, 
        x2 : number, y2 : number, ev : GameEvent) : boolean {

        // TODO: This fails if the points are given in a wrong
        // order, that is, the normal points to a wrong direction.
        // Fix this.

        let u = (new Vector2(x2 - x1, y2 - y1)).normalize();
        let v = new Vector2(-u.y, u.x);

        let d = Vector2.dot(new Vector2(this.pos.x - x1, this.pos.y - y1), u);

		let x0 = x1 + d * u.x;
        let y0 = y1 + d * u.y;

        let dist = Math.hypot(this.pos.x - x0, this.pos.y - y0);

        if (dist > this.radius) 
            return false;

        let wallDist = (this.radius-dist);

        this.pos.x -= v.x * wallDist;
        this.pos.y -= v.y * wallDist;

        this.speed.x -= v.x * wallDist;
        this.speed.y -= v.y * wallDist;

        this.wallCollisionEvent(ev);
        
        return true;
    }

    
    public wallCollision(x1 : number, y1 : number, 
        x2 : number, y2 : number, ev : GameEvent) : boolean {
        
        if (!this.exist || this.dying) return false;

        return this.baseWallCollision(x1, y1, x2, y2, ev) ||
            this.pointCollision(x1, y1, ev) ||
            this.pointCollision(x2, y2, ev);   
    }
}

