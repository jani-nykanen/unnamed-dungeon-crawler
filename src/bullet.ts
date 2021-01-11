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
        this.radius = 4;

        this.spr = new Sprite(16, 16);
    }


    protected outsideCameraEvent() {

        this.exist = false;
        this.dying = false;
    }


    protected updateLogic(ev : GameEvent) {

        const ANIM_SPEED = 4;

        this.spr.animate(this.id, 0, 2, ANIM_SPEED, ev.step);
    }


    protected wallCollisionEvent(ev : GameEvent) {

        this.stopMovement();
        this.dying = true;
    }


    public spawn(id : number, x : number, y : number,
            speedx : number, speedy : number) {

        this.pos = new Vector2(x, y);
        this.speed = new Vector2(speedx, speedy);
        this.target = this.speed.clone();

        this.id = id;
        this.friendly = id == 0;

        this.exist = true;
    }


    public draw(c : Canvas) {

        if (!this.inCamera || !this.exist) return;

        let px = Math.round(this.pos.x);
        let py = Math.round(this.pos.y);

        c.setFillColor(255, 0, 0);
        c.drawSprite(this.spr, c.getBitmap("bullet"), 
            px - this.spr.width/2, py - this.spr.height/2);
    }


    public isFriendly = () => this.friendly;
}
