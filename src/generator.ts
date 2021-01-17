/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


class ObjectGenerator<T extends CollisionObject> {


    private objects : Array<T>;
    private typeT : Function;


    constructor(typeT : Function) {

        this.objects = new Array<T> ();
        this.typeT = typeT;
    }


    public spawn(id : number,
        x : number, y : number, sx : number, sy : number) {

        let o = null;
        for (let e of this.objects) {

            if (!e.doesExist()) {

                o = e;
                break;
            }
        }
        if (o == null) {

            this.objects.push(new this.typeT.prototype.constructor());
            o = this.objects[this.objects.length-1];
        }

        o.spawn(id, x, y, sx, sy);
    }


    public update(cam : Camera, ev : GameEvent) {

        for (let o of this.objects) {

            o.cameraCheck(cam);
            o.update(ev);
        }
    }


    public stageCollisions(stage : Stage, cam : Camera, ev : GameEvent) {

        for (let o of this.objects) {

            stage.objectCollisions(o, cam, ev);
        }
    }


    public draw(c : Canvas) {

        for (let o of this.objects) {

            o.draw(c);
        }
    }


    public postDraw(c : Canvas) {

        for (let o of this.objects) {

            o.postDraw(c);
        }
    }


    public pushObjectsToArray(arr : Array<GameObject>) {

        for (let o of this.objects) {

            if (!o.doesExist() || !o.isInCamera()) 
                continue;

            arr.push(o);
        }
    }

}
