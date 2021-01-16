/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


const ROOM_WIDTH = 10;
const ROOM_HEIGHT = 8;

// For collisions
const COL_DOWN = 0b0001;
const COL_WALL_LEFT = 0b0010;
const COL_WALL_RIGHT = 0b0100;
const COL_UP = 0b1000;


const COLLISION_TABLE = [
        COL_DOWN,
        COL_WALL_RIGHT,
        COL_UP,
        COL_WALL_LEFT,
        COL_DOWN | COL_UP,
        COL_WALL_LEFT | COL_WALL_RIGHT,
        COL_WALL_LEFT | COL_DOWN,
        COL_WALL_RIGHT | COL_DOWN,
        COL_WALL_RIGHT | COL_UP,
        COL_WALL_LEFT | COL_UP,
        COL_WALL_LEFT | COL_DOWN | COL_WALL_RIGHT,
        COL_WALL_RIGHT | COL_DOWN | COL_UP,
        COL_WALL_LEFT | COL_UP | COL_WALL_RIGHT,
        COL_WALL_LEFT | COL_DOWN | COL_UP,
        COL_WALL_LEFT | COL_DOWN | COL_WALL_RIGHT | COL_UP,
];


class Stage {


    public readonly width : number;
    public readonly height : number;
    
    private baseLayer : Array<number>;
    private collisionMap : Tilemap;

    private rooms : Array<Room>;


    constructor(roomCountX : number, roomCountY : number, cam : Camera, ev : GameEvent) {

        this.collisionMap = ev.getTilemap("collisions");

        // Construct a base room
        // (temp stage size)
        this.width = ROOM_WIDTH * roomCountX;
        this.height = ROOM_HEIGHT * roomCountY;
        this.baseLayer = new Array<number> (this.width * this.height);

        let baseRoom = ev.getTilemap("baseRoom");
        let roomMap = new RoomMap(roomCountX, roomCountY);
        this.rooms = roomMap.cloneRoomArray();

        let startPos = roomMap.getStartPos();
        cam.setPos(startPos.x, startPos.y);
        
        let wallData : Tilemap;
        let roomData : Tilemap;
        for (let y = 0; y < roomCountY; ++ y) {

            for (let x = 0; x < roomCountX; ++ x) {

                if (x == startPos.x && y == startPos.y) {
                    
                    roomData = ev.getTilemap("startRoom");
                    wallData = roomData;
                }
                else {
                    
                    wallData = baseRoom;
                    roomData = ev.getTilemap("room" + String(1 + (Math.random() * ROOM_MAP_COUNT) | 0));
                }

                this.buildRoom(x, y, this.rooms[y * roomCountX + x], 
                    wallData, roomData);
            }
        }
    }


    private buildRoom(roomX : number, roomY : number, 
        r : Room, wallMap : Tilemap, decorationMap : Tilemap) {

        let dx = roomX * ROOM_WIDTH;
        let dy = roomY * ROOM_HEIGHT;
        
        let tid = 0;
        let m : Tilemap;

        for (let y = 0; y < ROOM_HEIGHT; ++ y) {

            for (let x = 0; x < ROOM_WIDTH; ++ x) {

                m = (x == 0 || y == 0 || 
                    x == ROOM_WIDTH-1 || y == ROOM_HEIGHT-1) ? 
                    wallMap: decorationMap;

                
                tid = r.getOverlayingTile(m, x, y);

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


    private handeTileCollision(o : CollisionObject, 
            x : number, y : number, 
            colId : number, ev : GameEvent) {

        let c = COLLISION_TABLE[colId];

        if ((c & COL_DOWN) == COL_DOWN) {

            o.verticalCollision(x*16, y*16, 16, 1, ev);
        }
        if ((c & COL_UP) == COL_UP) {

            o.verticalCollision(x*16, (y+1)*16, 16, -1, ev);
        }

        if ((c & COL_WALL_RIGHT) == COL_WALL_RIGHT) {

            o.horizontalCollision((x+1)*16, y*16, 16, -1, ev);
        }
        if ((c & COL_WALL_LEFT) == COL_WALL_LEFT) {

            o.horizontalCollision(x*16, y*16, 16, 1, ev);
        }
    }


    private handleSpecialTileCollision(o : CollisionObject, 
        x : number, y : number, 
        colId : number, ev : GameEvent) {
            
        const BUSH_OFFSET = 4;

        switch (colId-16) {

        case 0:

            if (o.attackCollisionCheck(
                x*16 + BUSH_OFFSET, y*16 + BUSH_OFFSET, 
                16 - BUSH_OFFSET*2, 16 - BUSH_OFFSET*2)) {

                this.baseLayer[y * this.width + x] -= 16;
            }
            else {

                // "Box collision"
                this.handeTileCollision(o, x, y, 14, ev);
            }
            break;

        default:
            break;
        }
    }


    public objectCollisions(o : CollisionObject, cam : Camera, ev : GameEvent) {

        const RADIUS = 2;

        if (!o.doesExist() || (!o.doesIgnoreDeathOnCollision() && o.isDying())) 
            return;

        let px = Math.floor(o.getPos().x / 16);
        let py = Math.floor(o.getPos().y / 16);

        let tid, colId;

        for (let y = py - RADIUS; y <= py + RADIUS; ++ y) {

            for (let x = px - RADIUS; x <= px + RADIUS; ++ x) {

                tid = this.getTile(x, y);
                if (tid <= 0) continue;

                colId = this.collisionMap.getIndexedTile(0, tid-1);
                if (colId <= 0) continue;

                if (colId <= 16)
                    this.handeTileCollision(o, x, y, colId-1, ev);
                else 
                    this.handleSpecialTileCollision(o, x, y, colId-1, ev);
            }
        }


        // TEMP
        /*
        let topLeft = cam.getWorldPos();
        o.verticalCollision(topLeft.x, topLeft.y + 128, 160, 1, ev);
        o.verticalCollision(topLeft.x, topLeft.y, 160, -1, ev);
        o.horizontalCollision(topLeft.x, topLeft.y, 128, -1, ev);
        o.horizontalCollision(topLeft.x + 160, topLeft.y, 128, 1, ev);
        */
    }
}
