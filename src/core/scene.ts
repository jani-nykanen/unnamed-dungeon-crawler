/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


interface Scene {

    init(param : any, ev : GameEvent) : void;
    refresh(ev : GameEvent) : void;
    redraw(c : Canvas) : void;
    dispose() : any;
}
