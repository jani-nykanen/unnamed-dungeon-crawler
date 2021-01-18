/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


class ObjectManager {


    private player : Player;
    private bombs : ObjectGenerator<Bomb>;
    private plDmgText : ObjectGenerator<PlayerDamageText>;
    private enemies : EnemyContainer;

    private objectRenderBuffer : Array<GameObject>;


    constructor(status : PlayerStatus) {

        this.bombs = new ObjectGenerator<Bomb> (Bomb);
        this.plDmgText = new ObjectGenerator<PlayerDamageText> (PlayerDamageText);
        this.player = new Player(80, 72, this.bombs, this.plDmgText, status);
        
        this.enemies = new EnemyContainer(getEnemyList());

        this.objectRenderBuffer = new Array<GameObject> ();
    }


    public generateObjects(stage : Stage) {

        stage.generateEnemies(this.enemies);
    }


    public initialize(cam : Camera) {

        this.player.setInitialPosition(cam);
    }


    public cameraMovement(cam : Camera, ev : GameEvent) {

        this.enemies.initialCameraCheck(cam);
        this.player.cameraMovement(cam, ev);
    }


    public update(cam : Camera, stage : Stage, ev : GameEvent) {

        this.player.update(ev);
        this.player.cameraEvent(cam);
        stage.objectCollisions(this.player, ev);

        this.bombs.update(cam, ev);
        this.bombs.stageCollisions(stage, ev);

        this.enemies.update(cam, stage, this.player, this.bombs, ev);

        this.plDmgText.update(null, ev);
    }


    public draw(c : Canvas, stage : Stage) {


        // Push object to the array
        this.objectRenderBuffer.push(this.player);
        this.bombs.pushObjectsToArray(this.objectRenderBuffer);
        this.enemies.pushObjectsToArray(this.objectRenderBuffer);
        stage.pushLeavesToDrawBuffer(this.objectRenderBuffer);

        // NOTE: getCoordY should be faster than getPos().y, because no cloning
        // is involved
        let sortedArray = 
            this.objectRenderBuffer.sort(
            (a : GameObject, b : GameObject) => (a.getCoordY() - b.getCoordY()));

        for (let o of sortedArray) {

            o.draw(c);
        }

        // Draw things that overlay other objects
        this.bombs.postDraw(c);
        this.plDmgText.draw(c);

        // Clear the render buffer array
        // TODO: Check if there is a better, faster and/or more
        // memory-safe method available
        this.objectRenderBuffer.length = 0;
    }
}
