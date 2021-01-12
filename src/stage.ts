/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


const ROOM_WIDTH = 10;
const ROOM_HEIGHT = 8;


class Room {

    public readonly walls : Array<boolean>;


    constructor(left : boolean, right : boolean, down : boolean, up : boolean) {

        this.walls = [left, right, down, up];
    }


    public getOverlayingTile(tmap : Tilemap, x : number, y : number) : number {

        let tid = 0;
        for (let i = 3; i >= 0 && tid == 0; -- i) {

            if (this.walls[i]) {

                tid = tmap.getTile(i+1, x, y);
                if (tid != 0)
                    return tid;
            }
        }

        return tmap.getTile(0, x, y);
    }
}


class Stage {


    public readonly width : number;
    public readonly height : number;
    
    private baseLayer : Array<number>;
    private baseRoom : Tilemap;

    private rooms : Array<Room>;


    constructor(roomCountX : number, roomCountY : number, ev : GameEvent) {

        this.baseRoom = ev.getTilemap("baseRoom");

        // Construct a base room
        // (temp stage size)
        this.width = ROOM_WIDTH * roomCountX;
        this.height = ROOM_HEIGHT * roomCountY;
        this.baseLayer = new Array<number> (this.width * this.height);

        this.rooms = (new Array<Room> (roomCountX * roomCountY))
            .fill(null)
            .map( (a, i) => new Room( 
                i % roomCountX == 0, 
                i % roomCountX == roomCountX-1, 
                ((i / roomCountX) | 0) == roomCountY-1, 
                i < roomCountX));

        for (let y = 0; y < roomCountY; ++ y) {

            for (let x = 0; x < roomCountX; ++ x) {

                this.buildRoom(x, y, this.rooms[y * roomCountX + x]);
            }
        }
    }


    private buildRoom(roomX : number, roomY : number, r : Room) {

        let dx = roomX * ROOM_WIDTH;
        let dy = roomY * ROOM_HEIGHT;
        
        let tid = 0;

        for (let y = 0; y < ROOM_HEIGHT; ++ y) {

            for (let x = 0; x < ROOM_WIDTH; ++ x) {

                tid = r.getOverlayingTile(this.baseRoom, x, y);

                this.baseLayer[(dy + y) * this.width + (dx + x)] = tid;
            }
        }
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

        let endx = startx + ROOM_WIDTH + 2;
        let endy = starty + ROOM_HEIGHT + 2;

        for (let y = starty; y <= endy; ++ y) {

            for (let x = startx; x <= endx; ++ x) {

                tid = this.getTile(x, y);
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

        o.verticalCollision(topLeft.x, topLeft.y + 128, 160, 1, ev);
        o.verticalCollision(topLeft.x, topLeft.y, 160, -1, ev)

        o.horizontalCollision(topLeft.x, topLeft.y, 128, -1, ev)
        o.horizontalCollision(topLeft.x + 160, topLeft.y, 128, 1, ev)
    }
}
