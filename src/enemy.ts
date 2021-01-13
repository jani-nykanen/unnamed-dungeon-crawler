/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


abstract class Enemy extends CollisionObject {


    private id : number;
    private swordHitId : number;
    private magicHitId : number;

    private flip : Flip;

    
    constructor(x : number, y : number, id : number) {

        super(x, y);

        this.spr = new Sprite(16, 16);
        this.id = id;

        this.swordHitId = -1;
        this.magicHitId = -1;

        this.flip = Flip.None;
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

        let px = Math.round(this.pos.x);
        let py = Math.round(this.pos.y);

        let xoff = (this.center.x + this.spr.width/2);
        let yoff = (this.center.y + this.spr.height/2);

        c.drawSprite(this.spr, c.getBitmap("enemy"),
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
