/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


class Leaf extends CollisionObject {


    private timer : number;


    constructor() {

        super(0, 0);
        this.exist = false;

        this.timer = 0;
        this.spr = new Sprite(8, 8);

        this.friction = new Vector2(0.01, 0.05);
    }


    public spawn(id : number, x : number, y : number,
        speedx : number, speedy : number) {

        const TIME = 30;
        const BASE_GRAVITY = 2.0;

        this.pos = new Vector2(x, y);
        this.speed = new Vector2(speedx, speedy);
        this.target = new Vector2(0, BASE_GRAVITY);

        this.spr.setFrame((Math.random() * 4) | 0, id);
        this.timer = TIME;

        this.exist = true;
    }


    protected outsideCameraEvent() {

        this.exist = false;
        this.dying = false;
    }


    protected updateLogic(ev : GameEvent) {

        if ((this.timer -= ev.step) <= 0) {

            this.exist = false;
            this.dying = false;
        }
    }


    public draw(c : Canvas) {

        c.setFillColor(255, 0, 0);
        c.drawSprite(this.spr, c.getBitmap("leaves"),
            Math.round(this.pos.x) - 4,
            Math.round(this.pos.y) - 4);
    }

}
