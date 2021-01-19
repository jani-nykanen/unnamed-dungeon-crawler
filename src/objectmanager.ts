/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


class ObjectManager {


    private player : Player;
    private bullets : ObjectGenerator<Bullet>;
    private flyingText : ObjectGenerator<FlyingText>;
    private collectibles : ObjectGenerator<Collectible>;
    private enemies : EnemyContainer;

    private objectRenderBuffer : Array<GameObject>;


    constructor(status : PlayerStatus) {

        this.bullets = new ObjectGenerator<Bullet> (Bullet);
        this.flyingText = new ObjectGenerator<FlyingText> (FlyingText);
        this.collectibles = new ObjectGenerator<Collectible> (Collectible);
        this.player = new Player(80, 72, this.bullets, this.flyingText, status);
        
        this.enemies = new EnemyContainer(getEnemyList());

        this.objectRenderBuffer = new Array<GameObject> ();
    }


    public generateObjects(stage : Stage) {

        stage.generateEnemies(this.enemies, 
            this.flyingText, this.collectibles);

        stage.passCollectibleGenerator(this.collectibles);
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
        stage.objectCollisions(this.player, cam, ev);

        this.bullets.update(cam, ev);
        this.bullets.stageCollisions(stage, cam, ev);

        this.enemies.update(cam, stage, this.player, this.bullets, ev);

        this.collectibles.update(cam, ev);
        this.collectibles.applyBooleanEvent(
            (c : Collectible, ev : GameEvent) => c.playerCollision(this.player, ev), ev);

        this.flyingText.update(null, ev);
    }


    public draw(c : Canvas, stage : Stage) {

        this.collectibles.draw(c);

        // Push object to the array
        this.objectRenderBuffer.push(this.player);
        this.bullets.pushObjectsToArray(this.objectRenderBuffer);
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
        this.bullets.postDraw(c);
        this.flyingText.draw(c);

        // Clear the render buffer array
        // TODO: Check if there is a better, faster and/or more
        // memory-safe method available
        this.objectRenderBuffer.length = 0;
    }
}
