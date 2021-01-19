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


    public next() : T {

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

        return o;
    }


    public update(cam : Camera, ev : GameEvent) {

        for (let o of this.objects) {

            if (cam != null)
                o.cameraCheck(cam);
                
            o.update(ev);
        }
    }


    public stageCollisions(stage : Stage, ev : GameEvent) {

        for (let o of this.objects) {

            stage.objectCollisions(o, ev);
        }
    }


    public applyBooleanEvent(f : (self : T, ev : GameEvent) => boolean, 
        ev : GameEvent) : boolean {

        let ret = false;
        for (let o of this.objects) {

            ret = ret || f(o, ev);
        }
        return ret;
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
