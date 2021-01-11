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

        this.objects = new ObjectManager();
        this.cam = new Camera(0, 0, 160, 128);
        this.stage = new Stage(ev);
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


    redraw(c : Canvas) : void {

        c.clear(170, 170, 170);

        this.cam.use(c);
        this.stage.draw(c, this.cam);
        this.objects.draw(c);

        c.moveTo();

        c.setFillColor(255, 170, 0);
        c.fillRect(0, 128, 160, 16);
        c.drawText(c.getBitmap("font"), "Hello world!",
            2, 130, -1, 0);
    }


    dispose() : any {

        return null;
    }
}
