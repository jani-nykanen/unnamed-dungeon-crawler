/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


class Game implements Scene {


    private objects : ObjectManager;
    private cam : Camera;
    private stage : Stage;
    private status : PlayerStatus;


    constructor(param : any, ev : GameEvent) {

        const MAP_WIDTH = 6;
        const MAX_HEIGHT = 8;

        this.status = new PlayerStatus(10, 3, 0, 300);

        this.objects = new ObjectManager(this.status);
        this.cam = new Camera(0, 0, 160, 128);
        this.stage = new Stage(MAP_WIDTH, MAX_HEIGHT, this.cam, ev);

        this.objects.generateObjects(this.stage);
        this.objects.initialize(this.cam);
    }


    public refresh(ev : GameEvent) : void {
        
        this.cam.update(ev);
        if (this.cam.isMoving()) {

            this.objects.cameraMovement(this.cam, ev);
            return;
        }

        this.stage.update(this.cam, ev);
        this.objects.update(this.cam, this.stage, ev);

        if (this.status.update(ev)) {

            // Time up!
        }
    }


    private drawHUD(c : Canvas) {

        const TEXT_Y = 133;

        let font = c.getBitmap("font");
        let hud = c.getBitmap("hud");

        c.drawBitmapRegion(hud, 0, 0, 160, 16,
            0, 128);

        // Health
        let x = 4;
        c.drawBitmapRegion(font, 24, 0, 8, 8, x, TEXT_Y);
        c.drawText(font, 
            String(this.status.getHealth()) + "/" + String(this.status.getMaxHealth()),
            x+9, TEXT_Y, -1, 0);

        // Bullets
        x = 56;
        c.drawBitmapRegion(font, 48, 0, 8, 8, x, TEXT_Y);
        c.drawText(font, createStringWithZeros(this.status.getBulletCount(), 2), x + 9, TEXT_Y, 0, 0);

        // Gems
        x = 88;
        c.drawBitmapRegion(font, 40, 0, 8, 8, x, TEXT_Y);
        c.drawText(font, createStringWithZeros(this.status.getGemCount(), 2), x + 9, TEXT_Y, 0, 0);

        // Time
        x = 120;
        c.drawBitmapRegion(font, 32, 0, 8, 8, x, TEXT_Y);

        let str = genTimeString(this.status.getTime());
        // Minutes
        c.drawText(font, str.substr(0, str.length-2) , x+9, TEXT_Y, -2, 0);
        // Seconds
        c.drawText(font, str.substr(str.length-2, 2), x+21, TEXT_Y, 0, 0);
    }


    public redraw(c : Canvas) : void {

        c.clear(170, 170, 170);

        this.stage.drawBackground(c, this.cam);
        this.cam.use(c);
        this.stage.draw(c, this.cam);
        this.objects.draw(c, this.stage);

        c.moveTo();
        this.drawHUD(c);
    }


    public dispose() : any {

        return null;
    }
}
