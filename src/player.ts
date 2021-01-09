/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


class Player extends CollisionObject {


    private flip : Flip;


    constructor(x : number, y : number) {

        super(x, y);

        this.spr = new Sprite(16, 16);

        this.friction = new Vector2(0.1, 0.1);
        this.center = new Vector2(0, 7);

        this.flip = Flip.None;
    }


    private control(ev : GameEvent) {

        const BASE_SPEED = 1.0;

        this.target = ev.getStick().scalarMultiply(BASE_SPEED);
    }


    private animate(ev : GameEvent) {

        const EPS = 0.01;
        const BASE_RUN_SPEED = 12;
        const RUN_SPEED_MOD = 4;

        // TODO: Fix the "bug" where the character won't get
        // animated but moves if the player keeps tapping
        // keys

        let row = this.spr.getRow();
        let animSpeed = 0;

        // Determine direction (read: row)
        if (this.target.length() > EPS) {

            if (Math.abs(this.target.y) > Math.abs(this.target.x)) {

                row = this.target.y > 0 ? 0 : 2;
                this.flip = Flip.None;
            }
            else {

                row = 1;
                this.flip = this.target.x > 0 ? Flip.None : Flip.Horizontal;
            }

            animSpeed = BASE_RUN_SPEED - RUN_SPEED_MOD * this.speed.length();
            this.spr.animate(row, 0, 3, animSpeed, ev.step);
        }
        else {

            this.spr.setFrame(0, row);
        }
        
    }


    protected updateLogic(ev : GameEvent) {

        this.control(ev);
        this.animate(ev);
    }


    public draw(c : Canvas) {

        let shadow = c.getBitmap("shadow");

        let px = Math.round(this.pos.x);
        let py = Math.round(this.pos.y);

        c.setGlobalAlpha(0.67);
        c.drawBitmap(c.getBitmap("shadow"), 
            px - shadow.width/2, py - shadow.height/2);
        c.setGlobalAlpha();

        c.drawSprite(this.spr, c.getBitmap("player"),
            px - (this.center.x + this.spr.width/2), 
            py - (this.center.y + this.spr.height/2), 
            this.flip);
    }
}
