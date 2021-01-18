/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


abstract class Enemy extends CollisionObject {


    private swordHitId : number;
    private magicHitId : number;

    protected flip : Flip;
    protected shadowType : number;
    protected radius : number;
    protected damage : number;

    protected damageBox : Vector2;

    
    constructor(x : number, y : number, row : number) {

        super(x, y);

        this.spr = new Sprite(16, 16);
        this.spr.setFrame(0, row);

        this.swordHitId = -2;
        this.magicHitId = -2;

        this.flip = Flip.None;
        this.shadowType = 0;

        this.friction = new Vector2(0.1, 0.1);

        this.radius = 6;
        this.damage = 1;

        this.avoidWater = true;

        this.damageBox = new Vector2(this.spr.width, this.spr.height);
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

        if (!this.isActive()) return;

        this.updateAI(ev);
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
            px - shadow.width/4, 
            py - shadow.height/2);
        c.setGlobalAlpha();

        let xoff = this.spr.width/2;
        let yoff = 7 + this.spr.height/2;

        c.drawSprite(this.spr, c.getBitmap("enemies"),
            px - xoff, py - yoff, this.flip);
    }


    private kill(ev : GameEvent) {

        this.dying = true;
        this.flip = Flip.None;
    }


    public playerCollision(pl : Player, ev : GameEvent) : boolean {

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
            (new Vector2(this.pos.x - pl.getPos().x, 
                this.pos.y - pl.getPos().y)).normalize(),
            ev);

        // Sword
        if (pl.getSwordHitId() > this.swordHitId &&
            pl.attackCollisionCheck(
                cx - this.damageBox.x/2,
                cy - this.damageBox.y/2,
                this.damageBox.x, this.damageBox.y)) {

            ++ this.swordHitId;

            // TODO: Reduce damage first
            this.kill(ev);

            return true;
        }

        return false;
    }


    public bombCollision(b : Bomb, ev : GameEvent) : boolean {

        if (!this.isActive() || !b.doesExist()) 
            return false;

        let cx = this.pos.x;
        let cy = this.pos.y - this.spr.height/2 + 1;

        // Collision with the bomb
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

            ++ this.magicHitId;

            // TODO: Reduce damage first
            this.kill(ev);

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

            dir = Vector2.normalize(new Vector2(this.pos.x - e.pos.x, this.pos.y - e.pos.y));

            this.pos.x += dir.x * dist / 2;
            this.pos.y += dir.y * dist / 2;

            e.pos.x -= dir.x * dist / 2;
            e.pos.y -= dir.y * dist / 2;

            return true;
        }
        return false;
    }

}
