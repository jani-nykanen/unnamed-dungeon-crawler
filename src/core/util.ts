/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


class KeyValuePair<T> {

    public readonly key : string;
    public value : T;

    
    constructor(key : string, value : T) {

        this.key = key;
        this.value = value;
    }
}


function negMod(m : number, n : number) : number {

    m |= 0;
    n |= 0;

    return ((m % n) + n) % n;
}


function clamp(x : number, min : number, max : number) : number {

    return Math.max(min, Math.min(x, max));
}


function updateSpeedAxis(speed : number, target : number, step : number) {
		
    if (speed < target) {
        
        return Math.min(target, speed+step);
    }
    return Math.max(target, speed-step);
}


function boxOverlay(pos : Vector2, center : Vector2, hitbox : Vector2, 
    x : number, y : number, w : number, h : number) {

    let px = pos.x + center.x - hitbox.x/2;
    let py = pos.y + center.y - hitbox.y/2;

    return px + hitbox.x >= x && px < x+w &&
           py + hitbox.y >= y && py < y+h;
}



function compose<T> (f  : ((a : T) => T), g : ((a : T) => T)) : ((a : T) => T) {

    return (a : T) => f(g(a));
}


function genTimeString(time : number) : string {

    let minutes = Math.floor(time / 3600);
    let seconds = ((time / 60) | 0) % 60;

    let str = String(minutes | 0) + ":";
    if (seconds < 10)
        str += "0";
    str += String(seconds | 0);

    return str;
}


// The name is confusing, so here's a example:
// createStringWithZeros(12, 3) => "012";
function createStringWithZeros(value : number, maxZeros : number) : string {

    let str = String(value);
    return "0".repeat(maxZeros - str.length) + str;
}
