/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


class Camera {


    // Pos in unit scale
    private pos : Vector2;
    private target : Vector2;
    // Pos in the world scale
    private worldPos : Vector2;

    private moving : boolean;
    private moveTimer : number;
    private moveSpeed : number;

    public readonly width : number;
    public readonly height : number;


    constructor(x : number, y : number, width : number, height : number) {

        this.width = width;
        this.height = height;

        this.pos = new Vector2(x, y);
        this.target = this.pos.clone();

        this.worldPos = new Vector2(x * width, y * height);

        this.moving = false;
        this.moveTimer = 0;
        this.moveSpeed = 1;
    }


    public setPos(x : number, y : number) {

        this.pos = new Vector2(x, y);
        this.target = this.pos.clone();
        this.worldPos = new Vector2(x * this.width, y * this.height);
    }


    public move(dx : number, dy : number, speed : number) : boolean {

        if (this.moving) return false;

        this.moveTimer = 1.0;
        this.moveSpeed = speed;

        this.target.x = (this.pos.x + dx) | 0;
        this.target.y = (this.pos.y + dy) | 0;

        this.moving = true;

        return true;
    }


    public update(ev : GameEvent) {

        if (!this.moving) return;

        if ((this.moveTimer -= this.moveSpeed * ev.step) <= 0) {

            this.moveTimer = 0;
            this.pos = this.target.clone();
            this.worldPos = new Vector2(
                this.pos.x * this.width, 
                this.pos.y * this.height);

            this.moving = false;

            return;
        }

        // Compute world position
        let t = this.moveTimer;

        this.worldPos.x = t * this.pos.x + (1 - t) * this.target.x;
        this.worldPos.y = t * this.pos.y + (1 - t) * this.target.y;

        this.worldPos.x *= this.width;
        this.worldPos.y *= this.height;
    }


    public use(c : Canvas) {

        c.moveTo(
            -Math.round(this.worldPos.x), 
            -Math.round(this.worldPos.y));
    }


    public getPos = () => this.pos.clone();;
    public getWorldPos = () => this.worldPos.clone();
    public isMoving = () => this.moving;
    public getSpeed = () => this.moveSpeed;
    public getDirection = () => (new Vector2(this.target.x - this.pos.x, this.target.y - this.pos.y)).normalize();
}
