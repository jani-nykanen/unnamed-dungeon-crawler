/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


function negMod(m : number, n : number) : number {

    m |= 0;
    n |= 0;

    return ((m % n) + n) % n;
}


function clamp(x : number, min : number, max : number) : number {

    return Math.max(min, Math.min(x, max));
}


/*
function updateSpeedAxis(speed, target, step) {
		
    if (speed < target) {
        
        return Math.min(target, speed+step);
    }
    return Math.max(target, speed-step);
}


function overlay(pos, center, hitbox, x, y, w, h) {

    if (center == null)
        center = new Vector2(0, 0);

    let px = pos.x + center.x - hitbox.x/2;
    let py = pos.y + center.y - hitbox.y/2;

    return px + hitbox.x >= x && px < x+w &&
           py + hitbox.y >= y && py < y+h;
}
*/