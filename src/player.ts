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

    private sprSword : Sprite;
    private attacking : boolean;


    constructor(x : number, y : number) {

        super(x, y);

        this.spr = new Sprite(16, 16);
        this.sprSword = new Sprite(16, 16);

        this.friction = new Vector2(0.1, 0.1);
        this.center = new Vector2(0, 7);

        this.rolling = false;
        this.rollTimer = 0.0;let dir = new Vector2();
        this.faceDirection = new Vector2(0, 1);

        this.attacking = false;
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


    private swordAttack(ev : GameEvent) {
        
        if (ev.getAction("fire2") == State.Pressed) {

            this.stopMovement();

            this.spr.setFrame(0, this.spr.getRow() + 6);
            this.sprSword.setFrame(3, this.spr.getRow());

            this.attacking = true;

            return true;
        }

        return false;
    }


    private control(ev : GameEvent) {

        const BASE_SPEED = 1.0;
        const EPS = 0.01;

        if (this.rolling || this.attacking) return;

        if (this.startRolling(ev) ||
            this.swordAttack(ev))
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
        const ATTACK_SPEED = 6;
        const ROLL_SPEED = 4;

        // TODO: Fix the "bug" where the character won't get
        // animated but moves if the player keeps tapping
        // keys

        let animSpeed = 0;

        if (this.attacking) {

            this.spr.animate(this.spr.getRow(), 0, 3, ATTACK_SPEED, ev.step);
            if (this.spr.getColumn() == 3) {

                this.attacking = false;
            }
            else {

                this.sprSword.setFrame(this.spr.getColumn() + 3, this.spr.getRow());
                return;
            }
        }

        if (this.rolling) {

            this.spr.animate(this.spr.getRow(), 0, 3, ROLL_SPEED, ev.step);
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


    private drawSword(c : Canvas) {

        let px = Math.round(this.pos.x);
        let py = Math.round(this.pos.y);

        // Might need this if the center changes
        /*
        let xoff = (this.center.x + this.spr.width/2);
        let yoff = (this.center.y + this.spr.height/2);
        */

        // Also TODO: Numeric constants as `const ...`

        let dir = this.flip == Flip.None ? 1 : -1;

        switch(this.spr.getRow() % 3) {

        case 0:

            c.drawSprite(this.sprSword, c.getBitmap("player"),
                px - 20 + 5 * (this.sprSword.getColumn()-3), 
                py - 6 + 2 * (this.sprSword.getColumn()-3));
            break;

        case 1:

            c.drawSprite(this.sprSword, c.getBitmap("player"),
                px - 1 + 7 * (dir - 1) + dir * 3 * (this.sprSword.getColumn()-3), 
                py - 24 + 4 * (this.sprSword.getColumn()-3),
                this.flip);
            break;

        case 2:

            c.drawSprite(this.sprSword, c.getBitmap("player"),
                px + 6 - 6 * (this.sprSword.getColumn()-3), 
                py - 20 - 2 * (this.sprSword.getColumn()-3));
            break;

        default:
            break;
        }
    }


    public draw(c : Canvas) {

        let shadow = c.getBitmap("shadow");

        let px = Math.round(this.pos.x);
        let py = Math.round(this.pos.y);

        let xoff = (this.center.x + this.spr.width/2);
        let yoff = (this.center.y + this.spr.height/2);

        c.setGlobalAlpha(0.67);
        c.drawBitmapRegion(shadow, 
            0, 0, 16, 8,
            px - shadow.width/4, 
            py - shadow.height/2);
        c.setGlobalAlpha();

        // Sword, back
        if (this.attacking && this.spr.getRow() % 3 > 0) {

            this.drawSword(c);
        }

        c.drawSprite(this.spr, c.getBitmap("player"),
            px - xoff, py - yoff, this.flip);

        // Sword, front
        if (this.attacking && this.spr.getRow() % 3 == 0) {

            this.drawSword(c);
        }
    }
}
