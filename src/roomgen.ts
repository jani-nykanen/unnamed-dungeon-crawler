/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


const WALL_LEFT = 0;
const WALL_RIGHT = 1;
const WALL_DOWN = 2;
const WALL_UP = 3;


let getOppositeDirection = (dir : number) => [1, 0, 3, 2][dir];


class Room {


    private walls : Array<boolean>;


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


    public getWall(i : number) : boolean {

        if (i < 0 || i >= this.walls.length)
            return false;

        return this.walls[i];
    }


    public toggleWall(i : number, state : boolean) {

        if (i < 0 || i >= this.walls.length)
            return;

        this.walls[i] = state;
    }
}


class RoomMap {

    private rooms : Array<Room>;
    private startPos : Vector2;

    public readonly width : number;
    public readonly height : number;


    constructor(w : number, h : number) {

        const MAX_NTH_ITERATION = 1000;

        this.width = w;
        this.height = h;
        
        this.startPos = new Vector2(((Math.random() * w) | 0), h-1);

        this.rooms = this.initilWalls();
        this.genRandomWalls();

        // TODO: When you are sure this works,
        // do not cap iterations
        let i = 0;
        while (!this.fixWallMap()) {

            if (++ i == MAX_NTH_ITERATION)
                throw "Endless loop detected in the map generation!";
        }
    }


    private getRoom = (x : number, y : number) : Room => this.rooms[y * this.width + x]; 


    // First iteration: walls around the borders
    private initilWalls() : Array<Room> {

        let w = this.width;
        let h = this.height;

        return (new Array<Room> (w * h))
            .fill(null)
            .map( (a, i) => new Room( 
                i % w == 0, 
                i % w == w-1, 
                ((i / w) | 0) == h-1, 
                i < w));
    }


    // Second iteration: random walls
    private genRandomWalls() {

        let room : Room;

        for (let y = 0; y < this.height; ++ y) {

            for (let x = 0; x < this.width; ++ x) {

                room = this.getRoom(x, y);

                // Copy left and top walls
                if (x > 0) 
                    room.toggleWall(WALL_LEFT, 
                        this.getRoom(x-1, y).getWall(WALL_RIGHT));
                if (y > 0) 
                    room.toggleWall(WALL_UP, 
                        this.getRoom(x, y-1).getWall(WALL_DOWN));

                if (x < this.width-1)
                    room.toggleWall(WALL_RIGHT, Math.random() >= 0.5);
                if (y < this.height-1)
                    room.toggleWall(WALL_DOWN, Math.random() >= 0.5);
            }
        }
    }


    // Reach array: how many steps it takes to reach the
    // room
    private genReachArray() : [Array<boolean>, number] {

        let out = (new Array<boolean> (this.width * this.height)).fill(false);
        out[this.startPos.y * this.width + this.startPos.x] = true;

        let room : Room;
        let count = 0;

        let newRoomVisited = false;
        do {

            count = 0;
            newRoomVisited = false;
            for (let y = 0; y < this.height; ++ y) {

                for (let x = 0; x < this.width; ++ x) {

                    if (out[y * this.width + x]) {

                        ++ count;
                        continue;
                    }

                    room = this.getRoom(x, y);

                    if ((x < this.width-1 && !room.getWall(WALL_RIGHT) && out[y * this.width + (x+1)]) ||
                        (x > 0 && !room.getWall(WALL_LEFT) && out[y * this.width + (x-1)]) ||
                        (y < this.height-1 && !room.getWall(WALL_DOWN) && out[(y+1) * this.width + x]) ||
                        (y > 0 && !room.getWall(WALL_UP) && out[(y-1) * this.width + x])) {

                        out[y * this.width + x] = true;
                        newRoomVisited = true;
                    }
                }
            }

        } while(newRoomVisited);

        return [out, count];
    }   


    private checkAdjacentRoom(x : number, y : number, 
        dir : number, reached : Array<boolean>) : boolean {

        const DIR_X = [-1, 1, 0, 0];
        const DIR_Y = [0, 0, 1, -1];

        let dx = x + DIR_X[dir];
        let dy = y + DIR_Y[dir];

        // Out of bounds
        if (dx < 0 || dy < 0 || dx >= this.width || dy >= this.height)
            return false;

        // The adjacent room cannot be reached, either
        if (!reached[dy * this.width + dx])
            return false;

        this.getRoom(x, y).toggleWall(dir, false);
        this.getRoom(dx, dy).toggleWall(getOppositeDirection(dir), false);

        return true;
    }


    // Third (and n-th) iteration: make sure every 
    // room can be reached
    private fixWallMap() : boolean {

        let [reached, count] = this.genReachArray();
        console.log(count);
        if (count >= this.width*this.height) 
            return true;

        
        let startDir = (Math.random() * 4) | 0;
        let dir = 0;

        for (let y = 0; y < this.height; ++ y) {

            for (let x = 0; x < this.width; ++ x) {

                if (reached[y * this.width + x])
                    continue;

                dir = startDir;
                while(!this.checkAdjacentRoom(x, y, dir, reached)) {

                    dir = (dir + 1) % 4;
                    if (dir == startDir)
                        break;
                }
            }
        }

        return false;
    }


    public cloneRoomArray() : Array<Room> {

        return Array.from(this.rooms);
    }


    public getStartPos = () : Vector2 => this.startPos.clone();

}
