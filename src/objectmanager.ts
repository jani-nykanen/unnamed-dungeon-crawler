/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


class ObjectManager {


    private player : Player;
    private bullets : ObjectGenerator<Bullet>;
    private plDmgText : ObjectGenerator<PlayerDamageText>;

    private objectRenderBuffer : Array<GameObject>;


    constructor(status : PlayerStatus) {

        this.bullets = new ObjectGenerator<Bullet> (Bullet);
        this.plDmgText = new ObjectGenerator<PlayerDamageText> (PlayerDamageText);
        this.player = new Player(80, 72, this.bullets, this.plDmgText, status);

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

        this.plDmgText.update(null, ev);
    }


    public draw(c : Canvas, stage : Stage) {


        // Push object to the array
        this.objectRenderBuffer.push(this.player);
        this.bullets.pushObjectsToArray(this.objectRenderBuffer);
        stage.pushLeavesToDrawBuffer(this.objectRenderBuffer);

        // NOTE: getCoordY should be faster than getPos().y, because no cloning
        // is involved
        let sortedArray = 
            this.objectRenderBuffer.sort(
            (a : GameObject, b : GameObject) => (a.getCoordY() - b.getCoordY()));

        for (let o of sortedArray) {

            o.draw(c);
        }

        // "Post"-draw objects
        this.bullets.postDraw(c);

        this.plDmgText.draw(c);

        // Clear the render buffer array
        // TODO: Check if there is a better, faster and/or more
        // memory-safe method available
        this.objectRenderBuffer.length = 0;
    }
}
