/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


class EnemyContainer {


    private objects : Array<Enemy>;
    private types : Array<Function>;


    constructor(types : Array<Function>) {

        this.objects = new Array<Enemy> ();
        this.types = Array.from(types);
    }


    public initialCameraCheck(cam : Camera) {

        for (let o of this.objects) {

            o.cameraCheck(cam);
        }
    }


    public spawnEnemy(type : number, x : number, y : number, 
        flyingText : ObjectGenerator<FlyingText>) {

        this.objects.push(new this.types[type].prototype.constructor(x, y, flyingText));
    }


    public update(cam : Camera, stage : Stage, pl : Player, 
        bullets : ObjectGenerator<Bullet>, ev : GameEvent) {

        for (let o of this.objects) {

            if (!o.doesExist())
                continue;

            o.cameraCheck(cam);
            if (!o.isInCamera())
                continue;

            stage.objectCollisions(o, ev);
            o.playerCollision(pl, ev);
            o.update(ev);

            if (!o.isDying()) {
                
                for (let e of this.objects) {

                    o.enemyToEnemyCollision(e);
                }

                bullets.applyBooleanEvent((a : any, ev : GameEvent) => o.bulletCollision(a, ev), ev);
            }
        }
    }


    public pushObjectsToArray(arr : Array<GameObject>) {

        for (let o of this.objects) {

            arr.push(o);
        }
    }
}
