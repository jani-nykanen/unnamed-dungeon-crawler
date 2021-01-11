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

    public readonly width : number;
    public readonly height : number;


    constructor(x : number, y : number, width : number, height : number) {

        this.width = width;
        this.height = height;

        this.pos = new Vector2(x, y);
        this.target = this.pos.clone();

        this.worldPos = new Vector2(x * width, y * height);

        this.moving = false;
    }


    public update(ev : GameEvent) {

        // ...
    }


    public use(c : Canvas) {

        c.moveTo(-this.worldPos.x, -this.worldPos.y);
    }


    public getPos = () => this.pos.clone();;
    public getWorldPos = () => this.worldPos.clone();

}
