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


    protected die (ev : GameEvent) : boolean {

        return true;
    }


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

        let topLeft = cam.getWorldPos();

        let oldState = this.inCamera;
        this.inCamera = boxOverlay(this.pos, this.center, this.hitbox,
            topLeft.x, topLeft.y, cam.width, cam.height);

        if (oldState && !this.inCamera) {

            this.outsideCameraEvent();
        }
    }


    public draw(c : Canvas) {}
    public postDraw(c : Canvas) {}


    public getPos = () => this.pos.clone();
    public isInCamera = () => this.inCamera;
    public isDying = () => this.dying;

    // Faster than cloning the pos
    public getCoordX = () => this.pos.x;
    public getCoordY = () => this.pos.y;
}



abstract class SpawnableObject extends GameObject {

    public spawn(id : number, x : number, y : number, 
        speedx : number, speedy : number) {}
}



abstract class CollisionObject extends SpawnableObject {


    protected collisionBox : Vector2;
    protected bounceFactor : number;
    protected ignoreDeathOnCollision : boolean;


    constructor(x : number, y : number) {

        super(x, y);

        this.collisionBox = new Vector2();
        this.bounceFactor = 0;

        this.ignoreDeathOnCollision = false;
    }


    protected wallCollisionEvent(dirx : number, diry : number, ev : GameEvent) {}


    public horizontalCollision(
        x : number, y : number, h : number, 
        dir : number, ev : GameEvent, force = false) {

        const EPS = 0.001;
        const V_MARGIN = 1;
        const NEAR_MARGIN = 1;
        const FAR_MARGIN = 2;
        
        if (!this.inCamera ||
            //(!force && this.disableCollisions) ||
            !this.exist || this.dying || 
            this.speed.x * dir < EPS) 
            return false;

        let top = this.pos.y + this.center.y - this.collisionBox.y/2;
        let bottom = top + this.collisionBox.y;

        if (bottom <= y + V_MARGIN || top >= y + h - V_MARGIN)
            return false;

        let xoff = this.center.x + this.collisionBox.x/2 * dir;
        let nearOld = this.oldPos.x + xoff
        let nearNew = this.pos.x + xoff;

        if ((dir > 0 && nearNew >= x - NEAR_MARGIN*ev.step &&
             nearOld <= x + (FAR_MARGIN + this.speed.x)*ev.step) || 
             (dir < 0 && nearNew <= x + NEAR_MARGIN*ev.step &&
             nearOld >= x - (FAR_MARGIN - this.speed.x)*ev.step)) {

            this.pos.x = x - xoff;
            this.speed.x *= -this.bounceFactor;

            this.wallCollisionEvent(dir, 0, ev);

            return true;
        }

        return false;
    }    


    public verticalCollision(
        x : number, y : number, w : number, 
        dir : number, ev : GameEvent, force = false) {

        const EPS = 0.001;
        const H_MARGIN = 1;
        const NEAR_MARGIN = 1;
        const FAR_MARGIN = 2;
        
        if (!this.inCamera ||
            //(!force && this.disableCollisions) ||
            !this.exist || this.dying || 
            this.speed.y * dir < EPS) 
            return false;

        let left = this.pos.x + this.center.x - this.collisionBox.x/2;
        let right = left + this.collisionBox.x;

        if (right <= x + H_MARGIN || left >= x + w - H_MARGIN)
            return false;

        let yoff = this.center.y + this.collisionBox.y/2 * dir;
        let nearOld = this.oldPos.y + yoff
        let nearNew = this.pos.y + yoff;

        if ((dir > 0 && nearNew >= y - NEAR_MARGIN*ev.step &&
             nearOld <= y + (FAR_MARGIN + this.speed.y)*ev.step) || 
             (dir < 0 && nearNew <= y + NEAR_MARGIN*ev.step &&
             nearOld >= y - (FAR_MARGIN - this.speed.y)*ev.step)) {

            this.pos.y = y - yoff;
            this.speed.y *= -this.bounceFactor;

            this.wallCollisionEvent(0, dir, ev);

            return true;
        }

        return false;
    }    


    public attackCollisionCheck(x : number, y : number, 
        w : number, h: number, type = 0) : boolean {

        return false;
    }


    public hurtCollision(x : number, y : number, w : number, h : number, 
        dmg : number, ev : GameEvent) : boolean {

        return false;
    }


    public doesIgnoreDeathOnCollision = () : boolean => this.ignoreDeathOnCollision;
}

