/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


const getEnemyList = () : Array<Function> => [
    Slime, Bat, Spider, Fly,
    Spook, Fungus, FatFungus, Apple,
];


class Slime extends Enemy {

    
    private dir : Vector2;


    constructor(x : number, y : number) {

        super(x, y, 1, 5);

        this.shadowType = 1;
        this.spr.setFrame((Math.random() * 4) | 0, this.spr.getRow());

        this.friction = new Vector2(0.0125, 0.0125);
        this.dir = new Vector2(0, 1);

        this.radius = 4;
        this.damage = 2;

        this.hitbox = new Vector2(6, 4);
        this.collisionBox = this.hitbox.clone();
        this.damageBox = new Vector2(10, 10);
    }


    protected updateAI(ev : GameEvent) {
        
        const ANIM_SPEED = 12;
        const RUSH_SPEED = 0.5;

        let oldFrame = this.spr.getColumn();
        this.spr.animate(this.spr.getRow(), 0, 3, ANIM_SPEED, ev.step);

        if (oldFrame == 0 && this.spr.getColumn() != oldFrame) {

            this.speed = Vector2.scalarMultiply(this.dir, RUSH_SPEED);
            this.flip = this.speed.x < 0 ? Flip.None : Flip.Horizontal;
        }   
    }


    protected playerEvent(pl : Player, ev : GameEvent) {

        this.dir = Vector2.direction(this.pos, pl.getPos());
    }


    protected wallCollisionEvent(dirx : number, diry : number, ev : GameEvent) {

        if (Math.abs(dirx) > 0)
            this.speed.x *= -1;

        if (Math.abs(diry) > 0)
            this.speed.y *= -1;
    }
}


class Bat extends Enemy {

    
    private dir : Vector2;


    constructor(x : number, y : number) {

        super(x, y, 2, 7);

        this.shadowType = 1;
        this.spr.setFrame((Math.random() * 4) | 0, this.spr.getRow());

        this.friction = new Vector2(0.025, 0.025);
        this.dir = new Vector2(0, 1);

        this.radius = 4;
        this.damage = 2;

        this.hitbox = new Vector2(6, 4);
        this.collisionBox = this.hitbox.clone();
        this.damageBox = new Vector2(10, 10);

        this.avoidWater = false;
    }


    protected updateAI(ev : GameEvent) {
        
        const ANIM_SPEED = 8;
        const MOVE_SPEED = 0.25;

        this.spr.animate(this.spr.getRow(), 0, 3, ANIM_SPEED, ev.step);

        this.target = Vector2.scalarMultiply(this.dir, MOVE_SPEED);
    }


    protected playerEvent(pl : Player, ev : GameEvent) {

        this.dir = Vector2.direction(this.pos, pl.getPos());
    }

}


class Spider extends Enemy {

    
    private dir : Vector2;
    private moveTimer : number;
    private moving : boolean;


    static MOVE_TIME = 60;


    constructor(x : number, y : number) {

        super(x, y, 3, 10);

        this.shadowType = 0;
        this.spr.setFrame(0, this.spr.getRow());

        this.mass = 1.5;
        this.friction = new Vector2(0.05, 0.05);
        this.dir = new Vector2(0, 1);

        this.radius = 5;
        this.damage = 3;

        this.hitbox = new Vector2(8, 6);
        this.collisionBox = this.hitbox.clone();
        this.damageBox = new Vector2(12, 10);

        this.moveTimer = Spider.MOVE_TIME/2 + ((Math.random() * Spider.MOVE_TIME/2) | 0);
        this.moving = false;
    }


    protected updateAI(ev : GameEvent) {
        
        const ANIM_SPEED = 6;
        const MOVE_SPEED = 0.75;

        let angle : number;
        if ((this.moveTimer -= ev.step) <= 0) {

            if (!this.moving) {

                angle = Math.random() * Math.PI*2;
                this.dir = new Vector2(Math.cos(angle), Math.sin(angle));
                this.target = Vector2.scalarMultiply(this.dir, MOVE_SPEED);
            }
            this.moving = !this.moving;

            this.moveTimer += Spider.MOVE_TIME;
        }

        if (this.moving) {

            this.flip = this.target.x < 0 ? Flip.None : Flip.Horizontal;

            this.spr.animate(this.spr.getRow(), 0, 3, ANIM_SPEED, ev.step);
        }
        else {

            this.target.zeros();
            this.spr.setFrame(0, this.spr.getRow());
        }
    }


