/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


class ObjectManager {


    private player : Player;
    private bullets : ObjectGenerator<Bullet>;
    private magic : ObjectGenerator<Magic>;

    private objectRenderBuffer : Array<GameObject>;


    constructor() {

        this.magic = new ObjectGenerator<Magic> (Magic);
        this.player = new Player(80, 72, this.magic);
        this.bullets = new ObjectGenerator<Bullet> (Bullet);

        this.objectRenderBuffer = new Array<GameObject> ();
    }


    private pushObjectToRenderBuffer(o : GameObject) {

        this.objectRenderBuffer.push(o);
    }


    public update(cam : Camera, ev : GameEvent) {

        this.player.update(ev);
        this.bullets.update(cam, ev);
        this.magic.update(cam, ev);
    }


    public draw(c : Canvas) {

        // Push object to the array
        this.objectRenderBuffer.push(this.player);
        this.bullets.pushObjectsToArray(this.objectRenderBuffer);
        this.magic.pushObjectsToArray(this.objectRenderBuffer);

        // NOTE: getCoordY should be faster than getPos().y, because no cloning
        // is involved
        this.objectRenderBuffer.sort(
            (a : GameObject, b : GameObject) => (a.getCoordY() - b.getCoordY()));
        for (let o of this.objectRenderBuffer) {

            o.draw(c);
        }

        // Clear the render buffer array
        // TODO: Check if there is a better, faster and/or more
        // memory-safe method available
        this.objectRenderBuffer.splice(0, this.objectRenderBuffer.length);
    }
}
