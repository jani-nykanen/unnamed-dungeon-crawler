/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


const WALL_LEFT = 0;
const WALL_RIGHT = 1;
const WALL_DOWN = 2;
const WALL_UP = 3;


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

        this.width = w;
        this.height = h;

        this.rooms = this.initilWalls();
        this.genRandomWalls();

        this.startPos = new Vector2(((Math.random() * w) | 0), h-1);
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
    private genReachArray() : Array<boolean> {

        let out = (new Array<boolean> (this.width * this.height)).fill(false);
        out[this.startPos.y * this.width + this.startPos.x] = true;

        let room : Room;

        let newRoomVisited = false;
        do {

            newRoomVisited = false;
            for (let y = 0; y < this.height; ++ y) {

                for (let x = 0; x < this.width; ++ x) {

                    if (out[y * this.width + x])
                        continue;

                    room = this.getRoom(x, y);

                    if ((x < this.width-1 && !room.getWall(WALL_RIGHT)) ||
                        (x > 0 && !room.getWall(WALL_LEFT)) ||
                        (y < this.height-1 && !room.getWall(WALL_DOWN)) ||
                        (y > 0 && !room.getWall(WALL_UP))) {

                        out[y * this.width + x] = true;
                        newRoomVisited = true;
                    }
                }
            }

        } while(newRoomVisited);

        return out;
    }   


    public cloneRoomArray() : Array<Room> {

        return Array.from(this.rooms);
    }


    public getStartPos = () : Vector2 => this.startPos.clone();

}
