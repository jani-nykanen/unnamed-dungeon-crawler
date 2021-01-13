/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */



let setActions = (core : Core) => {

    core.addInputAction("fire2", "KeyZ", 2)
        .addInputAction("fire3", "KeyX", 1)
        .addInputAction("fire1", "KeyC", 0)
        .addInputAction("start", "Enter", 9, 7)
        .addInputAction("back", "Escape", 8, 6)
        .addInputAction("select", "ShiftLeft", 4, 5);
}


let loadAssets = (core : Core) => {

    // Bitmaps
    [
        {name: "font", path: "assets/bitmaps/font.png"},
        {name: "player", path: "assets/bitmaps/player.png"},
        {name: "tileset", path: "assets/bitmaps/tileset.png"},
        {name: "shadow", path: "assets/bitmaps/shadow.png"},
        {name: "bullet", path: "assets/bitmaps/bullets.png"} 
    ].map(a => core.loadBitmap(a.name, a.path));

    // Tilemaps
    [
        {name: "baseRoom", path: "assets/maps/base_room.tmx"},
        {name: "collisions", path: "assets/maps/collisions.tmx"},
    ].map(a => core.loadTilemap(a.name, a.path));
}


window.onload = () => {

    let core = new Core(160, 144, 0);

    setActions(core);
    loadAssets(core);

    core.run(Game);
}
