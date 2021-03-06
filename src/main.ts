/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


const setActions = (core : Core) => {

    core.addInputAction("fire2", "KeyZ", 2)
        .addInputAction("fire3", "KeyX", 1)
        .addInputAction("fire1", "KeyC", 0)
        .addInputAction("start", "Enter", 9, 7)
        .addInputAction("back", "Escape", 8, 6)
        .addInputAction("select", "ShiftLeft", 4, 5);
}


const loadAssets = (core : Core) => {

    const ROOM_MAP_COUNT = 9;

    // Bitmaps
    [
        {name: "font", path: "assets/bitmaps/font.png"},
        {name: "player", path: "assets/bitmaps/player.png"},
        {name: "tileset", path: "assets/bitmaps/tileset.png"},
        {name: "shadow", path: "assets/bitmaps/shadow.png"},
        {name: "bullet", path: "assets/bitmaps/bullets.png"},
        {name: "leaves", path: "assets/bitmaps/leaves.png"},
        {name: "fontSmall", path: "assets/bitmaps/font_small.png"},
        {name: "enemies", path: "assets/bitmaps/enemies.png"},
        {name: "pickups", path: "assets/bitmaps/pickups.png"},
        {name: "hud", path: "assets/bitmaps/hud.png"}
    ].map(a => core.loadBitmap(a.name, a.path));

    // Base tilemaps
    [
        {name: "baseRoom", path: "assets/maps/base_room.tmx"},
        {name: "startRoom", path: "assets/maps/start_room.tmx"},
        {name: "collisions", path: "assets/maps/collisions.tmx"},
    ].map(a => core.loadTilemap(a.name, a.path));

    (new Array(ROOM_MAP_COUNT)).fill(null).map((a, i) => 
        {return {name: "room" + String(i+1), path: "assets/maps/" + String(i+1) + ".tmx"}})
        .map(a => core.loadTilemap(a.name, a.path));
}


window.onload = () : void => {

    let core = new Core(160, 144, 0);

    setActions(core);
    loadAssets(core);

    core.run(TitleScreen);
}
