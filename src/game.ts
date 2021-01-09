/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


class Game implements Scene {


    private objects : ObjectManager;


    constructor(param : any, ev : GameEvent) {

        this.objects = new ObjectManager();
    }


    refresh(ev : GameEvent) : void {
        
        this.objects.update(ev);
    }


    redraw(c : Canvas) : void {

        c.clear(170, 170, 170);

        this.objects.draw(c);

        c.drawText(c.getBitmap("font"), "Hello world!",
            2, 2, -1, 0);
    }


    dispose() : any {

        return null;
    }
}
