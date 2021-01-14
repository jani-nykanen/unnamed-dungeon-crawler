/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


class ObjectManager {


    private player : Player;
    private bullets : ObjectGenerator<Bullet>;

    private objectRenderBuffer : Array<GameObject>;


    constructor() {

        this.bullets = new ObjectGenerator<Bullet> (Bullet);
        this.player = new Player(80, 72, this.bullets);

        this.objectRenderBuffer = new Array<GameObject> ();
    }


    public initialize(cam : Camera) {

        this.player.setInitialPosition(cam);
    }


    public cameraMovement(cam : Camera, ev : GameEvent) {

        this.player.cameraMovement(cam, ev);
    }


    public update(cam : Camera, stage : Stage, ev : GameEvent) {

        this.player.update(ev);
        this.player.cameraEvent(cam);
        stage.objectCollisions(this.player, cam, ev);

        this.bullets.update(cam, ev);
        this.bullets.stageCollisions(stage, cam, ev);
    }


    public draw(c : Canvas) {

        // Push object to the array
        this.objectRenderBuffer.push(this.player);
        this.bullets.pushObjectsToArray(this.objectRenderBuffer);

        // NOTE: getCoordY should be faster than getPos().y, because no cloning
        // is involved
        this.objectRenderBuffer.sort(
            (a : GameObject, b : GameObject) => (a.getCoordY() - b.getCoordY()));
        for (let o of this.objectRenderBuffer) {

            o.draw(c);
        }

        // "Post"-draw objects
        this.bullets.postDraw(c);

        // Clear the render buffer array
        // TODO: Check if there is a better, faster and/or more
        // memory-safe method available
        this.objectRenderBuffer.splice(0, this.objectRenderBuffer.length);
    }
}
