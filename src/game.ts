/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


class Game implements Scene {


    private testPos : Vector2;


    constructor() {

        this.testPos = new Vector2();
    }

    
    init(param : any, ev : GameEvent) {

        this.testPos = new Vector2();
    }


    refresh(ev : GameEvent) : void {
        
        const SPEED = 1.0;
        
        this.testPos.x += ev.input.getStick().x * SPEED * ev.step;
        this.testPos.y += ev.input.getStick().y * SPEED * ev.step;
    }


    redraw(c : Canvas) : void {

        c.clear(170, 170, 170);

        c.moveTo(c.width / 2, c.height / 2);
        c.setFillColor(255, 0, 0);
        c.fillRect(this.testPos.x-8, this.testPos.y-8, 16, 16);
        c.moveTo();

    }


    dispose() : any {

        return null;
    }
}
