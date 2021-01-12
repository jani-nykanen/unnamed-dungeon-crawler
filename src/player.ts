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
    private faceColumn : number;

    private sprSword : Sprite;
    private attacking : boolean;
    private usingMagic : boolean;

    private spinAttackTimer : number;
    private readyingSpinAttack : boolean;
    private spinning : boolean;
    private spinStartFrame : number;
    private spinStartFrameReached : boolean;

    private readonly bullets : ObjectGenerator<Bullet>;


    constructor(x : number, y : number, bullets : ObjectGenerator<Bullet>) {

        super(x, y);

        this.spr = new Sprite(16, 16);
        this.sprSword = new Sprite(16, 16);

        this.friction = new Vector2(0.1, 0.1);
        this.center = new Vector2(0, 7);

        this.rolling = false;
        this.rollTimer = 0.0;let dir = new Vector2();
        this.faceDirection = new Vector2(0, 1);
        this.faceColumn = 0;

        this.attacking = false;
        this.usingMagic = false;

        this.flip = Flip.None;

        this.readyingSpinAttack = false;
        this.spinAttackTimer = 0.0;
        this.spinning = false;
        this.spinStartFrameReached = false;

        this.bullets = bullets;

        this.radius = 6;
    }


    // Star trolling?
    private startRolling(ev : GameEvent) : boolean {

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


    private swordAttack(ev : GameEvent) : boolean {
        
        if (ev.getAction("fire2") == State.Pressed) {

            this.stopMovement();

            this.spr.setFrame(0, this.spr.getRow() + 6);
            this.sprSword.setFrame(3, this.spr.getRow());

            this.attacking = true;

            return true;
        }

        return false;
    }


    private useMagic(ev : GameEvent) : boolean {

        const MAGIC_SPEED = 2.0;

        const DIR_X = [0, -1, 0, 1];
        const DIR_Y = [1, 0, -1, 0];

        const XOFF = [0, -6, 0, 6];
        const YOFF = [0, -4, -8, -4];

        if (!this.readyingSpinAttack &&
            ev.getAction("fire3") == State.Pressed) {

            this.stopMovement();

            this.spr.setFrame(1, this.spr.getRow() + 6);

            this.usingMagic = true;

            this.bullets.spawn(0,
                this.pos.x + XOFF[this.faceColumn], 
                this.pos.y + YOFF[this.faceColumn],
                DIR_X[this.faceColumn] * MAGIC_SPEED, 
                DIR_Y[this.faceColumn] * MAGIC_SPEED);

            return true;
        }
        return false;
    }


    private handleSpinAttack(ev : GameEvent) : boolean {

        if ((ev.getAction("fire2") & State.DownOrPressed) == 0) {

            this.readyingSpinAttack = false;
            this.spinning = true;
            this.spinStartFrame = this.faceColumn;
            this.spinStartFrameReached = false;

            this.spr.setFrame(this.spinStartFrame, 9);

            this.stopMovement();

            return true;
        }
        return false;
    }


    private control(ev : GameEvent) {

        const BASE_SPEED = 1.0;
        const EPS = 0.01;

        if (this.rolling  || this.attacking || 
            this.spinning || this.usingMagic) 
            return;

        if (this.startRolling(ev) ||
            this.swordAttack(ev) ||
            this.useMagic(ev) ||
            (this.readyingSpinAttack && this.handleSpinAttack(ev)))
            return;

        this.target = ev.getStick().scalarMultiply(BASE_SPEED);
        if (this.target.length() > EPS) {

            this.faceDirection = this.target.normalize();
        }
    }


    private animateSwordFighting(ev : GameEvent) {

        const ATTACK_SPEED = 6;
        const ATTACK_FINAL_FRAME = 20;

        this.spr.animate(this.spr.getRow(), 0, 3, 
                this.spr.getColumn() == 2 ? ATTACK_FINAL_FRAME : ATTACK_SPEED, 
                ev.step);
        if (this.spr.getColumn() == 3 || 
            (this.spr.getColumn() == 2 && 
            this.spr.getTimer() >= ATTACK_SPEED &&
            (ev.getAction("fire2") & State.DownOrPressed) == 0)) {

            this.attacking = false;
            this.readyingSpinAttack = this.spr.getColumn() == 3;
        }
        else {

            this.sprSword.setFrame(this.spr.getColumn() + 3, this.spr.getRow()); 
        }
    }


    private animateSpinning(ev : GameEvent) {

        const SPIN_ATTACK_SPEED = 4;

        let row = 0;
        let oldFrame = this.spr.getColumn();

        this.flip = Flip.None;

        this.spr.animate(this.spr.getRow(), 0, 3, SPIN_ATTACK_SPEED, ev.step);
        if (!this.spinStartFrameReached &&
            oldFrame != this.spinStartFrame &&
            this.spr.getColumn() == this.spinStartFrame) {

            this.spinStartFrameReached = true;
        }

        if (this.spinStartFrameReached &&
            oldFrame == this.spinStartFrame &&
            this.spr.getColumn() != oldFrame) {

            this.spinning = false;

            if (this.spinStartFrame != 3) {

                row = this.spinStartFrame % 3;
            }
            else {

                row = 1;
            }
            this.spr.setFrame(0, row);

            this.flip = this.spinStartFrame == 1 ? Flip.Horizontal : Flip.None;
        }
        else {

            this.sprSword.setFrame(this.spr.getColumn() + 4, this.spr.getRow());
        }  
    }


    private animateMagicCast(ev : GameEvent) {

        const MAGIC_TIME = 20;

        this.spr.animate(this.spr.getRow(), 1, 2, MAGIC_TIME, ev.step);
        if (this.spr.getColumn() == 2) {

            this.usingMagic = false;
            this.spr.setFrame(0, this.spr.getRow() % 3);
        }    
    }


    private animate(ev : GameEvent) {

        const EPS = 0.01;
        const BASE_RUN_SPEED = 12;
        const RUN_SPEED_MOD = 4;
        const ROLL_SPEED = 4;

        // TODO: Fix the "bug" where the character won't get
        // animated but moves if the player keeps tapping
        // keys

        if (this.usingMagic) {

            this.animateMagicCast(ev);
            return;
        }

        if (this.spinning) {

            this.animateSpinning(ev);
            return;
        }

        if (this.attacking) {

            this.animateSwordFighting(ev);
            return;
        }

        if (this.rolling) {

            this.spr.animate(this.spr.getRow(), 0, 3, ROLL_SPEED, ev.step);
            return;
        }

        let row = this.spr.getRow() % 3;
        let animSpeed = 0;

        // Determine direction (read: row)
        if (this.target.length() > EPS) {

            if (Math.abs(this.target.y) > Math.abs(this.target.x)) {

                row = this.target.y > 0 ? 0 : 2;
                this.flip = Flip.None;

                this.faceColumn = row;
            }
            else {

                row = 1;
                this.flip = this.target.x > 0 ? Flip.None : Flip.Horizontal;

                this.faceColumn = this.target.x > 0 ? 3 : 1;
            }

            animSpeed = BASE_RUN_SPEED - RUN_SPEED_MOD * this.speed.length();
            this.spr.animate(row, 0, 3, animSpeed, ev.step);
        }
        else {

            this.spr.setFrame(0, row, true);
        }
        
    }


    private updateTimers(ev : GameEvent) {

        const MINIMUM_ROLL_TIME = 10;
        const MAX_SPIN_ATTACK_TIME = 8;

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

        // Spin attack, readying
        if (this.readyingSpinAttack) {

            this.spinAttackTimer = (this.spinAttackTimer + ev.step) % MAX_SPIN_ATTACK_TIME;
        }
    }


    protected updateLogic(ev : GameEvent) {

        this.control(ev);
        this.updateTimers(ev);
        this.animate(ev);
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

        let frame = this.sprSword.getColumn() - 3;

        switch(this.spr.getRow() % 3) {

        case 0:

            c.drawSprite(this.sprSword, c.getBitmap("player"),
                px - 16 + frame * 8, 
                py - 4);
            break;

        case 1:

            c.drawSprite(this.sprSword, c.getBitmap("player"),
                px + 3 - (dir < 0 ? 22 : 0), 
                py - 16 + frame * 4,
                this.flip);
            break;

        case 2:

            c.drawSprite(this.sprSword, c.getBitmap("player"),
                px - frame * 8, 
                py - 22);
            break;

        default:
            break;
        }
    }


    private drawSwordSpinAttack(c : Canvas) {

        const POS_X = [-15, -16, 0, -1];
        const POS_Y = [-6, -20, -20, -6];

        let px = Math.round(this.pos.x);
        let py = Math.round(this.pos.y);

        c.drawSprite(this.sprSword, c.getBitmap("player"),
            px + POS_X[this.spr.getColumn()], 
            py +  POS_Y[this.spr.getColumn()]);
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
        else if (this.spinning && this.spr.getColumn() % 3 != 0) {

            this.drawSwordSpinAttack(c);
        }

        // Base sprite
        let column = this.spr.getColumn();
        if (this.readyingSpinAttack && Math.floor(this.spinAttackTimer / 4) % 2 == 0) {

            column += 6;
        }
        c.drawSpriteFrame(this.spr, c.getBitmap("player"),
            column, this.spr.getRow(),
            px - xoff, py - yoff, this.flip);

        // Sword, front
        if (this.attacking && this.spr.getRow() % 3 == 0) {

            this.drawSword(c);
        }
        else if (this.spinning && this.spr.getColumn() % 3 == 0) {

            this.drawSwordSpinAttack(c);
        }
    }


    public cameraEvent(cam : Camera) {

        const CAM_SPEED = 1.0 / 20.0;

        let topLeft = cam.getWorldPos();

        let mx = 0;
        let my = 0;
        let move = false;

        if (this.pos.y + this.radius >= topLeft.y + cam.height) {

            my = 1;
            move = true;
        }
        else if (this.pos.y - this.radius <= topLeft.y) {

            my = -1;
            move = true;
        }
        else if (this.pos.x + this.radius >= topLeft.x + cam.width) {

            mx = 1;
            move = true;
        }
        else if (this.pos.x - this.radius <= topLeft.x) {

            mx = -1;
            move = true;
        }

        if (move) {

            cam.move(mx, my, CAM_SPEED);
        }
    }


    public cameraMovement(cam : Camera, ev : GameEvent) {

        let speed = cam.getSpeed() * this.radius * 2;
        let dir = cam.getDirection();

        let moveMod = Math.abs(dir.y) > Math.abs(dir.x) ? cam.width/cam.height : 1;
        speed *= moveMod;

        this.pos.x += dir.x * speed * ev.step;
        this.pos.y += dir.y * speed * ev.step; 
    }
}
