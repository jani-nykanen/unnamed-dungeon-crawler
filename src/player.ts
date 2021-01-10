/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


class Player extends CollisionObject {


    private flip : Flip;
    private rolling : boolean;
    private rollTimer : number;
    private faceDirection : Vector2;


    constructor(x : number, y : number) {

        super(x, y);

        this.spr = new Sprite(16, 16);

        this.friction = new Vector2(0.1, 0.1);
        this.center = new Vector2(0, 7);

        this.rolling = false;
        this.rollTimer = 0.0;let dir = new Vector2();
        this.faceDirection = new Vector2(0, 1);

        this.flip = Flip.None;
    }


    // Star trolling?
    private startRolling(ev : GameEvent) {

        const ROLL_SPEED = 1.5;
        const ROLL_TIME = 30;
    
        if (ev.getAction("fire1") == State.Pressed) {

            this.speed = this.faceDirection.clone().scalarMultiply(ROLL_SPEED);
            this.target = this.speed.clone();

            this.rolling = true;
            this.rollTimer = ROLL_TIME;

            this.spr.setFrame(0, this.spr.getRow() + 3);

            return true;
        }

        return false;
    }


    private control(ev : GameEvent) {

        const BASE_SPEED = 1.0;
        const EPS = 0.01;

        if (this.rolling) return;

        if (this.startRolling(ev))
            return;

        this.target = ev.getStick().scalarMultiply(BASE_SPEED);
        if (this.target.length() > EPS) {

            this.faceDirection = this.target.normalize();
        }
    }


    private animate(ev : GameEvent) {

        const EPS = 0.01;
        const BASE_RUN_SPEED = 12;
        const RUN_SPEED_MOD = 4;

        // TODO: Fix the "bug" where the character won't get
        // animated but moves if the player keeps tapping
        // keys

        let animSpeed = 0;

        if (this.rolling) {

            this.spr.animate(this.spr.getRow(), 0, 3, 4, ev.step);
            return;
        }

        let row = this.spr.getRow() % 3;

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


    private updateTimers(ev : GameEvent) {

        const MINIMUM_ROLL_TIME = 10;

        // Rolling
        if (this.rollTimer > 0.0) {

            if ((ev.getAction("fire1") & State.DownOrPressed) == 0) {

                this.rollTimer = Math.min(this.rollTimer, MINIMUM_ROLL_TIME);
            }

            this.rollTimer -= ev.step;
            if (this.rollTimer <= 0) {

                this.rollTimer = 0;
                this.rolling = false;
            }
        }
    }


    protected updateLogic(ev : GameEvent) {

        this.control(ev);
        this.animate(ev);
        this.updateTimers(ev);
    }


    public draw(c : Canvas) {

        let shadow = c.getBitmap("shadow");

        let px = Math.round(this.pos.x);
        let py = Math.round(this.pos.y);

        c.setGlobalAlpha(0.67);
        c.drawBitmapRegion(shadow, 
            0, 0, 16, 8,
            px - shadow.width/4, 
            py - shadow.height/2);
        c.setGlobalAlpha();

        c.drawSprite(this.spr, c.getBitmap("player"),
            px - (this.center.x + this.spr.width/2), 
            py - (this.center.y + this.spr.height/2), 
            this.flip);
    }
}
