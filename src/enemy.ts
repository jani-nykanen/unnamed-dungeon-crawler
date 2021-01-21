/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


abstract class Enemy extends CollisionObject {

    protected startPos : Vector2;
    protected shift : Vector2;

    private swordHitId : number;
    private magicHitId : number;

    private flyingText : ObjectGenerator<FlyingText>;
    private collectibles : ObjectGenerator<Collectible>;
    protected bullets : ObjectGenerator<Bullet>;

    protected flip : Flip;
    protected shadowType : number;
    protected radius : number;
    protected damage : number;
    protected mass : number;

    protected health : number;
    protected maxHealth : number;

    protected damageBox : Vector2;
    protected hurtTimer : number;

    protected canBeReset : boolean;

    
    constructor(x : number, y : number, row : number, health : number) {

        super(x, y);

        this.startPos = this.pos.clone();
        this.shift = new Vector2();

        this.spr = new Sprite(16, 16);
        this.spr.setFrame(0, row);

        this.swordHitId = -2;
        this.magicHitId = -2;

        this.flip = Flip.None;
        this.shadowType = 0;

        this.friction = new Vector2(0.1, 0.1);

        this.radius = 6;
        this.damage = 1;
        this.mass = 1;

        this.health = health;
        this.maxHealth = this.health;

        this.avoidWater = true;

        this.damageBox = new Vector2(this.spr.width, this.spr.height);
        this.hurtTimer = 0;

        this.canBeReset = false;
    }


    public passGenerators(
        flyingText : ObjectGenerator<FlyingText>,
        collectibles : ObjectGenerator<Collectible>,
        bullets : ObjectGenerator<Bullet>) : Enemy {

        this.flyingText = flyingText;
        this.collectibles = collectibles;
        this.bullets = bullets;

        return this;
    }


    protected reset() {}


    protected outsideCameraEvent() {

        if (this.canBeReset) {

            this.stopMovement();

            this.pos = this.startPos.clone();
            this.health = this.maxHealth;

            this.canBeReset = false;
            this.reset();
        }
    }


    public isActive() : boolean {

        return this.inCamera && this.exist && !this.dying;
    }


    protected updateAI(ev : GameEvent) {}
    protected playerEvent(pl : Player, ev : GameEvent) {}


    protected die(ev : GameEvent) : boolean {

        const DEATH_SPEED = 6.0;

        this.spr.animate(0, 0, 4, DEATH_SPEED, ev.step);

        return this.spr.getColumn() == 4;
    }


    protected updateLogic(ev : GameEvent) {

        // if (!this.isActive()) return;

        if (this.hurtTimer > 0)
            this.hurtTimer -= ev.step;

        this.updateAI(ev);

        this.canBeReset = true;
    }


    public draw(c : Canvas) {

        if (!this.exist || !this.inCamera)
            return;

        let shadow = c.getBitmap("shadow");

        let px = Math.round(this.pos.x);
        let py = Math.round(this.pos.y);

        // Shadow
        c.setGlobalAlpha(0.67);
        c.drawBitmapRegion(shadow, 
            this.shadowType*16, 0, 16, 8,
            px - 8, 
            py - 4);
        c.setGlobalAlpha();

        px += this.shift.x | 0;
        py += this.shift.y | 0;

        // Flicker if hurt
        if (this.hurtTimer > 0 &&
            Math.round(this.hurtTimer / 4) % 2 != 0)
            return;

        let xoff = this.spr.width/2;
        let yoff = 7 + this.spr.height/2;

        c.drawSprite(this.spr, c.getBitmap("enemies"),
            px - xoff, py - yoff, this.flip);
    }


    private kill(ev : GameEvent) {

        const COLLECTIBLE_PROBABILITY = 0.5;
        const COL_OFFSET_Y = -4;

        this.hurtTimer = 0;
        this.dying = true;
        this.flip = Flip.None;

        // Spawn a collectible
        let collectibleType = determineGeneratedColletibleId(COLLECTIBLE_PROBABILITY);
        if (collectibleType >= 0) {

            this.collectibles.next().spawn(collectibleType,
                this.pos.x, this.pos.y + COL_OFFSET_Y);
        }
    }


