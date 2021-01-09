/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


interface Scene {

    refresh(ev : GameEvent) : void;
    redraw(c : Canvas) : void;

    // TODO: Replace any with... something 
    dispose() : any;
}
