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

    
    constructor(x : number, y : number, row : number) {

        super(x, y);

        this.spr = new Sprite(16, 16);
        this.spr.setFrame(0, row);

        this.swordHitId = -1;
        this.magicHitId = -1;

        this.flip = Flip.None;
        this.shadowType = 0;

        this.friction = new Vector2(0.1, 0.1);
    }


    public isActive() : boolean {

        return this.inCamera && this.exist && !this.dying;
    }


    protected updateAI(ev : GameEvent) {}
    protected playerEvent(pl : Player, ev : GameEvent) {}


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


    public playerCollision(pl : Player, ev : GameEvent) : boolean {

        if (!this.isActive()) 
            return false;

        this.playerEvent(pl, ev);

        // TODO 1: Sword collision
        // TODO 2: Player collision (if no sword collision)

        return false;
    }

}
