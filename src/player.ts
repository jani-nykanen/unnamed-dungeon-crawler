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
    private swordHitbox : Rect;
    private swordHitId : number;
     
    private magicHitId : number;
    private usingMagic : boolean;

    private spinAttackTimer : number;
    private readyingSpinAttack : boolean;
    private spinning : boolean;
    private spinStartFrame : number;
    private spinStartFrameReached : boolean;

    private knockbackTimer : number;
    private hurtTimer : number;

    private damageBox : Vector2;

    private readonly bullets : ObjectGenerator<Bullet>;
    private readonly status : PlayerStatus;
    private readonly flyingText : ObjectGenerator<FlyingText>;


    constructor(x : number, y : number, 
        bullets : ObjectGenerator<Bullet>,
        flyingText : ObjectGenerator<FlyingText>,
        status : PlayerStatus) {

        super(x, y);

        this.spr = new Sprite(16, 16);
        this.spr.setFrame(0, 2);
        this.sprSword = new Sprite(16, 16);

        this.friction = new Vector2(0.1, 0.1);
        this.center = new Vector2();

        this.rolling = false;
        this.rollTimer = 0.0;
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
        this.status = status;
        this.flyingText = flyingText;

        this.hitbox = new Vector2(10, 8);
        this.collisionBox = new Vector2(8, 4);

        this.swordHitId = -1;
        this.magicHitId = -1;
        this.swordHitbox = new Rect();
        
        this.damageBox = new Vector2(10, 10);

        this.knockbackTimer = 0;
        this.hurtTimer = 0;
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


    private computeSwordHitbox() {

        const WIDTH = 24;
        const HEIGHT = 14;

        let x = this.pos.x;
        let y = this.pos.y;
        let w = 0;
        let h = 0;

        switch(this.spr.getRow() % 3) {

        case 2:
            y -= this.spr.height + HEIGHT/2;
        case 0:
            x -= WIDTH/2;
            w = WIDTH;
            h = HEIGHT;
            break;

        case 1:

            y -= WIDTH/2 + 3;

            if (this.flip == Flip.None)
                x += this.spr.width/2;
            else
                x -= this.spr.width/2 + HEIGHT;

            w = HEIGHT;
            h = WIDTH;
            
            break;

        default:
            break;
        }

        this.swordHitbox = new Rect(x, y, w, h);
    }


    private swordAttack(ev : GameEvent) : boolean {
        
        if (ev.getAction("fire2") == State.Pressed) {

            this.stopMovement();

            this.spr.setFrame(0, this.spr.getRow() + 6);
            this.sprSword.setFrame(3, this.spr.getRow());

            this.attacking = true;

            ++ this.swordHitId;
            this.computeSwordHitbox();

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

            // TODO: Sound effect if fails?
            if (!this.status.reduceBullet(1)) 
                return false;

            this.stopMovement();

            this.spr.setFrame(1, this.spr.getRow() + 6);

            this.usingMagic = true;

            this.bullets.next().spawn(
                0, this.magicHitId ++, 
                this.status.computeMagicDamage(),
                this.pos.x + XOFF[this.faceColumn], 
                this.pos.y + YOFF[this.faceColumn],
                DIR_X[this.faceColumn] * MAGIC_SPEED, 
                DIR_Y[this.faceColumn] * MAGIC_SPEED,
                true, this.pos);

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
            ++ this.swordHitId;

            this.spr.setFrame(this.spinStartFrame, 9);

            this.stopMovement();

            return true;
        }
        return false;
    }


    private control(ev : GameEvent) {

        const BASE_SPEED = 1.0;
        const EPS = 0.01;

        if (this.knockbackTimer > 0) {

            this.target.zeros();
            return;
        }

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

            this.faceDirection = Vector2.normalize(this.target);
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



    private computeSpinAttackHitbox() {

        const RADIUS = 18;

        this.swordHitbox = new Rect(
            this.pos.x - RADIUS,
            this.pos.y - 4 - RADIUS,
            RADIUS*2, RADIUS*2);
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

        // Not the best place for this, might be hard to find
        this.computeSpinAttackHitbox();
    }


    private animateMagicCast(ev : GameEvent) {

        const MAGIC_TIME = 20;

        this.spr.animate(this.spr.getRow(), 1, 2, MAGIC_TIME, ev.step);
        if (this.spr.getColumn() == 2) {

            this.usingMagic = false;
            this.spr.setFrame(0, this.spr.getRow() % 3);
        }    
    }


    private reverseRolling() {

        let newRow = 0;
        switch (this.spr.getRow() % 3) {

        case 0:

            newRow = 2;
            break;

        case 1:

            newRow = 0;
            this.flip = this.flip == Flip.Horizontal ? Flip.None : Flip.Horizontal;
            break;

        case 2:

            newRow = -2;
            break;

        default:
            break;
        }

        this.spr.setFrame(this.spr.getColumn(),  
            this.spr.getRow() + newRow, true);
        
        this.faceColumn = newRow == 1 ? 3 : newRow;
        // this.faceDirection = Vector2.normalize(this.speed, true);

        let dirx = 0;
        let diry = 0;
        switch(this.spr.getRow() % 3) {

        case 0: diry = 1; break;
        case 1: dirx = this.flip == Flip.None ? 1 : -1; break;
        case 2: diry = -1; break;
        default: break;
        }
        this.faceDirection = new Vector2(dirx, diry);
    }


    private animate(ev : GameEvent) {

        const EPS = 0.01;
        const BASE_RUN_SPEED = 12;
        const RUN_SPEED_MOD = 5;
        const ROLL_SPEED = 4;

        if (this.knockbackTimer > 0) return;

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

        // Knockback
        if (this.knockbackTimer > 0) {

            if ((this.knockbackTimer -= ev.step) <= 0) {

                this.spr.setFrame(0, this.spr.getColumn());
            }
        }
        // Hurt
        if (this.hurtTimer > 0) {   

            this.hurtTimer -= ev.step;
        }
    }


    protected updateProperties(ev : GameEvent) {

        this.bounceFactor = this.rolling ? 1 : 0;

        this.enableCameraCollision = this.knockbackTimer > 0.0;
    }


    protected wallCollisionEvent(dirx : number, diry : number, ev : GameEvent) {

        const EPS = 0.01;

        if (this.rolling) {

            this.reverseRolling();

            if (Math.abs(dirx) > EPS)
                this.target.x = Math.sign(this.speed.x) * Math.abs(this.target.x);

            if (Math.abs(diry) > EPS)  
                this.target.y = Math.sign(this.speed.y) * Math.abs(this.target.y);
        }
    }


    protected updateLogic(ev : GameEvent) {

        this.control(ev);
        this.updateTimers(ev);
        this.animate(ev);
        this.updateProperties(ev);
    }


    private drawSword(c : Canvas) {

        let px = Math.round(this.pos.x);
        let py = Math.round(this.pos.y);

        // TEMP: draw hitbox
        /*
        c.setFillColor(255, 0, 0);
        c.fillRect(this.swordHitbox.x, this.swordHitbox.y,
            this.swordHitbox.w, this.swordHitbox.h);
        */

        // Might need this if the center changes
        /*
        let xoff = (this.center.x + this.spr.width/2);
        let yoff = (this.center.y + this.spr.height/2);
        */

        // Also TODO: Numeric constants as `const ...`

        let dir = this.flip == Flip.None ? 1 : -1;

        let frame = this.sprSword.getColumn() - 3;

        // TODO: Lookup table for coordinate shift,
        // no need for switch case

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

        let xoff = this.spr.width/2;
        let yoff = 7 + this.spr.height/2;

        // Shadow
        c.setGlobalAlpha(0.67);
        c.drawBitmapRegion(shadow, 
            0, 0, 16, 8,
            px - 8, 
            py - 4);
        c.setGlobalAlpha();

        // Flicker if hurt
        if (this.hurtTimer > 0 && 
            this.knockbackTimer <= 0 &&
            Math.round(this.hurtTimer / 4) % 2 != 0)
            return;

        // Sword, back
        if (this.attacking && this.spr.getRow() % 3 > 0) {

            this.drawSword(c);
        }
        else if (this.spinning && this.spr.getColumn() % 3 != 0) {

            this.drawSwordSpinAttack(c);
        }

        // Base sprite
        let column = this.spr.getColumn();
        if (this.readyingSpinAttack && 
            Math.floor(this.spinAttackTimer / 4) % 2 == 0) {

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

        if (this.knockbackTimer > 0) return;

        let topLeft = cam.getWorldPos();

        let mx = 0;
        let my = 0;
        let move = false;

        if (this.pos.y + this.hitbox.y/2 >= topLeft.y + cam.height) {

            my = 1;
            move = true;
        }
        else if (this.pos.y - this.hitbox.y/2 <= topLeft.y) {

            my = -1;
            move = true;
        }
        else if (this.pos.x + this.hitbox.x/2 >= topLeft.x + cam.width) {

            mx = 1;
            move = true;
        }
        else if (this.pos.x - this.hitbox.x/2 <= topLeft.x) {

            mx = -1;
            move = true;
        }

        if (move) {

            cam.move(mx, my, CAM_SPEED);
        }
    }


    public cameraMovement(cam : Camera, ev : GameEvent) {

        let speed = cam.getSpeed() * 2;
        let dir = cam.getDirection();

        let moveMod = Math.abs(dir.y) > Math.abs(dir.x) ? cam.width/cam.height : 1;
        speed *= moveMod;

        this.pos.x += dir.x * speed * this.hitbox.x/2 * ev.step;
        this.pos.y += dir.y * speed * this.hitbox.y/2 * ev.step; 

        this.animate(ev);
    }


    public setInitialPosition(cam : Camera) {

        const YOFF = 40;

        let x = cam.getWorldPos().x + cam.width / 2;
        let y = cam.getWorldPos().y + cam.height / 2 + YOFF;

        this.pos = new Vector2(x, y);

        this.faceDirection = new Vector2(0, -1);
        this.faceColumn = 2;
    }


    public attackCollisionCheck(x : number, y : number, 
        w : number, h : number, type = 0) : boolean {

        return type == 0 &&
            (this.attacking || this.spinning) &&
            boxOverlayRect(this.swordHitbox, x, y, w, h);
    }


    public hurt(dmg : number, knockback : Vector2, ev : GameEvent) {

        const HURT_TIME = 60;
        const KNOCKBACK_TIME = 30;
        const KNOCKBACK_SPEED = 2.25;
        const DAMAGE_TEXT_SPEED = -1.0;

        if (this.hurtTimer > 0) return;

        this.hurtTimer = HURT_TIME;

        let column : number;
        if (knockback != null) {

            this.knockbackTimer = KNOCKBACK_TIME;

            this.speed.x = -KNOCKBACK_SPEED * knockback.x;
            this.speed.y = -KNOCKBACK_SPEED * knockback.y;

            // Determine column
            column = 0;
            if (Math.abs(this.speed.y) > Math.abs(this.speed.x)) {

                column = this.speed.y > 0.0 ? 2 : 0;
                this.flip = Flip.None; 
            }
            else {

                column = 1;
                this.flip = this.speed.x < 0 ? Flip.None : Flip.Horizontal;
            }
            this.spr.setFrame(column, 10);

            this.attacking = false;
            this.usingMagic = false;
            this.readyingSpinAttack = false;
            this.spinAttackTimer = 0;
            this.spinning = false;
            this.rolling = false;
        }

        this.status.reduceHealth(dmg);

        this.flyingText.next()
            .spawn(dmg, this.pos.x, this.pos.y-this.spr.height, 0, DAMAGE_TEXT_SPEED);
    }


    public hurtCollision(x : number, y : number, w : number, h : number,
        dmg : number, knockback : Vector2, ev : GameEvent) : boolean {

        if (this.hurtTimer > 0 || this.rolling) 
            return false;

        if (boxOverlay(this.pos, this.center, this.collisionBox, x, y, w, h)) {

            this.hurt(dmg, knockback, ev);

            return true;
        }

        return false;
    }


    public bulletCollision(b : Bullet, ev : GameEvent) : boolean {

        if (!b.doesExist() || b.isDying() || b.isFriendly())
            return false;

        if (this.hurtTimer > 0 || this.rolling) 
            return false;

        let p = b.getPos();
        let hbox = b.getHitbox();

        if (boxOverlay(new Vector2(this.pos.x, this.pos.y - this.spr.height/2 + 1), 
            this.center, this.damageBox, p.x - hbox.x/2, p.y - hbox.y/2,
            hbox.x, hbox.y)) {

            this.hurt(b.getDamage(), null, ev);
            b.kill(ev);
            return true;
        }   
        return false;
    }


    public getSwordHitId = () : number => this.swordHitId;
    public getSwordDamage = () : number => this.status.computeSwordDamage(this.spinning);
    public getFaceDirection = () : Vector2 => this.faceDirection.clone();
    public isSpinning = () : boolean => this.spinning;
    
    public recoverHealth = (count : number) => this.status.recoverHealth(count);
    public addGemStones = (count : number) => this.status.addGemStones(count);
    public addBullets = (count : number) => this.status.addBullets(count);

    public isAttacking = () : boolean => this.attacking || this.usingMagic;
    public isRolling = () : boolean => this.rolling;
    public isReadyingSpinAttack = () : boolean => this.readyingSpinAttack;
}
