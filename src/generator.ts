/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */



class ObjectGenerator<T extends SpawnableObject> {


    private objects : Array<T>;
    private typeT : Function;


    constructor(typeT : Function) {

        this.objects = new Array<T> ();
        this.typeT = typeT;
    }


    public spawn(x : number, y : number, sx : number, sy : number) {

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

        o.spawn(x, y, sx, sy);
    }


    public update(cam : Camera, ev : GameEvent) {

        for (let o of this.objects) {

            o.cameraCheck(cam);
            o.update(ev);
        }
    }


    public draw(c : Canvas) {

        for (let o of this.objects) {

            o.draw(c);
        }
    }


    public pushObjectsToArray(arr : Array<GameObject>) {

        for (let o of this.objects) {

            if (!o.doesExist) continue;

            arr.push(o);
        }
    }

}
