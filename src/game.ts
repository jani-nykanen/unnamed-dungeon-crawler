/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


class Game implements Scene {


    private objects : ObjectManager;
    private cam : Camera;
    private stage : Stage;


    constructor(param : any, ev : GameEvent) {

        const MAP_WIDTH = 6;
        const MAX_HEIGHT = 8;

        this.objects = new ObjectManager();
        this.cam = new Camera(0, 0, 160, 128);
        this.stage = new Stage(MAP_WIDTH, MAX_HEIGHT, this.cam, ev);

        this.objects.initialize(this.cam);
    }


    refresh(ev : GameEvent) : void {
        
        this.cam.update(ev);
        if (this.cam.isMoving()) {

            this.objects.cameraMovement(this.cam, ev);
            return;
        }

        this.stage.update(ev);
        this.objects.update(this.cam, this.stage, ev);
    }


    drawHUD(c : Canvas) {

        let font = c.getBitmap("font");
        let hud = c.getBitmap("hud");

        c.drawBitmapRegion(hud, 0, 0, 160, 16,
            0, 128);

        // Health
        c.drawBitmapRegion(font, 24, 0, 8, 8, 4, 133);
        c.drawText(font, "10/10", 13, 133, -1, 0);

        // Gems
        c.drawBitmapRegion(font, 40, 0, 8, 8, 88, 133);
        c.drawText(font, "00", 97, 133, 0, 0);

        // Time
        c.drawBitmapRegion(font, 32, 0, 8, 8, 120, 133);
        // Minutes
        c.drawText(font, "5:", 129, 133, -2, 0);
        // Seconds
        c.drawText(font, "00", 141, 133, 0, 0);
    }


    redraw(c : Canvas) : void {

        c.clear(170, 170, 170);

        this.cam.use(c);
        this.stage.draw(c, this.cam);
        this.objects.draw(c);

        c.moveTo();
        this.drawHUD(c);
    }


    dispose() : any {

        return null;
    }
}
