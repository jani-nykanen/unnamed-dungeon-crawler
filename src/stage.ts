/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


class Stage {


    constructor(ev : GameEvent) {

        // ...
    }


    public update(ev : GameEvent) {

        // ...
    }


    public draw(c : Canvas, cam : Camera) {

        // ...
    }


    public objectCollisions(o : CollisionObject, cam : Camera, ev : GameEvent) {

        if (!o.doesExist() || o.isDying()) return;

        o.wallCollision(0, 128, 160, 128, ev);
        o.wallCollision(160, 0, 0, 0, ev)
        o.wallCollision(0, 0, 0, 128, ev)
        o.wallCollision(160, 128, 160, 0, ev)
    }
}
