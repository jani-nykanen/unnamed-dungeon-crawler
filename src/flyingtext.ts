/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


enum FlyingTextType {

    PlayerDamage = 0,
    EnemyDamage = 1
}


const FLYING_TEXT_MOVE_TIME = 16;
const FLYING_TEXT_WAIT_TIME = 30;


// Flying text does not take any collisions,
// but it needs to extend CollisionObject so
// we may use ObjectGenerator. Good design, I say!
abstract class FlyingText extends CollisionObject {


    protected message : string;

    private moveTimer : number;
    private waitTimer : number;


    constructor() {

        super(0, 0);
        this.exist = false;
        this.message = "";
        this.waitTimer = 0;
        this.moveTimer = 0;

        this.friction = new Vector2(0.1, 0.1);

        this.inCamera = true;
    }


    protected updateLogic(ev : GameEvent) {

        if (this.moveTimer > 0) {

            if ((this.moveTimer -= ev.step) <= 0) {

                this.target.zeros();
                // TODO: Zero speed?
            }
        }
        else {

            if ((this.waitTimer -= ev.step) <= 0) {

                this.exist = false;
            }
        }
    }


    public spawn(id : number, x : number, y : number, sx : number, sy : number) {

        this.setText(id);

        this.waitTimer = FLYING_TEXT_WAIT_TIME;
        this.moveTimer = FLYING_TEXT_MOVE_TIME;

        this.pos = new Vector2(x, y);
        this.speed = new Vector2(sx, sy);
        this.target = this.speed.clone();

        this.exist = true;
    }


    public draw(c : Canvas) {

        if (!this.exist) return;

        c.drawText(c.getBitmap("fontSmall"), this.message,
            Math.round(this.pos.x), Math.round(this.pos.y-4), 0, 0, true);
    }


    abstract setText(value : number) : void;
}


class PlayerDamageText extends FlyingText {


    public setText(value : number) {

        this.message = "-" + String(value);
    }
}
