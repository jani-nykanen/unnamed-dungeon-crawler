/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


class Stage {


    public readonly width : number;
    public readonly height : number;
    
    private baseLayer : Array<number>;


    constructor(ev : GameEvent) {

        let baseRoom = ev.getTilemap("baseRoom");

        // Construct a base room
        // (temp stage size)
        this.width = 10;
        this.height = 8;
        this.baseLayer = baseRoom.cloneLayer(0);
    }


    private getTile(x : number, y : number) : number {

        if (x < 0 || y < 0 || x >= this.width || y >= this.height)
            return -1;

        return this.baseLayer[y * this.width + x];
    }


    public update(ev : GameEvent) {

        // ...
    }


    public draw(c : Canvas, cam : Camera) {

        let tid;
        let sx, sy;

        let bmp = c.getBitmap("tileset");

        let startx = ((cam.getWorldPos().x / 16) | 0) - 1;
        let starty = ((cam.getWorldPos().y / 16) | 0) - 1;

        let endx = startx + ((cam.width / 16) | 0) + 2;
        let endy = starty + ((cam.height / 16) | 0) + 2;

        for (let y = starty; y <= endy; ++ y) {

            for (let x = startx; x <= endx; ++ x) {

                tid = this.getTile(negMod(x, this.width), negMod(y, this.height));
                if (tid <= 0) continue;

                -- tid;

                sx = tid % 16;
                sy = (tid / 16) | 0;

                c.drawBitmapRegion(bmp, 
                    sx*16, sy*16, 16, 16,
                    x*16, y*16);
            }
        }
    }


    public objectCollisions(o : CollisionObject, cam : Camera, ev : GameEvent) {

        if (!o.doesExist() || o.isDying()) return;

        let topLeft = cam.getWorldPos();

        o.wallCollision(topLeft.x, topLeft.y + 128, topLeft.x + 160, topLeft.y + 128, ev);
        o.wallCollision(topLeft.x + 160, topLeft.y, topLeft.x, topLeft.y, ev)
        o.wallCollision(topLeft.x, topLeft.y, topLeft.x, topLeft.y + 128, ev)
        o.wallCollision(topLeft.x + 160, topLeft.y + 128, topLeft.x + 160, topLeft.y, ev)
    }
}