    protected wallCollisionEvent(dirx : number, diry : number, ev : GameEvent) {

        if (Math.abs(dirx) > 0) {

            this.target.x *= -1;
            this.speed.x *= -1;
        }

        if (Math.abs(diry) > 0) {
         
            this.target.y *= -1;
            this.speed.y *= -1;
        }
    }
}


class Fly extends Enemy {

    
    private dir : Vector2;
    private moveTimer : number;


    static WAIT_TIME = 120;


    constructor(x : number, y : number) {

        super(x, y, 4, 7);

        this.shadowType = 1;
        this.spr.setFrame(0, this.spr.getRow());

        this.mass = 1.0;
        this.friction = new Vector2(0.0125, 0.0125);
        this.dir = new Vector2(0, 1);

        this.radius = 5;
        this.damage = 2;

        this.hitbox = new Vector2(6, 3);
        this.collisionBox = this.hitbox.clone();
        this.damageBox = new Vector2(10, 10);

        this.moveTimer = Fly.WAIT_TIME/2 + ((Math.random() * Fly.WAIT_TIME/2) | 0);

        this.avoidWater = false;

        this.bounceFactor = 1.0;
    }


    protected updateAI(ev : GameEvent) {
        
        const ANIM_SPEED = 8;
        const ANIM_SPEED_MOD = 4;
        const RUSH_SPEED = 1.25;

        this.target.zeros();

        if ((this.moveTimer -= ev.step) <= 0) {

            this.speed = Vector2.scalarMultiply(this.dir, RUSH_SPEED);
            this.moveTimer += Fly.WAIT_TIME;
        }

        this.spr.animate(this.spr.getRow(), 0, 3, 
            ANIM_SPEED - this.speed.length() * ANIM_SPEED_MOD, 
            ev.step);
    }


    protected playerEvent(pl : Player, ev : GameEvent) {

        this.dir = Vector2.direction(this.pos, pl.getPos());
    }

}



class Spook extends Enemy {

    
    private dir : Vector2;
    private angleDif : number;


    constructor(x : number, y : number) {

        super(x, y, 5, 10);

        this.shadowType = 1;
        this.spr.setFrame((Math.random() * 4) | 0, this.spr.getRow());

        this.friction = new Vector2(0.025, 0.025);
        this.dir = new Vector2(0, 1);

        this.radius = 4;
        this.damage = 3;

        this.hitbox = new Vector2(6, 4);
        this.collisionBox = this.hitbox.clone();
        this.damageBox = new Vector2(10, 10);

        this.avoidWater = false;
        this.disableCollisions = true;

        this.angleDif = Math.random() * Math.PI * 2;
    }


    protected updateAI(ev : GameEvent) {
        
        const ANIM_SPEED = 10;
        const MOVE_SPEED = 0.5;
        const ANGLE_DIF_SPEED = 0.025;

        this.spr.animate(this.spr.getRow(), 0, 3, ANIM_SPEED, ev.step);
        this.flip = this.speed.x < 0 ? Flip.None : Flip.Horizontal;

        this.angleDif = (this.angleDif + ANGLE_DIF_SPEED * ev.step) % 
			(Math.PI * 2);

        this.target = Vector2.scalarMultiply(this.dir, MOVE_SPEED);
    }


    protected playerEvent(pl : Player, ev : GameEvent) {

        const ORBIT_RADIUS = 32.0;

		let px = pl.getPos().x + Math.cos(this.angleDif) * ORBIT_RADIUS;
		let py = pl.getPos().y + Math.sin(this.angleDif) * ORBIT_RADIUS;

		this.dir = (new Vector2(
				px - this.pos.x, 
				py - this.pos.y))
			.normalize(true);
        // this.dir = Vector2.direction(this.pos, pl.getPos());
    }

}



class CoreMushroom extends Enemy {


    private bulletCount : number;
    private bulletId : number;
    private bulletAngle : number;

