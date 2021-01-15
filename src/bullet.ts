/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


class Bullet extends CollisionObject {


    private friendly : boolean;
    private id : number;


    constructor() {

        super(0, 0);

        this.exist = false;
        this.id = 0;
        this.friendly = false;
        this.collisionBox = new Vector2(4, 4);
        this.hitbox = this.collisionBox.clone();

        this.spr = new Sprite(24, 24);
    }


    protected outsideCameraEvent() {

        this.exist = false;
        this.dying = false;
    }


    protected die(ev : GameEvent) : boolean {

        const DEATH_SPEED = 4;

        this.spr.animate(this.id, 4, 8, DEATH_SPEED, ev.step);

        return this.spr.getColumn() == 8;
    }


    protected updateLogic(ev : GameEvent) {

        const ANIM_SPEED = 3;

        this.spr.animate(this.id, 0, 3, ANIM_SPEED, ev.step);
    }


    protected wallCollisionEvent(dirx : number, diry : number, ev : GameEvent) {

        this.stopMovement();
        this.dying = true;
    }


    public spawn(id : number, x : number, y : number,
            speedx : number, speedy : number) {

        this.pos = new Vector2(x, y);
        this.speed = new Vector2(speedx, speedy);
        this.target = this.speed.clone();

        this.spr.setFrame(0, this.id);

        this.id = id;
        this.friendly = id == 0;

        this.exist = true;
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


    public isFriendly = () => this.friendly;
}
