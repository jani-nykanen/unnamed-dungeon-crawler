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
    private preservedTiles : Array<boolean>;

    private rooms : Array<Room>;
    private leaves : ObjectGenerator<Leaf>;

    private sprWater : Sprite;
    private waterPos : number;

    private roomCountX : number;
    private roomCountY : number;
    private startPos : Vector2;


    constructor(roomCountX : number, roomCountY : number, cam : Camera, ev : GameEvent) {

        this.collisionMap = ev.getTilemap("collisions");

        this.width = ROOM_WIDTH * roomCountX;
        this.height = ROOM_HEIGHT * roomCountY;

        this.roomCountX = roomCountX;
        this.roomCountY = roomCountY;

        this.baseLayer = new Array<number> (this.width * this.height);

        let baseRoom = ev.getTilemap("baseRoom");
        let roomMap = new RoomMap(roomCountX, roomCountY);
        this.rooms = roomMap.cloneRoomArray();

        this.startPos = roomMap.getStartPos();
        cam.setPos(this.startPos.x, this.startPos.y);
        
        let wallData : Tilemap;
        let roomData : Tilemap;
        for (let y = 0; y < roomCountY; ++ y) {

            for (let x = 0; x < roomCountX; ++ x) {

                if (x == this.startPos.x && y == this.startPos.y) {
                    
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
    
        this.leaves = new ObjectGenerator<Leaf> (Leaf);
        this.sprWater = new Sprite(16, 16);
        this.waterPos = 0;

        this.computePreservedTiles();
    }


    private isTileFree(x : number, y : number) : boolean {

        let noCollision = this.getTile(x, y) <= 0 ||
            this.collisionMap.getIndexedTile(0, this.getTile(x, y)-1) <= 0;

        let modx = x % ROOM_WIDTH;
        let mody = y % ROOM_HEIGHT;

        let noDoor = 
            // Vertical doors
            !(modx >= 4 && modx <= 5 && (mody < 2 || mody >= ROOM_HEIGHT-2)) &&
            // Horizontal doors
            !(mody >= 3 && mody <= 4 && (modx < 2 || modx >= ROOM_WIDTH-2));

        return noCollision && noDoor;
    }


    private computePreservedTiles() {

        this.preservedTiles = new Array<boolean> (this.width * this.height);

        for (let y = 0; y < this.height; ++ y) {

            for (let x = 0; x < this.width; ++ x) {

                this.preservedTiles[y * this.width + x] = !this.isTileFree(x, y);
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


    public update(cam : Camera, ev : GameEvent) {

        const WATER_ANIM_SPEED = 20;
        const WATER_SPEED = 0.1;

        this.sprWater.animate(0, 0, 3, WATER_ANIM_SPEED, ev.step);
        this.leaves.update(cam, ev);

        this.waterPos = (this.waterPos + WATER_SPEED * ev.step) % 16;
    }


    public drawBackground(c : Canvas, cam : Camera) {

        let shiftx = -cam.getWorldPos().x % 16;
        let shifty = -cam.getWorldPos().y % 16;

        let bmp = c.getBitmap("tileset");

        let pos = this.waterPos | 0;

        for (let y = -1; y < ROOM_HEIGHT+2; ++ y) {

            for (let x = -1; x < ROOM_WIDTH+2; ++ x) {

                c.drawBitmapRegion(bmp, 
                    48 + this.sprWater.getColumn()*16, 96, 
                    16, 16, 
                    x*16 + shiftx - pos, 
                    y*16 + shifty + pos);
            }
        }
    }


    public draw(c : Canvas, cam : Camera) {

        const OMIT = [114];

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
                if (tid <= 0 || OMIT.includes(tid)) continue;

                -- tid;

                sx = tid % 16;
                sy = (tid / 16) | 0;

                c.drawBitmapRegion(bmp, 
                    sx*16, sy*16, 16, 16,
                    x*16, y*16);
            }
        }
    }


    public pushLeavesToDrawBuffer(buffer : Array<GameObject>) {

        this.leaves.pushObjectsToArray(buffer);
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


    private spawnLeaves(x : number, y : number, count : number, id = 0) {

        const MAX_SPEED = 1.5;
        const MIN_SPEED = 0.5;
        const GRAVITY_BONUS = -1.0;
        const H_BONUS = 1.25;

        let angle = 0;
        let angleStep = Math.PI * 2 / count;
        let sx, sy : number;
        let speed : number;

        for (let i = 0; i < count; ++ i) {

            speed = Math.random() * (MAX_SPEED - MIN_SPEED) + MIN_SPEED;
            angle = angleStep * i;
            sx = Math.cos(angle) * speed * H_BONUS;
            sy = Math.sin(angle) * speed + GRAVITY_BONUS;

            this.leaves.next().spawn(id, x, y, sx, sy);
        }
    }


    private handleWaterHurtCollision(o : CollisionObject, id : number,
        x : number, y : number, ev : GameEvent) {

        const BASE_HURT_DAMAGE = 2;
        const START_X = [4, 0, 0, 4, 0, 0, 4, 0, 0, 0, 4];
        const START_Y = [4, 4, 4, 0, 0, 0, 0, 0, 0, 4, 0];
        const WIDTH = [12, 16, 12, 12, 16, 12, 12, 16, 12, 16, 12];
        const HEIGHT = [12, 12, 12, 16, 16, 16, 12, 12, 12, 12, 16];

        if (o.doesAvoidWater()) {

            o.boxCollision(x*16 + START_X[id], y*16 + START_Y[id],
                WIDTH[id], HEIGHT[id], ev);
        }
        else {

            o.hurtCollision(x*16 + START_X[id], y*16 + START_Y[id],
                WIDTH[id], HEIGHT[id], BASE_HURT_DAMAGE, null, ev);
        }

    }


    private handleSpecialTileCollision(o : CollisionObject, 
        x : number, y : number, 
        colId : number, tid : number, ev : GameEvent) {
            
        const BUSH_OFFSET = 4;

        let t = colId - 16;

        // Water hurt collisions
        if (t >= 16 && t < 32) {

            this.handleWaterHurtCollision(o, t - 16, x, y, ev);
            return;
        }

        switch (t) {

        // Bush or rock
        case 0:
        case 1:

            if (o.attackCollisionCheck(
                x*16 + BUSH_OFFSET, y*16 + BUSH_OFFSET, 
                16 - BUSH_OFFSET*2, 16 - BUSH_OFFSET*2, t)) {

                this.baseLayer[y * this.width + x] -= 16;
                this.spawnLeaves(x*16 + 8, y*16 + 8, 6, 
                    // TODO: Replace this...
                    clamp((tid / 32) | 0, 0, 1) + t*2);
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


    public objectCollisions(o : CollisionObject, ev : GameEvent) {

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
                    this.handleSpecialTileCollision(
                         o, x, y, colId-1, tid, ev);
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


    private genEnemiesToSingleRoom(enemies : EnemyContainer,
        dx : number, dy : number, 
        minCount : number, maxCount : number,
        flyingText : ObjectGenerator<FlyingText>) {

        let leftx = dx * ROOM_WIDTH + 1;
        let topy = dy * ROOM_HEIGHT + 1;
        let w = ROOM_WIDTH - 2;
        let h = ROOM_HEIGHT - 2;

        let px, py : number;
        let startx, starty : number;
        let count = minCount + ((Math.random() * ( (maxCount+1) - minCount)) | 0);

        for (let i = 0; i < count; ++ i) {

            startx = leftx + ((Math.random() * w) | 0);
            starty = topy + ((Math.random() * h) | 0);

            px = startx;
            py = starty;

            do {

                // If reserved, move to the next tile
                if (this.preservedTiles[py * this.width + px]) {

                    ++ px;
                    if (px >= leftx + w) {

                        px = leftx;
                        ++ py;
                        if (py >= topy + h)
                            py = topy;
                    }
                    continue;
                }
                enemies.spawnEnemy(0, px * 16 + 8, py * 16 + 8, flyingText);
                this.preservedTiles[py * this.width + px] = true;
                break;
            }
            while(px != startx || py != starty);
        }
    }


    public generateEnemies(enemies : EnemyContainer, 
        flyingText : ObjectGenerator<FlyingText>) {

        // TEMP
        const MIN_ENEMY_COUNT = 1;
        const MAX_ENEMY_COUNT = 3;

        for (let y = 0; y < this.roomCountY; ++ y) {

            for (let x = 0; x < this.roomCountX; ++ x) {

                if (x == this.startPos.x && 
                    y == this.startPos.y)
                    continue;
                
                this.genEnemiesToSingleRoom(enemies, x, y,
                    MIN_ENEMY_COUNT,
                    MAX_ENEMY_COUNT, flyingText);
            }
        }

    }
}