    private dir : Vector2;
    private shootTimer : number;
    private shooting : boolean;
    private shootTime : number;


    constructor(x : number, y : number, row : number, 
        bulletCount : number, bulletId : number, bulletAngle : number,
        shootTime : number, health : number) {

        super(x, y, row, health);

        this.bulletCount = bulletCount;
        this.bulletAngle = bulletAngle;
        this.bulletId = bulletId;
        this.shootTime = shootTime;

        this.shadowType = 1;
        this.spr.setFrame(0, this.spr.getRow());

        this.friction = new Vector2(0.05, 0.05);
        this.dir = new Vector2(0, 1);

        this.radius = 4;
        this.damage = 2;

        this.hitbox = new Vector2(6, 4);
        this.collisionBox = this.hitbox.clone();
        this.damageBox = new Vector2(10, 10);

        this.shootTimer = this.shootTime/2 + Math.random() * this.shootTime/2;
        this.shooting = false;
    }


    private shootBullets(ev : GameEvent) {

        const BULLET_SPEED = 1.25;

        let startAngle = Math.atan2(this.dir.y, this.dir.x) - ((this.bulletCount / 2) | 0) * this.bulletAngle;
        let angle = startAngle;

        for (let i = 0; i < this.bulletCount; ++ i) {

            angle = startAngle + i * this.bulletAngle;

            this.shootBullet(this.bulletId, 2, this.pos.x, this.pos.y - 4, 
                BULLET_SPEED, new Vector2(Math.cos(angle), Math.sin(angle)));
        }
    }


    protected updateAI(ev : GameEvent) {
        
        const MOUTH_TIME = 20;

        if (!this.shooting) {

            this.flip = this.dir.x < 0 ? Flip.None : Flip.Horizontal;  
            if ((this.shootTimer -= ev.step) <= 0.0) {

                this.shooting = true;
                this.spr.setFrame(1, this.spr.getRow());
                
                this.shootBullets(ev);
            }
        }
        else {

            this.spr.animate(this.spr.getRow(), 1, 0, MOUTH_TIME, ev.step);
            if (this.spr.getColumn() == 0) {

                this.shootTimer += this.shootTime;
                this.shooting = false;
            }
        }
    }


    protected playerEvent(pl : Player, ev : GameEvent) {

        this.dir = Vector2.direction(this.pos, pl.getPos());
    }
}


class Fungus extends CoreMushroom {

    constructor(x : number, y : number) {

        super(x, y, 6, 1, 1, 0, 100, 10);
    }
}



class FatFungus extends CoreMushroom {

    constructor(x : number, y : number) {

        super(x, y, 7, 3, 2, Math.PI/6.0, 100, 12);

        this.shadowType = 0;
    }
}


class Apple extends Enemy {

    
    private dir : Vector2;
    private waveTimer : number;


    constructor(x : number, y : number) {

        super(x, y, 8, 12);

        this.shadowType = 2;
        this.spr.setFrame((Math.random() * 4) | 0, this.spr.getRow());

        this.friction = new Vector2(0.025, 0.025);
        this.dir = new Vector2(0, 1);

        this.radius = 4;
        this.damage = 3;

        this.hitbox = new Vector2(6, 4);
        this.collisionBox = this.hitbox.clone();
        this.damageBox = new Vector2(10, 10);

        this.avoidWater = false;

        this.waveTimer = Math.random() * Math.PI * 2;
    }


    protected updateAI(ev : GameEvent) {
        
        const ANIM_SPEED = 4;
        const MOVE_SPEED = 0.25;
        const WAVE_SPEED = 0.10;
        const AMPLITUDE = 1;

        this.spr.animate(this.spr.getRow(), 0, 3, ANIM_SPEED, ev.step);

        this.target = Vector2.scalarMultiply(this.dir, MOVE_SPEED);
        this.flip = this.target.x < 0 ? Flip.None : Flip.Horizontal;

        this.waveTimer = (this.waveTimer + WAVE_SPEED*ev.step) % (Math.PI * 2);
        this.shift.y = Math.round(Math.sin(this.waveTimer) * AMPLITUDE);
    }


    protected playerEvent(pl : Player, ev : GameEvent) {

        this.dir = Vector2.direction(this.pos, pl.getPos());
    }

}
