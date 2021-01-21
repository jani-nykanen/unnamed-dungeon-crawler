/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


// A general function for determining which collectible
// to create
const determineGeneratedColletibleId = (p = 1.0) : number => {

    const PROB = [0.7, 0.2, 0.1];

    if (Math.random() > p) return -1;

    let v = Math.random() * 1.0;

    let q = PROB[0];
    for (let i = 1; i < PROB.length; ++ i) {

        if (v < q) {

            return i - 1;
        }
        q += PROB[i];
    }
    return PROB.length - 1;
}


// It's a collision object only because this way we may
// use ObjectGenerator
class Collectible extends CollisionObject {


    private id : number;


    constructor() {

        super(0, 0);
        this.exist = false;
    
        this.spr = new Sprite(16, 16);
        this.hitbox = new Vector2(10, 10);
    }


    protected outsideCameraEvent() {

        this.exist = false;
        this.dying = false;
    }


    public spawn(id : number, x : number, y : number) {

        this.pos = new Vector2(x, y);
        this.id = id;

        this.spr.setFrame(this.id, 0);

        this.exist = true;
    }


    public playerCollision(pl : Player, ev : GameEvent) : boolean {

        const HEALTH_RECOVERY = 2;

        if (!this.exist || !this.inCamera) 
            return;

        if (this.overlayObject(pl)) {

            this.exist = false;

            // Apply effect
            switch(this.id) {

            // Gem-stone
            case 0:

                pl.addGemStones(1);
                break;
            
            // Heart
            case 1:
                
                pl.recoverHealth(HEALTH_RECOVERY);
                break;

            // Bullet
            case 2:

                pl.addBullets(1);
                break;

            default:
                break;
            }

            return true;
        }
        return false;
    }


    public draw(c : Canvas) {

        if (!this.exist || !this.inCamera)
            return;

        c.drawSprite(this.spr, c.getBitmap("pickups"),
            this.pos.x - this.spr.width/2,
            this.pos.y - this.spr.height/2);
    }
}
