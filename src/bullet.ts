/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


class Bullet extends CollisionObject {


    constructor() {

        super(0, 0);

        this.exist = false;
        
    }


    public outsideCameraEvent() {

        this.exist = false;
        this.dying = false;
    }


    public spawn(x : number, y : number,
            speedx : number, speedy : number) {

        this.pos = new Vector2(x, y);
        this.speed = new Vector2(speedx, speedy);
        this.target = this.speed.clone();

        this.exist = true;
    }


    public draw(c : Canvas) {

        if (!this.inCamera) return;

        let px = Math.round(this.pos.x);
        let py = Math.round(this.pos.y);

        c.setFillColor(255, 0, 0);
        c.fillRect(px - 2, py - 2, 5, 5);
    }
}


class Magic extends Bullet {

    // ...
}
