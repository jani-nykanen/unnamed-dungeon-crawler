/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */

const TITLE_TEXT = 
`UNNAMED DUNGEON
CRAWLER ROGUELITE
PROJECT, v.0.1.0

Controls: arrow
keys for movement,
Z for attacking, X
for magic and C
for rolling. Hold
Z for spin attack.

(Or use a gamepad.)

Press enter to
start

©2021 Jani Nykänen`;


class TitleScreen implements Scene {


    constructor(param : any, ev : GameEvent) {

    }


    public refresh(ev : GameEvent) : void {
        
        if (ev.getAction("start") == State.Pressed ||
            ev.getAction("fire1") == State.Pressed) {

            ev.changeScene(Game);
        }
    }


    public redraw(c : Canvas) : void {

        let font = c.getBitmap("font");

        c.clear(0, 85, 170);

        c.drawText(font, TITLE_TEXT,
            4, 4, 0, 0, false);

        

    }


    public dispose() : any {

        return null;
    }
}
