/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


class Collectible extends GameObject {


    private id : number;


    constructor() {

        super(0, 0);
        this.exist = false;
    
        this.spr = new Sprite(16, 16);
        this.hitbox = new Vector2(8, 8);
    }


    public spawn(id : number, x : number, y : number) {

        this.pos = new Vector2(x, y);
        this.id = id;

        this.spr.setFrame(this.id, 0);

        this.exist = true;
    }


    public draw(c : Canvas) {

        if (!this.exist || !this.inCamera)
            return;

        c.drawSprite(this.spr, c.getBitmap("pickups"),
            this.pos.x - this.spr.width/2,
            this.pos.y - this.spr.height/2);
    }
}
