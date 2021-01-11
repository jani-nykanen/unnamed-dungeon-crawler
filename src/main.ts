/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


// They say functional programming is hot, so here's some
// hot code for you.
// (read: fresh shit is hot, I think?)

// And yes, I added this clusterfuck only to confuse people
// who start reading my code in this very file

// TODO: Rewrite this, actually...

let addInputActions = (core : Core) : Core => 
        core.addInputAction("fire1", "KeyZ", 0)
            .addInputAction("fire2", "KeyX", 2)
            .addInputAction("fire3", "KeyC", 1)
            .addInputAction("start", "Enter", 9, 7)
            .addInputAction("back", "Escape", 8, 6)
            .addInputAction("select", "ShiftLeft", 4, 5);


let configAssets = (core : Core) : Core => 
    // TODO: Parse these from an Xml file, like in my previous
    // projects...
    [
        {name: "font", path: "assets/bitmaps/font.png"},
        {name: "player", path: "assets/bitmaps/player.png"},
        {name: "tileset", path: "assets/bitmaps/tileset.png"},
        {name: "shadow", path: "assets/bitmaps/shadow.png"},
        {name: "bullet", path: "assets/bitmaps/bullets.png"} 
    ].map(a => core.loadBitmap(a.name, a.path))[0];


window.onload = () => {

    compose<Core>(configAssets, addInputActions) (new Core(160, 144, 0)).run(Game);
}
