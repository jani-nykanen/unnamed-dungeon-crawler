/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


class Bullet extends CollisionObject {

    private hitId : number;
    private friendly : boolean;

    private damage : number;


    constructor() {

        super(0, 0);

        this.exist = false;
        this.hitId = -1;
        this.collisionBox = new Vector2(4, 4);
        this.hitbox = this.collisionBox.clone();

        this.spr = new Sprite(24, 24);

        this.damage = 0;
    }


    protected outsideCameraEvent() {

        this.exist = false;
        this.dying = false;
    }


    protected die(ev : GameEvent) : boolean {

        const DEATH_SPEED = 4;

        this.spr.animate(0, 4, 8, DEATH_SPEED, ev.step);

        return this.spr.getColumn() == 8;
    }


    protected updateLogic(ev : GameEvent) {

        const ANIM_SPEED = 3;

        this.spr.animate(0, 0, 3, ANIM_SPEED, ev.step);
    }


    protected wallCollisionEvent(dirx : number, diry : number, ev : GameEvent) {

        this.kill(ev);
    }


    public kill(ev : GameEvent) {

        this.stopMovement();
        this.dying = true;
        this.ignoreDeathOnCollision = true;
    }


    public spawn(id : number, dmg : number,
            x : number, y : number,
            speedx : number, speedy : number,
            isFriendy = false,
            source : Vector2 = null) {

        this.pos = new Vector2(x, y);
        this.speed = new Vector2(speedx, speedy);
        this.target = this.speed.clone();

        this.spr.setFrame(0, 0);

        this.hitId = id;
        this.damage = dmg;
        this.friendly = isFriendy;

        this.exist = true;
        this.ignoreDeathOnCollision = false;

        if (source != null) {

            this.oldPos = source.clone();
        }
        else {

            this.oldPos = this.pos.clone();
        }
    }


    private baseDraw(c : Canvas) {

        let px = Math.round(this.pos.x);
        let py = Math.round(this.pos.y);

        c.setFillColor(255, 0, 0);
        c.drawSprite(this.spr, c.getBitmap("bullet"), 
            px - this.spr.width/2, py - this.spr.height/2);
    }


    public draw(c : Canvas) {

        if (!this.inCamera || !this.exist || this.dying) return;

        this.baseDraw(c);
    }


    public postDraw(c : Canvas) {

        if (!this.inCamera || !this.exist || !this.dying) return;

        this.baseDraw(c);
    }


    public getHitID = () : number => this.hitId;


    public attackCollisionCheck(x : number, y : number, 
        w : number, h : number, type = 0) : boolean {

        const RADIUS = 24;

        return this.dying && 
            boxOverlay(this.pos, 
            new Vector2(), 
            new Vector2(RADIUS, RADIUS),
            x, y, w, h);
    }


    public isFriendly = () : boolean => this.friendly;
    public getDamage = () : number => this.damage;
}