    private takeDamage(dmg : number, dir : Vector2, ev : GameEvent) {
        
        const HURT_TIME = 30;
        const DAMAGE_TEXT_SPEED = -1.0;
        const KNOCKBACK_SPEED = 1.0;

        if ((this.health -= dmg) <= 0) {

            this.kill(ev);
        }
        else {

            this.speed.x = dir.x * KNOCKBACK_SPEED * this.mass;
            this.speed.y = dir.y * KNOCKBACK_SPEED * this.mass;

            this.hurtTimer = HURT_TIME;
        }

        this.flyingText.next().spawn(
            dmg, this.pos.x, this.pos.y - this.spr.height +1,
            0, DAMAGE_TEXT_SPEED, 1);
    }
    
    
    public playerCollision(pl : Player, ev : GameEvent) : boolean {

        const SPIN_ATTACK_KNOCKBACK_BONUS = 1.5;

        if (!this.isActive()) 
            return false;

        let cx = this.pos.x;
        let cy = this.pos.y - this.spr.height/2 + 1;

        this.playerEvent(pl, ev);

        pl.hurtCollision(
            this.pos.x - this.hitbox.x/2, 
            this.pos.y - this.hitbox.y/2,
            this.hitbox.x, this.hitbox.y,
            this.damage,
            Vector2.direction(pl.getPos(), this.pos),
            ev);

        // Sword
        if (pl.getSwordHitId() > this.swordHitId &&
            pl.attackCollisionCheck(
                cx - this.damageBox.x/2,
                cy - this.damageBox.y/2,
                this.damageBox.x, this.damageBox.y)) {

            this.swordHitId = pl.getSwordHitId();

            this.takeDamage(pl.getSwordDamage(), 
                pl.isSpinning() ? 
                    Vector2.scalarMultiply(Vector2.direction(pl.getPos(), this.pos), 
                    SPIN_ATTACK_KNOCKBACK_BONUS) :
                    pl.getFaceDirection(), ev);

            return true;
        }

        return false;
    }


    public bulletCollision(b : Bullet, ev : GameEvent) : boolean {

        if (!this.isActive() || !b.doesExist() || !b.isFriendly()) 
            return false;

        let cx = this.pos.x;
        let cy = this.pos.y - this.spr.height/2 + 1;

        // Collision with the bullet
        if (!b.isDying() &&
            boxOverlay(b.getPos(), new Vector2(), b.getHitbox(),
            cx - this.damageBox.x/2,
            cy - this.damageBox.y/2,
            this.damageBox.x, this.damageBox.y)) {

            b.kill(ev);
        }

        // Collision with the explosion
        if (b.isDying() && b.doesIgnoreDeathOnCollision() &&
            b.getHitID() > this.magicHitId &&
            b.attackCollisionCheck(
                cx - this.damageBox.x/2,
                cy - this.damageBox.y/2,
                this.damageBox.x, this.damageBox.y)) {

            this.magicHitId = b.getHitID();

            // TODO: Reduce damage first
            this.takeDamage(b.getDamage(),
                Vector2.direction(b.getPos(), this.pos),
                ev);

            return true;
        }

        return false;
    }


    public enemyToEnemyCollision(e : Enemy) : boolean {

        if (!e.doesExist() || !this.exist || 
            !e.isInCamera() || !this.isInCamera ||
            e.isDying() || this.dying)
            return false;

        let dir : Vector2;
        let dist = Vector2.distance(this.pos, e.pos);
        if (dist < this.radius + e.radius) {

            dist = this.radius + e.radius - dist;
            dir = Vector2.direction(e.pos, this.pos);

            this.pos.x += dir.x * dist / 2;
            this.pos.y += dir.y * dist / 2;

            e.pos.x -= dir.x * dist / 2;
            e.pos.y -= dir.y * dist / 2;

            return true;
        }
        return false;
    }


    /*
     * Utility functions
     */

    
    protected shootBullet(id : number, dmg : number,
        x : number, y : number, speed : number, dir : Vector2) {

        this.bullets.next().spawn(id, -1, dmg, x, y, 
            speed * dir.x, speed * dir.y, false, this.pos);
    }
}
