class AssetContainer {
    constructor() {
        this.assets = new Array();
    }
    getAsset(name) {
        for (let a of this.assets) {
            if (a.key == name)
                return a.value;
        }
        return null;
    }
    addAsset(name, data) {
        this.assets.push(new KeyValuePair(name, data));
    }
}
class AssetManager {
    constructor() {
        this.bitmaps = new AssetContainer();
        this.tilemaps = new AssetContainer();
        this.total = 0;
        this.loaded = 0;
    }
    loadTextfile(path, type, cb) {
        let xobj = new XMLHttpRequest();
        xobj.overrideMimeType("text/" + type);
        xobj.open("GET", path, true);
        ++this.total;
        xobj.onreadystatechange = () => {
            if (xobj.readyState == 4) {
                if (String(xobj.status) == "200") {
                    if (cb != undefined)
                        cb(xobj.responseText);
                }
                ++this.loaded;
            }
        };
        xobj.send(null);
    }
    loadBitmap(name, url) {
        ++this.total;
        let image = new Image();
        image.onload = () => {
            ++this.loaded;
            this.bitmaps.addAsset(name, image);
        };
        image.src = url;
    }
    loadTilemap(name, url) {
        ++this.total;
        this.loadTextfile(url, "xml", (str) => {
            this.tilemaps.addAsset(name, new Tilemap(str));
            ++this.loaded;
        });
    }
    hasLoaded() {
        return this.loaded >= this.total;
    }
    getBitmap(name) {
        return this.bitmaps.getAsset(name);
    }
    getTilemap(name) {
        return this.tilemaps.getAsset(name);
    }
    dataLoadedUnit() {
        return this.total == 0 ? 1.0 : this.loaded / this.total;
    }
}
var Flip;
(function (Flip) {
    Flip[Flip["None"] = 0] = "None";
    Flip[Flip["Horizontal"] = 1] = "Horizontal";
    Flip[Flip["Vertical"] = 2] = "Vertical";
    Flip[Flip["Both"] = 3] = "Both";
})(Flip || (Flip = {}));
;
class Canvas {
    constructor(width, height, assets) {
        this.width = width;
        this.height = height;
        this.translation = new Vector2();
        this.assets = assets;
        this.createHtml5Canvas(width, height);
        window.addEventListener("resize", () => this.resize(window.innerWidth, window.innerHeight));
    }
    createHtml5Canvas(width, height) {
        let cdiv = document.createElement("div");
        cdiv.setAttribute("style", "position: absolute; top: 0; left: 0; z-index: -1;");
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.setAttribute("style", "position: absolute; top: 0; left: 0; z-index: -1;" +
            "image-rendering: optimizeSpeed;" +
            "image-rendering: pixelated;" +
            "image-rendering: -moz-crisp-edges;");
        cdiv.appendChild(this.canvas);
        document.body.appendChild(cdiv);
        this.ctx = this.canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;
        this.resize(window.innerWidth, window.innerHeight);
    }
    getColorString(r, g, b, a = 1.0) {
        return "rgba(" + String(r | 0) + "," +
            String(g | 0) + "," +
            String(b | 0) + "," +
            String(clamp(a, 0.0, 1.0));
    }
    resize(width, height) {
        let c = this.canvas;
        let mul = Math.min((width / c.width) | 0, (height / c.height) | 0);
        let totalWidth = c.width * mul;
        let totalHeight = c.height * mul;
        let x = width / 2 - totalWidth / 2;
        let y = height / 2 - totalHeight / 2;
        let top = String(y | 0) + "px";
        let left = String(x | 0) + "px";
        c.style.width = String(totalWidth | 0) + "px";
        c.style.height = String(totalHeight | 0) + "px";
        c.style.top = top;
        c.style.left = left;
    }
    moveTo(x = 0.0, y = 0.0) {
        this.translation.x = x;
        this.translation.y = y;
    }
    move(x, y) {
        this.translation.x += x;
        this.translation.y += y;
    }
    clear(r, g, b) {
        this.ctx.fillStyle = this.getColorString(r, g, b);
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    setFillColor(r, g = r, b = g, a = 1.0) {
        let colorStr = this.getColorString(r, g, b, a);
        this.ctx.fillStyle = colorStr;
    }
    setGlobalAlpha(a = 1.0) {
        this.ctx.globalAlpha = clamp(a, 0, 1);
    }
    fillRect(x, y, w, h) {
        x += this.translation.x;
        y += this.translation.y;
        this.ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
    }
    drawBitmap(bmp, dx, dy, flip = Flip.None) {
        this.drawBitmapRegion(bmp, 0, 0, bmp.width, bmp.height, dx, dy, flip);
    }
    drawBitmapRegion(bmp, sx, sy, sw, sh, dx, dy, flip = Flip.None) {
        this.drawScaledBitmapRegion(bmp, sx, sy, sw, sh, dx, dy, sw, sh, flip);
    }
    drawScaledBitmapRegion(bmp, sx, sy, sw, sh, dx, dy, dw, dh, flip = Flip.None) {
        if (bmp == null || sw <= 0 || sh <= 0)
            return;
        let c = this.ctx;
        dx += this.translation.x;
        dy += this.translation.y;
        sx |= 0;
        sy |= 0;
        sw |= 0;
        sh |= 0;
        dx |= 0;
        dy |= 0;
        dw |= 0;
        dh |= 0;
        flip = flip | Flip.None;
        if (flip != Flip.None) {
            c.save();
        }
        if ((flip & Flip.Horizontal) != 0) {
            c.translate(dw, 0);
            c.scale(-1, 1);
            dx *= -1;
        }
        if ((flip & Flip.Vertical) != 0) {
            c.translate(0, dh);
            c.scale(1, -1);
            dy *= -1;
        }
        c.drawImage(bmp, sx, sy, sw, sh, dx, dy, dw, dh);
        if (flip != Flip.None) {
            c.restore();
        }
    }
    drawText(font, str, dx, dy, xoff = 0.0, yoff = 0.0, center = false) {
        let cw = (font.width / 16) | 0;
        let ch = cw;
        let x = dx;
        let y = dy;
        let c;
        if (center) {
            dx -= (str.length * (cw + xoff)) / 2.0;
            x = dx;
        }
        for (let i = 0; i < str.length; ++i) {
            c = str.charCodeAt(i);
            if (c == '\n'.charCodeAt(0)) {
                x = dx;
                y += ch + yoff;
                continue;
            }
            this.drawBitmapRegion(font, (c % 16) * cw, ((c / 16) | 0) * ch, cw, ch, x, y, Flip.None);
            x += cw + xoff;
        }
    }
    drawSpriteFrame(spr, bmp, column, row, dx, dy, flip = Flip.None) {
        spr.drawFrame(this, bmp, column, row, dx, dy, flip);
    }
    drawSprite(spr, bmp, dx, dy, flip = Flip.None) {
        spr.draw(this, bmp, dx, dy, flip);
    }
    getBitmap(name) {
        return this.assets.getBitmap(name);
    }
}
class GameEvent {
    constructor(step, core, input, assets) {
        this.core = core;
        this.step = step;
        this.input = input;
        this.assets = assets;
    }
    getStick() {
        return this.input.getStick();
    }
    getAction(name) {
        return this.input.getAction(name);
    }
    getTilemap(name) {
        return this.assets.getTilemap(name);
    }
    changeScene(newScene) {
        this.core.changeScene(newScene);
    }
}
class Core {
    constructor(canvasWidth, canvasHeight, frameSkip) {
        this.assets = new AssetManager();
        this.canvas = new Canvas(canvasWidth, canvasHeight, this.assets);
        this.input = new InputManager();
        this.input.addAction("left", "ArrowLeft", 14)
            .addAction("up", "ArrowUp", 12)
            .addAction("right", "ArrowRight", 15)
            .addAction("down", "ArrowDown", 13),
            this.ev = new GameEvent(frameSkip + 1, this, this.input, this.assets);
        this.timeSum = 0.0;
        this.oldTime = 0.0;
        this.initialized = false;
        this.activeScene = null;
        this.activeSceneType = null;
    }
    drawLoadingScreen(c) {
        let barWidth = c.width / 4;
        let barHeight = barWidth / 8;
        c.clear(0, 0, 0);
        let t = this.assets.dataLoadedUnit();
        let x = c.width / 2 - barWidth / 2;
        let y = c.height / 2 - barHeight / 2;
        x |= 0;
        y |= 0;
        c.setFillColor(255);
        c.fillRect(x - 2, y - 2, barWidth + 4, barHeight + 4);
        c.setFillColor(0);
        c.fillRect(x - 1, y - 1, barWidth + 2, barHeight + 2);
        let w = (barWidth * t) | 0;
        c.setFillColor(255);
        c.fillRect(x, y, w, barHeight);
    }
    loop(ts) {
        const MAX_REFRESH_COUNT = 5;
        const FRAME_WAIT = 16.66667 * this.ev.step;
        this.timeSum += ts - this.oldTime;
        this.timeSum = Math.min(MAX_REFRESH_COUNT * FRAME_WAIT, this.timeSum);
        this.oldTime = ts;
        let refreshCount = (this.timeSum / FRAME_WAIT) | 0;
        while ((refreshCount--) > 0) {
            if (!this.initialized && this.assets.hasLoaded()) {
                if (this.activeSceneType != null)
                    this.activeScene = new this.activeSceneType.prototype.constructor(null, this.ev);
                this.initialized = true;
            }
            this.input.preUpdate();
            if (this.initialized && this.activeScene != null) {
                this.activeScene.refresh(this.ev);
            }
            this.input.postUpdate();
            this.timeSum -= FRAME_WAIT;
        }
        if (this.initialized) {
            if (this.activeScene != null)
                this.activeScene.redraw(this.canvas);
        }
        else {
            this.drawLoadingScreen(this.canvas);
        }
        window.requestAnimationFrame(ts => this.loop(ts));
    }
    addInputAction(name, key, button1, button2 = -1) {
        this.input.addAction(name, key, button1, button2);
        return this;
    }
    loadBitmap(name, url) {
        this.assets.loadBitmap(name, url);
        return this;
    }
    loadTilemap(name, url) {
        this.assets.loadTilemap(name, url);
        return this;
    }
    run(initialScene) {
        this.activeSceneType = initialScene;
        this.loop(0);
    }
    changeScene(newScene) {
        let param = this.activeScene.dispose();
        this.activeScene = new newScene.prototype.constructor(param, this.ev);
    }
}
class GamePadListener {
    constructor() {
        this.stick = new Vector2(0, 0);
        this.buttons = new Array();
        this.pad = null;
        this.index = 0;
        window.addEventListener("gamepadconnected", (ev) => {
            console.log("Gamepad with index " +
                String(ev["gamepad"].index) +
                " connected.");
            let gp = navigator.getGamepads()[ev["gamepad"].index];
            this.index = ev["gamepad"].index;
            this.pad = gp;
            this.updateGamepad(this.pad);
        });
        this.anyPressed = false;
    }
    pollGamepads() {
        if (navigator == null)
            return null;
        return navigator.getGamepads();
    }
    updateButtons(pad) {
        if (pad == null) {
            for (let i = 0; i < this.buttons.length; ++i) {
                this.buttons[i] = State.Up;
            }
            return;
        }
        for (let i = 0; i < pad.buttons.length; ++i) {
            if (i >= this.buttons.length) {
                for (let j = 0; j < i - this.buttons.length; ++j) {
                    this.buttons.push(State.Up);
                }
            }
            if (pad.buttons[i].pressed) {
                if (this.buttons[i] == State.Up ||
                    this.buttons[i] == State.Released) {
                    this.anyPressed = true;
                    this.buttons[i] = State.Pressed;
                }
                else {
                    this.buttons[i] = State.Down;
                }
            }
            else {
                if (this.buttons[i] == State.Down ||
                    this.buttons[i] == State.Pressed) {
                    this.buttons[i] = State.Released;
                }
                else {
                    this.buttons[i] = State.Up;
                }
            }
        }
    }
    updateStick(pad) {
        const DEADZONE = 0.25;
        let noLeftStick = true;
        if (pad != null) {
            this.stick.x = 0;
            this.stick.y = 0;
            if (Math.abs(pad.axes[0]) >= DEADZONE) {
                this.stick.x = pad.axes[0];
                noLeftStick = false;
            }
            if (Math.abs(pad.axes[1]) >= DEADZONE) {
                this.stick.y = pad.axes[1];
                noLeftStick = false;
            }
            if (pad.axes.length >= 8 && noLeftStick) {
                if (Math.abs(pad.axes[6]) >= DEADZONE)
                    this.stick.x = pad.axes[6];
                if (Math.abs(pad.axes[7]) >= DEADZONE)
                    this.stick.y = pad.axes[7];
            }
        }
    }
    updateGamepad(pad) {
        this.updateStick(pad);
        this.updateButtons(pad);
    }
    refreshGamepads() {
        if (this.pad == null)
            return;
        let pads = this.pollGamepads();
        if (pads == null)
            return;
        this.pad = pads[this.index];
    }
    update() {
        this.anyPressed = false;
        this.stick.x = 0.0;
        this.stick.y = 0.0;
        this.refreshGamepads();
        this.updateGamepad(this.pad);
    }
    getButtonState(id) {
        if (id == null ||
            id < 0 ||
            id >= this.buttons.length)
            return State.Up;
        return this.buttons[id];
    }
    isAnyButtonPressed() {
        return this.anyPressed;
    }
    getStick() {
        return this.stick.clone();
    }
}
const INPUT_SPECIAL_EPS = 0.25;
var State;
(function (State) {
    State[State["Up"] = 0] = "Up";
    State[State["Released"] = 2] = "Released";
    State[State["Down"] = 1] = "Down";
    State[State["Pressed"] = 3] = "Pressed";
    State[State["DownOrPressed"] = 1] = "DownOrPressed";
})(State || (State = {}));
class InputAction {
    constructor(name, key, button1 = -1, button = -2) {
        this.name = name;
        this.key = key;
        this.button1 = button1;
        this.button2 = this.button2;
        this.state = State.Up;
    }
}
class InputManager {
    constructor() {
        this.keyStates = new Array();
        this.prevent = new Array();
        this.actions = new Array();
        this.gamepad = new GamePadListener();
        this.stick = new Vector2(0, 0);
        this.oldStick = new Vector2(0, 0);
        this.stickDelta = new Vector2(0, 0);
        window.addEventListener("keydown", (e) => {
            if (this.keyPressed(e.code))
                e.preventDefault();
        });
        window.addEventListener("keyup", (e) => {
            if (this.keyReleased(e.code))
                e.preventDefault();
        });
        window.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        });
        window.addEventListener("mousemove", (e) => {
            window.focus();
        });
        window.addEventListener("mousedown", (e) => {
            window.focus();
        });
        this.anyKeyPressed = false;
    }
    setKeyState(key, s) {
        for (let e of this.keyStates) {
            if (e.key == key) {
                e.value = s;
                return;
            }
        }
    }
    pushKeyState(key) {
        for (let e of this.keyStates) {
            if (e.key == key)
                return;
        }
        this.keyStates.push(new KeyValuePair(key, State.Up));
    }
    addAction(name, key, button1, button2 = -1) {
        this.actions.push(new InputAction(name, key, button1, button2));
        this.prevent.push(key);
        return this;
    }
    keyPressed(key) {
        this.pushKeyState(key);
        if (this.getKeyState(key) != State.Down) {
            this.anyKeyPressed = true;
            this.setKeyState(key, State.Pressed);
        }
        return this.prevent.includes(key);
    }
    keyReleased(key) {
        this.pushKeyState(key);
        if (this.getKeyState(key) != State.Up)
            this.setKeyState(key, State.Released);
        return this.prevent.includes(key);
    }
    updateStateArray(arr) {
        for (let a of arr) {
            if (a.value == State.Pressed)
                a.value = State.Down;
            else if (a.value == State.Released)
                a.value = State.Up;
        }
    }
    updateStick() {
        const DEADZONE = 0.25;
        let padStick = this.gamepad.getStick();
        this.oldStick = this.stick.clone();
        this.stick.zeros();
        if (Math.abs(padStick.x) >= DEADZONE ||
            Math.abs(padStick.y) >= DEADZONE) {
            this.stick = padStick;
        }
        else {
            if (this.getAction("right") & State.DownOrPressed) {
                this.stick.x = 1;
            }
            else if (this.getAction("left") & State.DownOrPressed) {
                this.stick.x = -1;
            }
            if (this.getAction("down") & State.DownOrPressed) {
                this.stick.y = 1;
            }
            else if (this.getAction("up") & State.DownOrPressed) {
                this.stick.y = -1;
            }
            this.stick.normalize();
        }
        this.stickDelta = new Vector2(this.stick.x - this.oldStick.x, this.stick.y - this.oldStick.y);
    }
    preUpdate() {
        this.gamepad.update();
        for (let a of this.actions) {
            a.state = this.getKeyState(a.key) | State.Up;
            if (a.state == State.Up) {
                if (a.button1 != null)
                    a.state = this.gamepad.getButtonState(a.button1);
                if (a.state == State.Up && a.button2 != null) {
                    a.state = this.gamepad.getButtonState(a.button2);
                }
            }
        }
        this.updateStick();
    }
    postUpdate() {
        this.updateStateArray(this.keyStates);
        this.anyKeyPressed = false;
    }
    upPress() {
        return this.stick.y < 0 &&
            this.oldStick.y >= -INPUT_SPECIAL_EPS &&
            this.stickDelta.y < -INPUT_SPECIAL_EPS;
    }
    downPress() {
        return this.stick.y > 0 &&
            this.oldStick.y <= INPUT_SPECIAL_EPS &&
            this.stickDelta.y > INPUT_SPECIAL_EPS;
    }
    leftPress() {
        return this.stick.x < 0 &&
            this.oldStick.x >= -INPUT_SPECIAL_EPS &&
            this.stickDelta.x < -INPUT_SPECIAL_EPS;
    }
    rightPress() {
        return this.stick.x > 0 &&
            this.oldStick.x <= INPUT_SPECIAL_EPS &&
            this.stickDelta.x > INPUT_SPECIAL_EPS;
    }
    anyPressed() {
        return this.anyKeyPressed || this.gamepad.isAnyButtonPressed();
    }
    getStick() {
        return this.stick.clone();
    }
    getAction(name) {
        for (let e of this.actions) {
            if (e.name == name)
                return e.state;
        }
        return State.Up;
    }
    getKeyState(key) {
        for (let e of this.keyStates) {
            if (e.key == key)
                return e.value;
        }
        return State.Up;
    }
}
class Sprite {
    constructor(w, h) {
        this.getRow = () => this.row;
        this.getColumn = () => this.column;
        this.getTimer = () => this.timer;
        this.width = w;
        this.height = h;
        this.row = 0;
        this.column = 0;
        this.timer = 0.0;
    }
    animate(row, start, end, speed, steps = 1.0) {
        row |= 0;
        start |= 0;
        end |= 0;
        speed |= 0;
        if (start == end) {
            this.timer = 0;
            this.column = start;
            this.row = row;
            return;
        }
        if (this.row != row) {
            this.timer = 0;
            this.column = end > start ? start : end;
            this.row = row;
        }
        if ((start < end && this.column < start) ||
            (start > end && this.column > start)) {
            this.column = start;
        }
        this.timer += steps;
        if (this.timer > speed) {
            if (start < end) {
                if (++this.column > end) {
                    this.column = start;
                }
            }
            else {
                if (--this.column < end) {
                    this.column = start;
                }
            }
            this.timer -= speed;
        }
    }
    setFrame(column, row, preserveTimer = false) {
        this.column = column;
        this.row = row;
        if (!preserveTimer)
            this.timer = 0;
    }
    drawFrame(c, bmp, column, row, dx, dy, flip = Flip.None) {
        c.drawBitmapRegion(bmp, this.width * column, this.height * row, this.width, this.height, dx, dy, flip);
    }
    draw(c, bmp, dx, dy, flip = Flip.None) {
        this.drawFrame(c, bmp, this.column, this.row, dx, dy, flip);
    }
}
class Tilemap {
    constructor(xmlString) {
        let doc = (new DOMParser()).parseFromString(xmlString, "text/xml");
        let root = doc.getElementsByTagName("map")[0];
        this.width = Number(root.getAttribute("width"));
        this.height = Number(root.getAttribute("height"));
        let data = root.getElementsByTagName("layer");
        this.layers = new Array();
        let min = 9999;
        for (let d of data) {
            if (d.id < min) {
                min = d.id;
            }
        }
        let str, content;
        let id;
        for (let i = 0; i < data.length; ++i) {
            id = data[i].id - min;
            str = data[i].getElementsByTagName("data")[0]
                .childNodes[0]
                .nodeValue
                .replace(/(\r\n|\n|\r)/gm, "");
            content = str.split(",");
            this.layers[id] = new Array();
            for (let j = 0; j < content.length; ++j) {
                this.layers[id][j] = parseInt(content[j]);
            }
        }
        this.properties = new Array();
        let prop = root.getElementsByTagName("properties")[0];
        if (prop != undefined) {
            for (let p of prop.getElementsByTagName("property")) {
                if (p.getAttribute("name") != undefined) {
                    this.properties.push(new KeyValuePair(p.getAttribute("name"), p.getAttribute("value")));
                }
            }
        }
    }
    getTile(l, x, y) {
        if (l < 0 || l >= this.layers.length || x < 0 || y < 0 ||
            x >= this.width || y >= this.height)
            return -1;
        return this.layers[l][y * this.width + x];
    }
    getIndexedTile(l, i) {
        if (l < 0 || l >= this.layers.length || i < 0 || i >= this.width * this.height)
            return -1;
        return this.layers[l][i];
    }
    cloneLayer(l) {
        if (l < 0 || l >= this.layers.length)
            return null;
        return Array.from(this.layers[l]);
    }
}
class KeyValuePair {
    constructor(key, value) {
        this.key = key;
        this.value = value;
    }
}
function negMod(m, n) {
    m |= 0;
    n |= 0;
    return ((m % n) + n) % n;
}
function clamp(x, min, max) {
    return Math.max(min, Math.min(x, max));
}
function updateSpeedAxis(speed, target, step) {
    if (speed < target) {
        return Math.min(target, speed + step);
    }
    return Math.max(target, speed - step);
}
function boxOverlay(pos, center, hitbox, x, y, w, h) {
    let px = pos.x + center.x - hitbox.x / 2;
    let py = pos.y + center.y - hitbox.y / 2;
    return px + hitbox.x >= x && px < x + w &&
        py + hitbox.y >= y && py < y + h;
}
function boxOverlayRect(rect, x, y, w, h) {
    return this.boxOverlay(new Vector2(rect.x + rect.w / 2, rect.y + rect.h / 2), new Vector2(), new Vector2(rect.w, rect.h), x, y, w, h);
}
function compose(f, g) {
    return (a) => f(g(a));
}
function genTimeString(time) {
    let minutes = Math.floor(time / 3600);
    let seconds = ((time / 60) | 0) % 60;
    let str = String(minutes | 0) + ":";
    if (seconds < 10)
        str += "0";
    str += String(seconds | 0);
    return str;
}
function createStringWithZeros(value, maxZeros) {
    let str = String(value);
    return "0".repeat(maxZeros - str.length) + str;
}
class Vector2 {
    constructor(x = 0.0, y = 0.0) {
        this.x = x == undefined ? 0 : x;
        this.y = y == undefined ? 0 : y;
    }
    length() {
        return Math.hypot(this.x, this.y);
    }
    normalize(forceUnit = false) {
        const EPS = 0.0001;
        let l = this.length();
        if (l < EPS) {
            this.x = forceUnit ? 1 : 0;
            this.y = 0;
            return this.clone();
        }
        this.x /= l;
        this.y /= l;
        return this.clone();
    }
    clone() {
        return new Vector2(this.x, this.y);
    }
    zeros() {
        this.x = 0;
        this.y = 0;
    }
    scalarMultiply(s) {
        this.x *= s;
        this.y *= s;
        return this.clone();
    }
    static dot(u, v) {
        return u.x * v.x + u.y * v.y;
    }
    static normalize(v, forceUnit = false) {
        return v.clone().normalize(forceUnit);
    }
    static scalarMultiply(v, s) {
        return new Vector2(v.x * s, v.y * s);
    }
    static distance(a, b) {
        return Math.hypot(a.x - b.x, a.y - b.y);
    }
    static direction(a, b) {
        return (new Vector2(b.x - a.x, b.y - a.y)).normalize(true);
    }
}
class Rect {
    constructor(x = 0, y = 0, w = 0, h = 0) {
        this.clone = () => new Rect(this.x, this.y, this.w, this.h);
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}
class ExistingObject {
    constructor() {
        this.doesExist = () => this.exist;
        this.exist = true;
    }
}
class GameObject extends ExistingObject {
    constructor(x, y) {
        super();
        this.getPos = () => this.pos.clone();
        this.isInCamera = () => this.inCamera;
        this.isDying = () => this.dying;
        this.getCoordX = () => this.pos.x;
        this.getCoordY = () => this.pos.y;
        this.pos = new Vector2(x, y);
        this.oldPos = this.pos.clone();
        this.speed = new Vector2();
        this.target = this.speed.clone();
        this.friction = new Vector2(1, 1);
        this.center = new Vector2();
        this.hitbox = new Vector2();
        this.spr = new Sprite(0, 0);
        this.dying = false;
        this.inCamera = true;
    }
    die(ev) {
        return true;
    }
    updateLogic(ev) { }
    postUpdate(ev) { }
    outsideCameraEvent() { }
    updateMovement(ev) {
        this.speed.x = updateSpeedAxis(this.speed.x, this.target.x, this.friction.x * ev.step);
        this.speed.y = updateSpeedAxis(this.speed.y, this.target.y, this.friction.y * ev.step);
        this.pos.x += this.speed.x * ev.step;
        this.pos.y += this.speed.y * ev.step;
    }
    update(ev) {
        if (!this.exist || !this.inCamera)
            return;
        if (this.dying) {
            if (this.die(ev)) {
                this.exist = false;
                this.dying = false;
            }
            return;
        }
        this.oldPos = this.pos.clone();
        this.updateLogic(ev);
        this.updateMovement(ev);
        this.postUpdate(ev);
    }
    stopMovement() {
        this.speed.zeros();
        this.target.zeros();
    }
    cameraCheck(cam) {
        let topLeft = cam.getWorldPos();
        let oldState = this.inCamera;
        this.inCamera = boxOverlay(this.pos, this.center, this.hitbox, topLeft.x, topLeft.y, cam.width, cam.height);
        if (oldState && !this.inCamera) {
            this.outsideCameraEvent();
        }
    }
    overlayObject(o) {
        return boxOverlay(this.pos, this.center, this.hitbox, o.pos.x + o.center.x - o.hitbox.x / 2, o.pos.y + o.center.y - o.hitbox.y / 2, o.hitbox.x, o.hitbox.y);
    }
    draw(c) { }
    postDraw(c) { }
}
class CollisionObject extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.doesIgnoreDeathOnCollision = () => this.ignoreDeathOnCollision;
        this.doesAllowCameraCollision = () => this.enableCameraCollision;
        this.doesAvoidWater = () => this.avoidWater;
        this.getHitbox = () => this.hitbox.clone();
        this.collisionBox = new Vector2();
        this.bounceFactor = 0;
        this.ignoreDeathOnCollision = false;
        this.avoidWater = false;
        this.enableCameraCollision = true;
        this.disableCollisions = false;
    }
    wallCollisionEvent(dirx, diry, ev) { }
    horizontalCollision(x, y, h, dir, ev, force = false) {
        const EPS = 0.001;
        const V_MARGIN = 1;
        const NEAR_MARGIN = 1;
        const FAR_MARGIN = 6;
        if (!this.inCamera ||
            (!force && this.disableCollisions) ||
            !this.exist || this.dying ||
            this.speed.x * dir < EPS)
            return false;
        let top = this.pos.y + this.center.y - this.collisionBox.y / 2;
        let bottom = top + this.collisionBox.y;
        if (bottom <= y + V_MARGIN || top >= y + h - V_MARGIN)
            return false;
        let xoff = this.center.x + this.collisionBox.x / 2 * dir;
        let nearOld = this.oldPos.x + xoff;
        let nearNew = this.pos.x + xoff;
        if ((dir > 0 && nearNew >= x - NEAR_MARGIN * ev.step &&
            nearOld <= x + (FAR_MARGIN + this.speed.x) * ev.step) ||
            (dir < 0 && nearNew <= x + NEAR_MARGIN * ev.step &&
                nearOld >= x - (FAR_MARGIN - this.speed.x) * ev.step)) {
            this.pos.x = x - xoff;
            this.speed.x *= -this.bounceFactor;
            this.wallCollisionEvent(dir, 0, ev);
            return true;
        }
        return false;
    }
    verticalCollision(x, y, w, dir, ev, force = false) {
        const EPS = 0.001;
        const H_MARGIN = 1;
        const NEAR_MARGIN = 1;
        const FAR_MARGIN = 6;
        if (!this.inCamera ||
            (!force && this.disableCollisions) ||
            !this.exist || this.dying ||
            this.speed.y * dir < EPS)
            return false;
        let left = this.pos.x + this.center.x - this.collisionBox.x / 2;
        let right = left + this.collisionBox.x;
        if (right <= x + H_MARGIN || left >= x + w - H_MARGIN)
            return false;
        let yoff = this.center.y + this.collisionBox.y / 2 * dir;
        let nearOld = this.oldPos.y + yoff;
        let nearNew = this.pos.y + yoff;
        if ((dir > 0 && nearNew >= y - NEAR_MARGIN * ev.step &&
            nearOld <= y + (FAR_MARGIN + this.speed.y) * ev.step) ||
            (dir < 0 && nearNew <= y + NEAR_MARGIN * ev.step &&
                nearOld >= y - (FAR_MARGIN - this.speed.y) * ev.step)) {
            this.pos.y = y - yoff;
            this.speed.y *= -this.bounceFactor;
            this.wallCollisionEvent(0, dir, ev);
            return true;
        }
        return false;
    }
    attackCollisionCheck(x, y, w, h, type = 0) {
        return false;
    }
    hurtCollision(x, y, w, h, dmg, knockback, ev) {
        return false;
    }
    boxCollision(x, y, w, h, ev) {
        let ret = false;
        ret = ret || this.verticalCollision(x, y, w, 1, ev);
        ret = ret || this.verticalCollision(x, y + h, w, -1, ev);
        ret = ret || this.horizontalCollision(x, y, w, 1, ev);
        ret = ret || this.horizontalCollision(x + w, y, w, -1, ev);
        return ret;
    }
}
class Bullet extends CollisionObject {
    constructor() {
        super(0, 0);
        this.getHitID = () => this.hitId;
        this.isFriendly = () => this.friendly;
        this.getDamage = () => this.damage;
        this.exist = false;
        this.hitId = -1;
        this.collisionBox = new Vector2(4, 4);
        this.hitbox = this.collisionBox.clone();
        this.spr = new Sprite(24, 24);
        this.damage = 0;
        this.enableCameraCollision = false;
    }
    determineCollisionBox() {
        const DIAMATER = [6, 4];
        let d = DIAMATER[clamp(this.id | 0, 0, DIAMATER.length - 1)];
        this.collisionBox = new Vector2(d, d);
        this.hitbox = this.collisionBox.clone();
    }
    outsideCameraEvent() {
        this.exist = false;
        this.dying = false;
    }
    die(ev) {
        const DEATH_SPEED = 4;
        this.spr.animate(this.spr.getRow(), 4, 8, DEATH_SPEED, ev.step);
        return this.spr.getColumn() == 8;
    }
    updateLogic(ev) {
        const ANIM_SPEED = 3;
        this.spr.animate(this.spr.getRow(), 0, 3, ANIM_SPEED, ev.step);
    }
    wallCollisionEvent(dirx, diry, ev) {
        this.kill(ev);
    }
    kill(ev) {
        this.stopMovement();
        this.dying = true;
        this.ignoreDeathOnCollision = true;
    }
    spawn(id, hitId, dmg, x, y, speedx, speedy, isFriendy = false, source = null) {
        this.pos = new Vector2(x, y);
        this.speed = new Vector2(speedx, speedy);
        this.target = this.speed.clone();
        this.id = id;
        this.spr.setFrame(0, this.id);
        this.hitId = hitId;
        this.damage = dmg;
        this.friendly = isFriendy;
        this.exist = true;
        this.ignoreDeathOnCollision = false;
        if (source != null) {
            this.oldPos = source.clone();
        }
        else {
            this.oldPos = this.pos.clone();
        }
        this.determineCollisionBox();
    }
    baseDraw(c) {
        let px = Math.round(this.pos.x);
        let py = Math.round(this.pos.y);
        c.setFillColor(255, 0, 0);
        c.drawSprite(this.spr, c.getBitmap("bullet"), px - this.spr.width / 2, py - this.spr.height / 2);
    }
    draw(c) {
        if (!this.inCamera || !this.exist || this.dying)
            return;
        this.baseDraw(c);
    }
    postDraw(c) {
        if (!this.inCamera || !this.exist || !this.dying)
            return;
        this.baseDraw(c);
    }
    attackCollisionCheck(x, y, w, h, type = 0) {
        const RADIUS = 24;
        return this.friendly &&
            this.dying &&
            boxOverlay(this.pos, new Vector2(), new Vector2(RADIUS, RADIUS), x, y, w, h);
    }
}
class Camera {
    constructor(x, y, width, height) {
        this.getPos = () => this.pos.clone();
        this.getWorldPos = () => this.worldPos.clone();
        this.isMoving = () => this.moving;
        this.getSpeed = () => this.moveSpeed;
        this.getDirection = () => (new Vector2(this.target.x - this.pos.x, this.target.y - this.pos.y)).normalize();
        this.width = width;
        this.height = height;
        this.pos = new Vector2(x, y);
        this.target = this.pos.clone();
        this.worldPos = new Vector2(x * width, y * height);
        this.moving = false;
        this.moveTimer = 0;
        this.moveSpeed = 1;
    }
    setPos(x, y) {
        this.pos = new Vector2(x, y);
        this.target = this.pos.clone();
        this.worldPos = new Vector2(x * this.width, y * this.height);
    }
    move(dx, dy, speed) {
        if (this.moving)
            return false;
        this.moveTimer = 1.0;
        this.moveSpeed = speed;
        this.target.x = (this.pos.x + dx) | 0;
        this.target.y = (this.pos.y + dy) | 0;
        this.moving = true;
        return true;
    }
    update(ev) {
        if (!this.moving)
            return;
        if ((this.moveTimer -= this.moveSpeed * ev.step) <= 0) {
            this.moveTimer = 0;
            this.pos = this.target.clone();
            this.worldPos = new Vector2(this.pos.x * this.width, this.pos.y * this.height);
            this.moving = false;
            return;
        }
        let t = this.moveTimer;
        this.worldPos.x = t * this.pos.x + (1 - t) * this.target.x;
        this.worldPos.y = t * this.pos.y + (1 - t) * this.target.y;
        this.worldPos.x *= this.width;
        this.worldPos.y *= this.height;
    }
    use(c) {
        c.moveTo(-Math.round(this.worldPos.x), -Math.round(this.worldPos.y));
    }
    ;
}
const determineGeneratedColletibleId = (p = 1.0) => {
    const PROB = [0.7, 0.2, 0.1];
    if (Math.random() > p)
        return -1;
    let v = Math.random() * 1.0;
    let q = PROB[0];
    for (let i = 1; i < PROB.length; ++i) {
        if (v < q) {
            return i - 1;
        }
        q += PROB[i];
    }
    return PROB.length - 1;
};
class Collectible extends CollisionObject {
    constructor() {
        super(0, 0);
        this.exist = false;
        this.spr = new Sprite(16, 16);
        this.hitbox = new Vector2(10, 10);
    }
    outsideCameraEvent() {
        this.exist = false;
        this.dying = false;
    }
    spawn(id, x, y) {
        this.pos = new Vector2(x, y);
        this.id = id;
        this.spr.setFrame(this.id, 0);
        this.exist = true;
    }
    playerCollision(pl, ev) {
        const HEALTH_RECOVERY = 2;
        if (!this.exist || !this.inCamera)
            return;
        if (this.overlayObject(pl)) {
            this.exist = false;
            switch (this.id) {
                case 0:
                    pl.addGemStones(1);
                    break;
                case 1:
                    pl.recoverHealth(HEALTH_RECOVERY);
                    break;
                case 2:
                    pl.addBullets(1);
                    break;
                default:
                    break;
            }
            return true;
        }
        return false;
    }
    draw(c) {
        if (!this.exist || !this.inCamera)
            return;
        c.drawSprite(this.spr, c.getBitmap("pickups"), this.pos.x - this.spr.width / 2, this.pos.y - this.spr.height / 2);
    }
}
class Enemy extends CollisionObject {
    constructor(x, y, row, health) {
        super(x, y);
        this.startPos = this.pos.clone();
        this.shift = new Vector2();
        this.spr = new Sprite(16, 16);
        this.spr.setFrame(0, row);
        this.swordHitId = -2;
        this.magicHitId = -2;
        this.flip = Flip.None;
        this.shadowType = 0;
        this.friction = new Vector2(0.1, 0.1);
        this.radius = 6;
        this.damage = 1;
        this.mass = 1;
        this.health = health;
        this.maxHealth = this.health;
        this.avoidWater = true;
        this.damageBox = new Vector2(this.spr.width, this.spr.height);
        this.hurtTimer = 0;
        this.canBeReset = false;
    }
    passGenerators(flyingText, collectibles, bullets) {
        this.flyingText = flyingText;
        this.collectibles = collectibles;
        this.bullets = bullets;
        return this;
    }
    reset() { }
    outsideCameraEvent() {
        if (this.canBeReset) {
            this.stopMovement();
            this.pos = this.startPos.clone();
            this.health = this.maxHealth;
            this.canBeReset = false;
            this.reset();
        }
    }
    isActive() {
        return this.inCamera && this.exist && !this.dying;
    }
    updateAI(ev) { }
    playerEvent(pl, ev) { }
    die(ev) {
        const DEATH_SPEED = 6.0;
        this.spr.animate(0, 0, 4, DEATH_SPEED, ev.step);
        return this.spr.getColumn() == 4;
    }
    updateLogic(ev) {
        if (this.hurtTimer > 0)
            this.hurtTimer -= ev.step;
        this.updateAI(ev);
        this.canBeReset = true;
    }
    draw(c) {
        if (!this.exist || !this.inCamera)
            return;
        let shadow = c.getBitmap("shadow");
        let px = Math.round(this.pos.x);
        let py = Math.round(this.pos.y);
        c.setGlobalAlpha(0.67);
        c.drawBitmapRegion(shadow, this.shadowType * 16, 0, 16, 8, px - 8, py - 4);
        c.setGlobalAlpha();
        px += this.shift.x | 0;
        py += this.shift.y | 0;
        if (this.hurtTimer > 0 &&
            Math.round(this.hurtTimer / 4) % 2 != 0)
            return;
        let xoff = this.spr.width / 2;
        let yoff = 7 + this.spr.height / 2;
        c.drawSprite(this.spr, c.getBitmap("enemies"), px - xoff, py - yoff, this.flip);
    }
    killEvent(ev) { }
    kill(ev) {
        const COLLECTIBLE_PROBABILITY = 0.5;
        const COL_OFFSET_Y = -4;
        this.hurtTimer = 0;
        this.dying = true;
        this.flip = Flip.None;
        this.killEvent(ev);
        let collectibleType = determineGeneratedColletibleId(COLLECTIBLE_PROBABILITY);
        if (collectibleType >= 0) {
            this.collectibles.next().spawn(collectibleType, this.pos.x, this.pos.y + COL_OFFSET_Y);
        }
    }
    takeDamage(dmg, dir, ev) {
        const HURT_TIME = 30;
        const DAMAGE_TEXT_SPEED = -1.0;
        const KNOCKBACK_SPEED = 1.0;
        if ((this.health -= dmg) <= 0) {
            this.kill(ev);
        }
        else {
            this.speed.x = dir.x * KNOCKBACK_SPEED * this.mass;
            this.speed.y = dir.y * KNOCKBACK_SPEED * this.mass;
            this.hurtTimer = HURT_TIME;
        }
        this.flyingText.next().spawn(dmg, this.pos.x, this.pos.y - this.spr.height + 1, 0, DAMAGE_TEXT_SPEED, 1);
    }
    playerCollision(pl, ev) {
        const SPIN_ATTACK_KNOCKBACK_BONUS = 1.5;
        if (!this.isActive())
            return false;
        let cx = this.pos.x;
        let cy = this.pos.y - this.spr.height / 2 + 1;
        this.playerEvent(pl, ev);
        pl.hurtCollision(this.pos.x - this.hitbox.x / 2, this.pos.y - this.hitbox.y / 2, this.hitbox.x, this.hitbox.y, this.damage, Vector2.direction(pl.getPos(), this.pos), ev);
        if (pl.getSwordHitId() > this.swordHitId &&
            pl.attackCollisionCheck(cx - this.damageBox.x / 2, cy - this.damageBox.y / 2, this.damageBox.x, this.damageBox.y)) {
            this.swordHitId = pl.getSwordHitId();
            this.takeDamage(pl.getSwordDamage(), pl.isSpinning() ?
                Vector2.scalarMultiply(Vector2.direction(pl.getPos(), this.pos), SPIN_ATTACK_KNOCKBACK_BONUS) :
                pl.getFaceDirection(), ev);
            return true;
        }
        return false;
    }
    bulletCollision(b, ev) {
        if (!this.isActive() || !b.doesExist() || !b.isFriendly())
            return false;
        let cx = this.pos.x;
        let cy = this.pos.y - this.spr.height / 2 + 1;
        if (!b.isDying() &&
            boxOverlay(b.getPos(), new Vector2(), b.getHitbox(), cx - this.damageBox.x / 2, cy - this.damageBox.y / 2, this.damageBox.x, this.damageBox.y)) {
            b.kill(ev);
        }
        if (b.isDying() && b.doesIgnoreDeathOnCollision() &&
            b.getHitID() > this.magicHitId &&
            b.attackCollisionCheck(cx - this.damageBox.x / 2, cy - this.damageBox.y / 2, this.damageBox.x, this.damageBox.y)) {
            this.magicHitId = b.getHitID();
            this.takeDamage(b.getDamage(), Vector2.direction(b.getPos(), this.pos), ev);
            return true;
        }
        return false;
    }
    enemyToEnemyCollision(e) {
        if (!e.doesExist() || !this.exist ||
            !e.isInCamera() || !this.isInCamera ||
            e.isDying() || this.dying)
            return false;
        let dir;
        let dist = Vector2.distance(this.pos, e.pos);
        if (dist < this.radius + e.radius) {
            dist = this.radius + e.radius - dist;
            dir = Vector2.direction(e.pos, this.pos);
            this.pos.x += dir.x * dist / 2;
            this.pos.y += dir.y * dist / 2;
            e.pos.x -= dir.x * dist / 2;
            e.pos.y -= dir.y * dist / 2;
            return true;
        }
        return false;
    }
    shootBullet(id, dmg, x, y, speed, dir) {
        this.bullets.next().spawn(id, -1, dmg, x, y, speed * dir.x, speed * dir.y, false, this.pos);
    }
}
class EnemyContainer {
    constructor(types, flyingText, collectibles, bullets) {
        this.objects = new Array();
        this.types = Array.from(types);
        this.maxEnemyTypeIndex = this.types.length - 1;
        this.flyingText = flyingText;
        this.collectibles = collectibles;
        this.bullets = bullets;
    }
    initialCameraCheck(cam) {
        for (let o of this.objects) {
            o.cameraCheck(cam);
        }
    }
    spawnEnemy(type, x, y, flyingText, collectibles) {
        this.objects.push((new this.types[type].prototype.constructor(x, y, flyingText, collectibles)).passGenerators(this.flyingText, this.collectibles, this.bullets));
    }
    update(cam, stage, pl, bullets, ev) {
        for (let o of this.objects) {
            if (!o.doesExist())
                continue;
            o.cameraCheck(cam);
            if (!o.isInCamera())
                continue;
            stage.objectCollisions(o, cam, ev);
            o.playerCollision(pl, ev);
            o.update(ev);
            if (!o.isDying()) {
                for (let e of this.objects) {
                    o.enemyToEnemyCollision(e);
                }
                bullets.applyBooleanEvent((a, ev) => o.bulletCollision(a, ev), ev);
            }
        }
    }
    pushObjectsToArray(arr) {
        for (let o of this.objects) {
            arr.push(o);
        }
    }
}
const getEnemyList = () => [
    Slime, Bat, Spider, Fly,
    Spook, Fungus, FatFungus, Apple,
    SkullSlime,
];
class Slime extends Enemy {
    constructor(x, y) {
        super(x, y, 1, 5);
        this.shadowType = 1;
        this.spr.setFrame((Math.random() * 4) | 0, this.spr.getRow());
        this.friction = new Vector2(0.0125, 0.0125);
        this.dir = new Vector2(0, 1);
        this.radius = 4;
        this.damage = 2;
        this.hitbox = new Vector2(6, 4);
        this.collisionBox = this.hitbox.clone();
        this.damageBox = new Vector2(10, 10);
    }
    updateAI(ev) {
        const ANIM_SPEED = 12;
        const RUSH_SPEED = 0.5;
        let oldFrame = this.spr.getColumn();
        this.spr.animate(this.spr.getRow(), 0, 3, ANIM_SPEED, ev.step);
        if (oldFrame == 0 && this.spr.getColumn() != oldFrame) {
            this.speed = Vector2.scalarMultiply(this.dir, RUSH_SPEED);
            this.flip = this.speed.x < 0 ? Flip.None : Flip.Horizontal;
        }
    }
    playerEvent(pl, ev) {
        this.dir = Vector2.direction(this.pos, pl.getPos());
    }
    wallCollisionEvent(dirx, diry, ev) {
        if (Math.abs(dirx) > 0)
            this.speed.x *= -1;
        if (Math.abs(diry) > 0)
            this.speed.y *= -1;
    }
}
class Bat extends Enemy {
    constructor(x, y) {
        super(x, y, 2, 7);
        this.shadowType = 1;
        this.spr.setFrame((Math.random() * 4) | 0, this.spr.getRow());
        this.friction = new Vector2(0.025, 0.025);
        this.dir = new Vector2(0, 1);
        this.radius = 4;
        this.damage = 2;
        this.hitbox = new Vector2(6, 4);
        this.collisionBox = this.hitbox.clone();
        this.damageBox = new Vector2(10, 10);
        this.avoidWater = false;
    }
    updateAI(ev) {
        const ANIM_SPEED = 8;
        const MOVE_SPEED = 0.25;
        this.spr.animate(this.spr.getRow(), 0, 3, ANIM_SPEED, ev.step);
        this.target = Vector2.scalarMultiply(this.dir, MOVE_SPEED);
    }
    playerEvent(pl, ev) {
        this.dir = Vector2.direction(this.pos, pl.getPos());
    }
}
class Spider extends Enemy {
    constructor(x, y) {
        super(x, y, 3, 10);
        this.shadowType = 0;
        this.spr.setFrame(0, this.spr.getRow());
        this.mass = 1.5;
        this.friction = new Vector2(0.05, 0.05);
        this.dir = new Vector2(0, 1);
        this.radius = 5;
        this.damage = 3;
        this.hitbox = new Vector2(8, 6);
        this.collisionBox = this.hitbox.clone();
        this.damageBox = new Vector2(12, 10);
        this.moveTimer = Spider.MOVE_TIME / 2 + ((Math.random() * Spider.MOVE_TIME / 2) | 0);
        this.moving = false;
    }
    updateAI(ev) {
        const ANIM_SPEED = 6;
        const MOVE_SPEED = 0.75;
        let angle;
        if ((this.moveTimer -= ev.step) <= 0) {
            if (!this.moving) {
                angle = Math.random() * Math.PI * 2;
                this.dir = new Vector2(Math.cos(angle), Math.sin(angle));
                this.target = Vector2.scalarMultiply(this.dir, MOVE_SPEED);
            }
            this.moving = !this.moving;
            this.moveTimer += Spider.MOVE_TIME;
        }
        if (this.moving) {
            this.flip = this.target.x < 0 ? Flip.None : Flip.Horizontal;
            this.spr.animate(this.spr.getRow(), 0, 3, ANIM_SPEED, ev.step);
        }
        else {
            this.target.zeros();
            this.spr.setFrame(0, this.spr.getRow());
        }
    }
    wallCollisionEvent(dirx, diry, ev) {
        if (Math.abs(dirx) > 0) {
            this.target.x *= -1;
            this.speed.x *= -1;
        }
        if (Math.abs(diry) > 0) {
            this.target.y *= -1;
            this.speed.y *= -1;
        }
    }
}
Spider.MOVE_TIME = 60;
class Fly extends Enemy {
    constructor(x, y) {
        super(x, y, 4, 7);
        this.shadowType = 1;
        this.spr.setFrame(0, this.spr.getRow());
        this.mass = 1.0;
        this.friction = new Vector2(0.0125, 0.0125);
        this.dir = new Vector2(0, 1);
        this.radius = 5;
        this.damage = 2;
        this.hitbox = new Vector2(6, 3);
        this.collisionBox = this.hitbox.clone();
        this.damageBox = new Vector2(10, 10);
        this.moveTimer = Fly.WAIT_TIME / 2 + ((Math.random() * Fly.WAIT_TIME / 2) | 0);
        this.avoidWater = false;
        this.bounceFactor = 1.0;
    }
    updateAI(ev) {
        const ANIM_SPEED = 8;
        const ANIM_SPEED_MOD = 4;
        const RUSH_SPEED = 1.25;
        this.target.zeros();
        if ((this.moveTimer -= ev.step) <= 0) {
            this.speed = Vector2.scalarMultiply(this.dir, RUSH_SPEED);
            this.moveTimer += Fly.WAIT_TIME;
        }
        this.spr.animate(this.spr.getRow(), 0, 3, ANIM_SPEED - this.speed.length() * ANIM_SPEED_MOD, ev.step);
    }
    playerEvent(pl, ev) {
        this.dir = Vector2.direction(this.pos, pl.getPos());
    }
}
Fly.WAIT_TIME = 120;
class Spook extends Enemy {
    constructor(x, y) {
        super(x, y, 5, 10);
        this.shadowType = 1;
        this.spr.setFrame((Math.random() * 4) | 0, this.spr.getRow());
        this.friction = new Vector2(0.025, 0.025);
        this.dir = new Vector2(0, 1);
        this.radius = 4;
        this.damage = 3;
        this.hitbox = new Vector2(6, 4);
        this.collisionBox = this.hitbox.clone();
        this.damageBox = new Vector2(10, 10);
        this.avoidWater = false;
        this.disableCollisions = true;
        this.angleDif = Math.random() * Math.PI * 2;
    }
    updateAI(ev) {
        const ANIM_SPEED = 10;
        const MOVE_SPEED = 0.5;
        const ANGLE_DIF_SPEED = 0.025;
        this.spr.animate(this.spr.getRow(), 0, 3, ANIM_SPEED, ev.step);
        this.flip = this.speed.x < 0 ? Flip.None : Flip.Horizontal;
        this.angleDif = (this.angleDif + ANGLE_DIF_SPEED * ev.step) %
            (Math.PI * 2);
        this.target = Vector2.scalarMultiply(this.dir, MOVE_SPEED);
    }
    playerEvent(pl, ev) {
        const ORBIT_RADIUS = 32.0;
        let px = pl.getPos().x + Math.cos(this.angleDif) * ORBIT_RADIUS;
        let py = pl.getPos().y + Math.sin(this.angleDif) * ORBIT_RADIUS;
        this.dir = (new Vector2(px - this.pos.x, py - this.pos.y))
            .normalize(true);
    }
}
class CoreMushroom extends Enemy {
    constructor(x, y, row, bulletCount, bulletId, bulletAngle, shootTime, health) {
        super(x, y, row, health);
        this.bulletCount = bulletCount;
        this.bulletAngle = bulletAngle;
        this.bulletId = bulletId;
        this.shootTime = shootTime;
        this.shadowType = 1;
        this.spr.setFrame(0, this.spr.getRow());
        this.friction = new Vector2(0.05, 0.05);
        this.dir = new Vector2(0, 1);
        this.radius = 4;
        this.damage = 2;
        this.hitbox = new Vector2(6, 4);
        this.collisionBox = this.hitbox.clone();
        this.damageBox = new Vector2(10, 10);
        this.shootTimer = this.shootTime / 2 + Math.random() * this.shootTime / 2;
        this.shooting = false;
    }
    shootBullets(ev) {
        const BULLET_SPEED = 1.25;
        let startAngle = Math.atan2(this.dir.y, this.dir.x) - ((this.bulletCount / 2) | 0) * this.bulletAngle;
        let angle = startAngle;
        for (let i = 0; i < this.bulletCount; ++i) {
            angle = startAngle + i * this.bulletAngle;
            this.shootBullet(this.bulletId, 2, this.pos.x, this.pos.y - 4, BULLET_SPEED, new Vector2(Math.cos(angle), Math.sin(angle)));
        }
    }
    updateAI(ev) {
        const MOUTH_TIME = 20;
        if (!this.shooting) {
            this.flip = this.dir.x < 0 ? Flip.None : Flip.Horizontal;
            if ((this.shootTimer -= ev.step) <= 0.0) {
                this.shooting = true;
                this.spr.setFrame(1, this.spr.getRow());
                this.shootBullets(ev);
            }
        }
        else {
            this.spr.animate(this.spr.getRow(), 1, 0, MOUTH_TIME, ev.step);
            if (this.spr.getColumn() == 0) {
                this.shootTimer += this.shootTime;
                this.shooting = false;
            }
        }
    }
    playerEvent(pl, ev) {
        this.dir = Vector2.direction(this.pos, pl.getPos());
    }
}
class Fungus extends CoreMushroom {
    constructor(x, y) {
        super(x, y, 6, 1, 1, 0, 100, 10);
    }
}
class FatFungus extends CoreMushroom {
    constructor(x, y) {
        super(x, y, 7, 3, 2, Math.PI / 6.0, 100, 12);
        this.shadowType = 0;
    }
}
class Apple extends Enemy {
    constructor(x, y) {
        super(x, y, 8, 12);
        this.shadowType = 2;
        this.spr.setFrame((Math.random() * 4) | 0, this.spr.getRow());
        this.friction = new Vector2(0.025, 0.025);
        this.dir = new Vector2(0, 1);
        this.radius = 4;
        this.damage = 3;
        this.forward = true;
        this.hitbox = new Vector2(6, 4);
        this.collisionBox = this.hitbox.clone();
        this.damageBox = new Vector2(10, 10);
        this.avoidWater = false;
        this.waveTimer = Math.random() * Math.PI * 2;
        this.shootTimer = Apple.SHOOT_TIME / 2 + ((Math.random() * Apple.SHOOT_TIME / 2) | 0);
        this.mouthTimer = 0;
    }
    updateAI(ev) {
        const ANIM_SPEED = 4;
        const MOVE_SPEED = 0.33;
        const WAVE_SPEED = 0.10;
        const AMPLITUDE = 1;
        const BULLET_SPEED = 1.5;
        const MOUTH_TIME = 20;
        let start = this.mouthTimer > 0 ? 4 : 0;
        this.spr.animate(this.spr.getRow(), start, start + 3, ANIM_SPEED, ev.step);
        this.target = Vector2.scalarMultiply(this.dir, MOVE_SPEED * (this.forward ? 1 : -1));
        this.flip = this.dir.x < 0 ? Flip.None : Flip.Horizontal;
        this.waveTimer = (this.waveTimer + WAVE_SPEED * ev.step) % (Math.PI * 2);
        this.shift.y = Math.round(Math.sin(this.waveTimer) * AMPLITUDE);
        if (this.mouthTimer > 0) {
            if ((this.mouthTimer -= ev.step) <= 0) {
                this.spr.setFrame(this.spr.getColumn() - 4, this.spr.getRow(), true);
            }
        }
        if ((this.shootTimer -= ev.step) <= 0) {
            this.shootBullet(1, 2, this.pos.x, this.pos.y - 4, BULLET_SPEED, this.dir);
            this.shootTimer += Apple.SHOOT_TIME;
            this.mouthTimer = MOUTH_TIME;
            this.spr.setFrame(this.spr.getColumn() + 4, this.spr.getRow(), true);
        }
    }
    playerEvent(pl, ev) {
        this.dir = Vector2.direction(this.pos, pl.getPos());
        this.forward = !pl.isAttacking() && !pl.isReadyingSpinAttack();
    }
}
Apple.SHOOT_TIME = 120;
class SkullSlime extends Enemy {
    constructor(x, y) {
        super(x, y, 9, 10);
        this.shadowType = 1;
        this.spr.setFrame((Math.random() * 4) | 0, this.spr.getRow());
        this.friction = new Vector2(0.025, 0.025);
        this.dir = new Vector2(0, 1);
        this.radius = 4;
        this.damage = 3;
        this.hitbox = new Vector2(6, 4);
        this.collisionBox = this.hitbox.clone();
        this.damageBox = new Vector2(10, 10);
    }
    killEvent(ev) {
        const COUNT = 8;
        const BULLET_SPEED = 2.0;
        let angle;
        for (let i = 0; i < COUNT; ++i) {
            angle = Math.PI * 2 / COUNT * i;
            this.shootBullet(3, 2, this.pos.x, this.pos.y - 4, BULLET_SPEED, new Vector2(Math.cos(angle), Math.sin(angle)));
        }
    }
    updateAI(ev) {
        const ANIM_SPEED = 12;
        const RUSH_SPEED = 1.0;
        let oldFrame = this.spr.getColumn();
        this.spr.animate(this.spr.getRow(), 0, 3, ANIM_SPEED, ev.step);
        if (oldFrame == 0 && this.spr.getColumn() != oldFrame) {
            this.speed = Vector2.scalarMultiply(this.dir, RUSH_SPEED);
            this.flip = this.speed.x < 0 ? Flip.None : Flip.Horizontal;
        }
    }
    playerEvent(pl, ev) {
        this.dir = Vector2.direction(this.pos, pl.getPos());
    }
    wallCollisionEvent(dirx, diry, ev) {
        if (Math.abs(dirx) > 0)
            this.speed.x *= -1;
        if (Math.abs(diry) > 0)
            this.speed.y *= -1;
    }
}
var FlyingTextType;
(function (FlyingTextType) {
    FlyingTextType[FlyingTextType["PlayerDamage"] = 0] = "PlayerDamage";
    FlyingTextType[FlyingTextType["EnemyDamage"] = 1] = "EnemyDamage";
})(FlyingTextType || (FlyingTextType = {}));
const FLYING_TEXT_MOVE_TIME = 16;
const FLYING_TEXT_WAIT_TIME = 30;
class FlyingText extends CollisionObject {
    constructor() {
        super(0, 0);
        this.exist = false;
        this.message = "";
        this.waitTimer = 0;
        this.moveTimer = 0;
        this.friction = new Vector2(0.1, 0.1);
        this.inCamera = true;
    }
    updateLogic(ev) {
        if (this.moveTimer > 0) {
            if ((this.moveTimer -= ev.step) <= 0) {
                this.target.zeros();
            }
        }
        else {
            if ((this.waitTimer -= ev.step) <= 0) {
                this.exist = false;
            }
        }
    }
    translateString(str, jump) {
        let out = "";
        for (let i = 0; i < str.length; ++i) {
            out += String.fromCharCode(str.charCodeAt(i) + jump);
        }
        return out;
    }
    spawn(value, x, y, sx, sy, color = 0) {
        this.message = "-" + String(value);
        if ((color |= 0) > 0) {
            this.message = this.translateString(this.message, color * 16);
        }
        this.waitTimer = FLYING_TEXT_WAIT_TIME;
        this.moveTimer = FLYING_TEXT_MOVE_TIME;
        this.pos = new Vector2(x, y);
        this.speed = new Vector2(sx, sy);
        this.target = this.speed.clone();
        this.exist = true;
    }
    draw(c) {
        if (!this.exist)
            return;
        c.drawText(c.getBitmap("fontSmall"), this.message, Math.round(this.pos.x), Math.round(this.pos.y - 4), -2, 0, true);
    }
}
class Game {
    constructor(param, ev) {
        const MAP_WIDTH = 6;
        const MAX_HEIGHT = 8;
        this.status = new PlayerStatus(10, 5, 0, 300);
        this.objects = new ObjectManager(this.status);
        this.cam = new Camera(0, 0, 160, 128);
        this.stage = new Stage(MAP_WIDTH, MAX_HEIGHT, this.cam, ev);
        this.objects.generateObjects(this.stage);
        this.objects.initialize(this.cam);
        this.paused = false;
    }
    refresh(ev) {
        if (ev.getAction("start") == State.Pressed)
            this.paused = !this.paused;
        if (this.paused)
            return;
        this.cam.update(ev);
        if (this.cam.isMoving()) {
            this.objects.cameraMovement(this.cam, ev);
            return;
        }
        this.stage.update(this.cam, ev);
        this.objects.update(this.cam, this.stage, ev);
        if (this.status.update(ev)) {
        }
    }
    drawHUD(c) {
        const TEXT_Y = 133;
        let font = c.getBitmap("font");
        let hud = c.getBitmap("hud");
        c.drawBitmapRegion(hud, 0, 0, 160, 16, 0, 128);
        let x = 4;
        c.drawBitmapRegion(font, 24, 0, 8, 8, x, TEXT_Y);
        c.drawText(font, String(this.status.getHealth()) + "/" + String(this.status.getMaxHealth()), x + 9, TEXT_Y, -1, 0);
        x = 56;
        c.drawBitmapRegion(font, 48, 0, 8, 8, x, TEXT_Y);
        c.drawText(font, createStringWithZeros(this.status.getBulletCount(), 2), x + 9, TEXT_Y, 0, 0);
        x = 88;
        c.drawBitmapRegion(font, 40, 0, 8, 8, x, TEXT_Y);
        c.drawText(font, createStringWithZeros(this.status.getGemCount(), 2), x + 9, TEXT_Y, 0, 0);
        x = 120;
        c.drawBitmapRegion(font, 32, 0, 8, 8, x, TEXT_Y);
        let str = genTimeString(this.status.getTime());
        c.drawText(font, str.substr(0, str.length - 2), x + 9, TEXT_Y, -2, 0);
        c.drawText(font, str.substr(str.length - 2, 2), x + 21, TEXT_Y, 0, 0);
    }
    redraw(c) {
        c.clear(170, 170, 170);
        this.stage.drawBackground(c, this.cam);
        this.cam.use(c);
        this.stage.draw(c, this.cam);
        this.objects.draw(c, this.stage);
        c.moveTo();
        this.drawHUD(c);
        if (this.paused) {
            c.setFillColor(0, 0, 0, 0.67);
            c.fillRect(0, 0, c.width, c.height);
            c.drawText(c.getBitmap("font"), "PAUSED", c.width / 2, c.height / 2 - 12, 0, 0, true);
        }
    }
    dispose() {
        return null;
    }
}
class ObjectGenerator {
    constructor(typeT) {
        this.objects = new Array();
        this.typeT = typeT;
    }
    next() {
        let o = null;
        for (let e of this.objects) {
            if (!e.doesExist()) {
                o = e;
                break;
            }
        }
        if (o == null) {
            this.objects.push(new this.typeT.prototype.constructor());
            o = this.objects[this.objects.length - 1];
        }
        return o;
    }
    update(cam, ev) {
        for (let o of this.objects) {
            if (cam != null)
                o.cameraCheck(cam);
            o.update(ev);
        }
    }
    stageCollisions(stage, cam, ev) {
        for (let o of this.objects) {
            stage.objectCollisions(o, cam, ev);
        }
    }
    applyBooleanEvent(f, ev) {
        let ret = false;
        for (let o of this.objects) {
            ret = ret || f(o, ev);
        }
        return ret;
    }
    draw(c) {
        for (let o of this.objects) {
            o.draw(c);
        }
    }
    postDraw(c) {
        for (let o of this.objects) {
            o.postDraw(c);
        }
    }
    pushObjectsToArray(arr) {
        for (let o of this.objects) {
            if (!o.doesExist() || !o.isInCamera())
                continue;
            arr.push(o);
        }
    }
}
class Leaf extends CollisionObject {
    constructor() {
        super(0, 0);
        this.exist = false;
        this.timer = 0;
        this.spr = new Sprite(8, 8);
        this.friction = new Vector2(0.01, 0.05);
    }
    spawn(id, x, y, speedx, speedy) {
        const TIME = 30;
        const BASE_GRAVITY = 2.0;
        this.pos = new Vector2(x, y);
        this.speed = new Vector2(speedx, speedy);
        this.target = new Vector2(0, BASE_GRAVITY);
        this.spr.setFrame((Math.random() * 4) | 0, id);
        this.timer = TIME;
        this.exist = true;
    }
    outsideCameraEvent() {
        this.exist = false;
        this.dying = false;
    }
    updateLogic(ev) {
        if ((this.timer -= ev.step) <= 0) {
            this.exist = false;
            this.dying = false;
        }
    }
    draw(c) {
        c.setFillColor(255, 0, 0);
        c.drawSprite(this.spr, c.getBitmap("leaves"), Math.round(this.pos.x) - 4, Math.round(this.pos.y) - 4);
    }
}
const setActions = (core) => {
    core.addInputAction("fire2", "KeyZ", 2)
        .addInputAction("fire3", "KeyX", 1)
        .addInputAction("fire1", "KeyC", 0)
        .addInputAction("start", "Enter", 9, 7)
        .addInputAction("back", "Escape", 8, 6)
        .addInputAction("select", "ShiftLeft", 4, 5);
};
const loadAssets = (core) => {
    const ROOM_MAP_COUNT = 9;
    [
        { name: "font", path: "assets/bitmaps/font.png" },
        { name: "player", path: "assets/bitmaps/player.png" },
        { name: "tileset", path: "assets/bitmaps/tileset.png" },
        { name: "shadow", path: "assets/bitmaps/shadow.png" },
        { name: "bullet", path: "assets/bitmaps/bullets.png" },
        { name: "leaves", path: "assets/bitmaps/leaves.png" },
        { name: "fontSmall", path: "assets/bitmaps/font_small.png" },
        { name: "enemies", path: "assets/bitmaps/enemies.png" },
        { name: "pickups", path: "assets/bitmaps/pickups.png" },
        { name: "hud", path: "assets/bitmaps/hud.png" }
    ].map(a => core.loadBitmap(a.name, a.path));
    [
        { name: "baseRoom", path: "assets/maps/base_room.tmx" },
        { name: "startRoom", path: "assets/maps/start_room.tmx" },
        { name: "collisions", path: "assets/maps/collisions.tmx" },
    ].map(a => core.loadTilemap(a.name, a.path));
    (new Array(ROOM_MAP_COUNT)).fill(null).map((a, i) => { return { name: "room" + String(i + 1), path: "assets/maps/" + String(i + 1) + ".tmx" }; })
        .map(a => core.loadTilemap(a.name, a.path));
};
window.onload = () => {
    let core = new Core(160, 144, 0);
    setActions(core);
    loadAssets(core);
    core.run(TitleScreen);
};
class ObjectManager {
    constructor(status) {
        this.bullets = new ObjectGenerator(Bullet);
        this.flyingText = new ObjectGenerator(FlyingText);
        this.collectibles = new ObjectGenerator(Collectible);
        this.player = new Player(80, 72, this.bullets, this.flyingText, status);
        this.enemies = new EnemyContainer(getEnemyList(), this.flyingText, this.collectibles, this.bullets);
        this.objectRenderBuffer = new Array();
    }
    generateObjects(stage) {
        stage.generateEnemies(this.enemies, this.flyingText, this.collectibles);
        stage.passCollectibleGenerator(this.collectibles);
    }
    initialize(cam) {
        this.player.setInitialPosition(cam);
    }
    cameraMovement(cam, ev) {
        this.enemies.initialCameraCheck(cam);
        this.player.cameraMovement(cam, ev);
    }
    update(cam, stage, ev) {
        this.player.update(ev);
        this.player.cameraEvent(cam);
        stage.objectCollisions(this.player, cam, ev);
        this.bullets.applyBooleanEvent((b, ev) => this.player.bulletCollision(b, ev), ev);
        this.bullets.update(cam, ev);
        this.bullets.stageCollisions(stage, cam, ev);
        this.enemies.update(cam, stage, this.player, this.bullets, ev);
        this.collectibles.update(cam, ev);
        this.collectibles.applyBooleanEvent((c, ev) => c.playerCollision(this.player, ev), ev);
        this.flyingText.update(null, ev);
    }
    draw(c, stage) {
        this.collectibles.draw(c);
        this.objectRenderBuffer.push(this.player);
        this.bullets.pushObjectsToArray(this.objectRenderBuffer);
        this.enemies.pushObjectsToArray(this.objectRenderBuffer);
        stage.pushLeavesToDrawBuffer(this.objectRenderBuffer);
        let sortedArray = this.objectRenderBuffer.sort((a, b) => (a.getCoordY() - b.getCoordY()));
        for (let o of sortedArray) {
            o.draw(c);
        }
        this.bullets.postDraw(c);
        this.flyingText.draw(c);
        this.objectRenderBuffer.length = 0;
    }
}
class Player extends CollisionObject {
    constructor(x, y, bullets, flyingText, status) {
        super(x, y);
        this.getSwordHitId = () => this.swordHitId;
        this.getSwordDamage = () => this.status.computeSwordDamage(this.spinning);
        this.getFaceDirection = () => this.faceDirection.clone();
        this.isSpinning = () => this.spinning;
        this.recoverHealth = (count) => this.status.recoverHealth(count);
        this.addGemStones = (count) => this.status.addGemStones(count);
        this.addBullets = (count) => this.status.addBullets(count);
        this.isAttacking = () => this.attacking || this.usingMagic;
        this.isRolling = () => this.rolling;
        this.isReadyingSpinAttack = () => this.readyingSpinAttack;
        this.spr = new Sprite(16, 16);
        this.spr.setFrame(0, 2);
        this.sprSword = new Sprite(16, 16);
        this.friction = new Vector2(0.1, 0.1);
        this.center = new Vector2();
        this.rolling = false;
        this.rollTimer = 0.0;
        this.faceDirection = new Vector2(0, 1);
        this.faceColumn = 0;
        this.attacking = false;
        this.usingMagic = false;
        this.flip = Flip.None;
        this.readyingSpinAttack = false;
        this.spinAttackTimer = 0.0;
        this.spinning = false;
        this.spinStartFrameReached = false;
        this.bullets = bullets;
        this.status = status;
        this.flyingText = flyingText;
        this.hitbox = new Vector2(10, 8);
        this.collisionBox = new Vector2(8, 4);
        this.swordHitId = -1;
        this.magicHitId = -1;
        this.swordHitbox = new Rect();
        this.damageBox = new Vector2(10, 10);
        this.knockbackTimer = 0;
        this.hurtTimer = 0;
    }
    startRolling(ev) {
        const ROLL_SPEED = 1.5;
        const ROLL_TIME = 30;
        if (ev.getAction("fire1") == State.Pressed) {
            this.speed = this.faceDirection.clone().scalarMultiply(ROLL_SPEED);
            this.target = this.speed.clone();
            this.rolling = true;
            this.rollTimer = ROLL_TIME;
            this.spr.setFrame(0, this.spr.getRow() + 3);
            return true;
        }
        return false;
    }
    computeSwordHitbox() {
        const WIDTH = 24;
        const HEIGHT = 14;
        let x = this.pos.x;
        let y = this.pos.y;
        let w = 0;
        let h = 0;
        switch (this.spr.getRow() % 3) {
            case 2:
                y -= this.spr.height + HEIGHT / 2;
            case 0:
                x -= WIDTH / 2;
                w = WIDTH;
                h = HEIGHT;
                break;
            case 1:
                y -= WIDTH / 2 + 3;
                if (this.flip == Flip.None)
                    x += this.spr.width / 2;
                else
                    x -= this.spr.width / 2 + HEIGHT;
                w = HEIGHT;
                h = WIDTH;
                break;
            default:
                break;
        }
        this.swordHitbox = new Rect(x, y, w, h);
    }
    swordAttack(ev) {
        if (ev.getAction("fire2") == State.Pressed) {
            this.stopMovement();
            this.spr.setFrame(0, this.spr.getRow() + 6);
            this.sprSword.setFrame(3, this.spr.getRow());
            this.attacking = true;
            ++this.swordHitId;
            this.computeSwordHitbox();
            return true;
        }
        return false;
    }
    useMagic(ev) {
        const MAGIC_SPEED = 2.0;
        const DIR_X = [0, -1, 0, 1];
        const DIR_Y = [1, 0, -1, 0];
        const XOFF = [0, -6, 0, 6];
        const YOFF = [0, -4, -8, -4];
        if (!this.readyingSpinAttack &&
            ev.getAction("fire3") == State.Pressed) {
            if (!this.status.reduceBullet(1))
                return false;
            this.stopMovement();
            this.spr.setFrame(1, this.spr.getRow() + 6);
            this.usingMagic = true;
            this.bullets.next().spawn(0, this.magicHitId++, this.status.computeMagicDamage(), this.pos.x + XOFF[this.faceColumn], this.pos.y + YOFF[this.faceColumn], DIR_X[this.faceColumn] * MAGIC_SPEED, DIR_Y[this.faceColumn] * MAGIC_SPEED, true, this.pos);
            return true;
        }
        return false;
    }
    handleSpinAttack(ev) {
        if ((ev.getAction("fire2") & State.DownOrPressed) == 0) {
            this.readyingSpinAttack = false;
            this.spinning = true;
            this.spinStartFrame = this.faceColumn;
            this.spinStartFrameReached = false;
            ++this.swordHitId;
            this.spr.setFrame(this.spinStartFrame, 9);
            this.stopMovement();
            return true;
        }
        return false;
    }
    control(ev) {
        const BASE_SPEED = 1.0;
        const EPS = 0.01;
        if (this.knockbackTimer > 0) {
            this.target.zeros();
            return;
        }
        if (this.rolling || this.attacking ||
            this.spinning || this.usingMagic)
            return;
        if (this.startRolling(ev) ||
            this.swordAttack(ev) ||
            this.useMagic(ev) ||
            (this.readyingSpinAttack && this.handleSpinAttack(ev)))
            return;
        this.target = ev.getStick().scalarMultiply(BASE_SPEED);
        if (this.target.length() > EPS) {
            this.faceDirection = Vector2.normalize(this.target);
        }
    }
    animateSwordFighting(ev) {
        const ATTACK_SPEED = 6;
        const ATTACK_FINAL_FRAME = 20;
        this.spr.animate(this.spr.getRow(), 0, 3, this.spr.getColumn() == 2 ? ATTACK_FINAL_FRAME : ATTACK_SPEED, ev.step);
        if (this.spr.getColumn() == 3 ||
            (this.spr.getColumn() == 2 &&
                this.spr.getTimer() >= ATTACK_SPEED &&
                (ev.getAction("fire2") & State.DownOrPressed) == 0)) {
            this.attacking = false;
            this.readyingSpinAttack = this.spr.getColumn() == 3;
        }
        else {
            this.sprSword.setFrame(this.spr.getColumn() + 3, this.spr.getRow());
        }
    }
    computeSpinAttackHitbox() {
        const RADIUS = 18;
        this.swordHitbox = new Rect(this.pos.x - RADIUS, this.pos.y - 4 - RADIUS, RADIUS * 2, RADIUS * 2);
    }
    animateSpinning(ev) {
        const SPIN_ATTACK_SPEED = 4;
        let row = 0;
        let oldFrame = this.spr.getColumn();
        this.flip = Flip.None;
        this.spr.animate(this.spr.getRow(), 0, 3, SPIN_ATTACK_SPEED, ev.step);
        if (!this.spinStartFrameReached &&
            oldFrame != this.spinStartFrame &&
            this.spr.getColumn() == this.spinStartFrame) {
            this.spinStartFrameReached = true;
        }
        if (this.spinStartFrameReached &&
            oldFrame == this.spinStartFrame &&
            this.spr.getColumn() != oldFrame) {
            this.spinning = false;
            if (this.spinStartFrame != 3) {
                row = this.spinStartFrame % 3;
            }
            else {
                row = 1;
            }
            this.spr.setFrame(0, row);
            this.flip = this.spinStartFrame == 1 ? Flip.Horizontal : Flip.None;
        }
        else {
            this.sprSword.setFrame(this.spr.getColumn() + 4, this.spr.getRow());
        }
        this.computeSpinAttackHitbox();
    }
    animateMagicCast(ev) {
        const MAGIC_TIME = 20;
        this.spr.animate(this.spr.getRow(), 1, 2, MAGIC_TIME, ev.step);
        if (this.spr.getColumn() == 2) {
            this.usingMagic = false;
            this.spr.setFrame(0, this.spr.getRow() % 3);
        }
    }
    reverseRolling() {
        let newRow = 0;
        switch (this.spr.getRow() % 3) {
            case 0:
                newRow = 2;
                break;
            case 1:
                newRow = 0;
                this.flip = this.flip == Flip.Horizontal ? Flip.None : Flip.Horizontal;
                break;
            case 2:
                newRow = -2;
                break;
            default:
                break;
        }
        this.spr.setFrame(this.spr.getColumn(), this.spr.getRow() + newRow, true);
        this.faceColumn = newRow == 1 ? 3 : newRow;
        let dirx = 0;
        let diry = 0;
        switch (this.spr.getRow() % 3) {
            case 0:
                diry = 1;
                break;
            case 1:
                dirx = this.flip == Flip.None ? 1 : -1;
                break;
            case 2:
                diry = -1;
                break;
            default: break;
        }
        this.faceDirection = new Vector2(dirx, diry);
    }
    animate(ev) {
        const EPS = 0.01;
        const BASE_RUN_SPEED = 12;
        const RUN_SPEED_MOD = 5;
        const ROLL_SPEED = 4;
        if (this.knockbackTimer > 0)
            return;
        if (this.usingMagic) {
            this.animateMagicCast(ev);
            return;
        }
        if (this.spinning) {
            this.animateSpinning(ev);
            return;
        }
        if (this.attacking) {
            this.animateSwordFighting(ev);
            return;
        }
        if (this.rolling) {
            this.spr.animate(this.spr.getRow(), 0, 3, ROLL_SPEED, ev.step);
            return;
        }
        let row = this.spr.getRow() % 3;
        let animSpeed = 0;
        if (this.target.length() > EPS) {
            if (Math.abs(this.target.y) > Math.abs(this.target.x)) {
                row = this.target.y > 0 ? 0 : 2;
                this.flip = Flip.None;
                this.faceColumn = row;
            }
            else {
                row = 1;
                this.flip = this.target.x > 0 ? Flip.None : Flip.Horizontal;
                this.faceColumn = this.target.x > 0 ? 3 : 1;
            }
            animSpeed = BASE_RUN_SPEED - RUN_SPEED_MOD * this.speed.length();
            this.spr.animate(row, 0, 3, animSpeed, ev.step);
        }
        else {
            this.spr.setFrame(0, row, true);
        }
    }
    updateTimers(ev) {
        const MINIMUM_ROLL_TIME = 10;
        const MAX_SPIN_ATTACK_TIME = 8;
        if (this.rollTimer > 0.0) {
            if ((ev.getAction("fire1") & State.DownOrPressed) == 0) {
                this.rollTimer = Math.min(this.rollTimer, MINIMUM_ROLL_TIME);
            }
            this.rollTimer -= ev.step;
            if (this.rollTimer <= 0) {
                this.rollTimer = 0;
                this.rolling = false;
            }
        }
        if (this.readyingSpinAttack) {
            this.spinAttackTimer = (this.spinAttackTimer + ev.step) % MAX_SPIN_ATTACK_TIME;
        }
        if (this.knockbackTimer > 0) {
            if ((this.knockbackTimer -= ev.step) <= 0) {
                this.spr.setFrame(0, this.spr.getColumn());
            }
        }
        if (this.hurtTimer > 0) {
            this.hurtTimer -= ev.step;
        }
    }
    updateProperties(ev) {
        this.bounceFactor = this.rolling ? 1 : 0;
        this.enableCameraCollision = this.knockbackTimer > 0.0;
    }
    wallCollisionEvent(dirx, diry, ev) {
        const EPS = 0.01;
        if (this.rolling) {
            this.reverseRolling();
            if (Math.abs(dirx) > EPS)
                this.target.x = Math.sign(this.speed.x) * Math.abs(this.target.x);
            if (Math.abs(diry) > EPS)
                this.target.y = Math.sign(this.speed.y) * Math.abs(this.target.y);
        }
    }
    updateLogic(ev) {
        this.control(ev);
        this.updateTimers(ev);
        this.animate(ev);
        this.updateProperties(ev);
    }
    drawSword(c) {
        let px = Math.round(this.pos.x);
        let py = Math.round(this.pos.y);
        let dir = this.flip == Flip.None ? 1 : -1;
        let frame = this.sprSword.getColumn() - 3;
        switch (this.spr.getRow() % 3) {
            case 0:
                c.drawSprite(this.sprSword, c.getBitmap("player"), px - 16 + frame * 8, py - 4);
                break;
            case 1:
                c.drawSprite(this.sprSword, c.getBitmap("player"), px + 3 - (dir < 0 ? 22 : 0), py - 16 + frame * 4, this.flip);
                break;
            case 2:
                c.drawSprite(this.sprSword, c.getBitmap("player"), px - frame * 8, py - 22);
                break;
            default:
                break;
        }
    }
    drawSwordSpinAttack(c) {
        const POS_X = [-15, -16, 0, -1];
        const POS_Y = [-6, -20, -20, -6];
        let px = Math.round(this.pos.x);
        let py = Math.round(this.pos.y);
        c.drawSprite(this.sprSword, c.getBitmap("player"), px + POS_X[this.spr.getColumn()], py + POS_Y[this.spr.getColumn()]);
    }
    draw(c) {
        let shadow = c.getBitmap("shadow");
        let px = Math.round(this.pos.x);
        let py = Math.round(this.pos.y);
        let xoff = this.spr.width / 2;
        let yoff = 7 + this.spr.height / 2;
        c.setGlobalAlpha(0.67);
        c.drawBitmapRegion(shadow, 0, 0, 16, 8, px - 8, py - 4);
        c.setGlobalAlpha();
        if (this.hurtTimer > 0 &&
            this.knockbackTimer <= 0 &&
            Math.round(this.hurtTimer / 4) % 2 != 0)
            return;
        if (this.attacking && this.spr.getRow() % 3 > 0) {
            this.drawSword(c);
        }
        else if (this.spinning && this.spr.getColumn() % 3 != 0) {
            this.drawSwordSpinAttack(c);
        }
        let column = this.spr.getColumn();
        if (this.readyingSpinAttack &&
            Math.floor(this.spinAttackTimer / 4) % 2 == 0) {
            column += 6;
        }
        c.drawSpriteFrame(this.spr, c.getBitmap("player"), column, this.spr.getRow(), px - xoff, py - yoff, this.flip);
        if (this.attacking && this.spr.getRow() % 3 == 0) {
            this.drawSword(c);
        }
        else if (this.spinning && this.spr.getColumn() % 3 == 0) {
            this.drawSwordSpinAttack(c);
        }
    }
    cameraEvent(cam) {
        const CAM_SPEED = 1.0 / 20.0;
        if (this.knockbackTimer > 0)
            return;
        let topLeft = cam.getWorldPos();
        let mx = 0;
        let my = 0;
        let move = false;
        if (this.pos.y + this.hitbox.y / 2 >= topLeft.y + cam.height) {
            my = 1;
            move = true;
        }
        else if (this.pos.y - this.hitbox.y / 2 <= topLeft.y) {
            my = -1;
            move = true;
        }
        else if (this.pos.x + this.hitbox.x / 2 >= topLeft.x + cam.width) {
            mx = 1;
            move = true;
        }
        else if (this.pos.x - this.hitbox.x / 2 <= topLeft.x) {
            mx = -1;
            move = true;
        }
        if (move) {
            cam.move(mx, my, CAM_SPEED);
        }
    }
    cameraMovement(cam, ev) {
        let speed = cam.getSpeed() * 2;
        let dir = cam.getDirection();
        let moveMod = Math.abs(dir.y) > Math.abs(dir.x) ? cam.width / cam.height : 1;
        speed *= moveMod;
        this.pos.x += dir.x * speed * this.hitbox.x / 2 * ev.step;
        this.pos.y += dir.y * speed * this.hitbox.y / 2 * ev.step;
        this.animate(ev);
    }
    setInitialPosition(cam) {
        const YOFF = 40;
        let x = cam.getWorldPos().x + cam.width / 2;
        let y = cam.getWorldPos().y + cam.height / 2 + YOFF;
        this.pos = new Vector2(x, y);
        this.faceDirection = new Vector2(0, -1);
        this.faceColumn = 2;
    }
    attackCollisionCheck(x, y, w, h, type = 0) {
        return type == 0 &&
            (this.attacking || this.spinning) &&
            boxOverlayRect(this.swordHitbox, x, y, w, h);
    }
    hurt(dmg, knockback, ev) {
        const HURT_TIME = 60;
        const KNOCKBACK_TIME = 30;
        const KNOCKBACK_SPEED = 2.25;
        const DAMAGE_TEXT_SPEED = -1.0;
        if (this.hurtTimer > 0)
            return;
        this.hurtTimer = HURT_TIME;
        let column;
        if (knockback != null) {
            this.knockbackTimer = KNOCKBACK_TIME;
            this.speed.x = -KNOCKBACK_SPEED * knockback.x;
            this.speed.y = -KNOCKBACK_SPEED * knockback.y;
            column = 0;
            if (Math.abs(this.speed.y) > Math.abs(this.speed.x)) {
                column = this.speed.y > 0.0 ? 2 : 0;
                this.flip = Flip.None;
            }
            else {
                column = 1;
                this.flip = this.speed.x < 0 ? Flip.None : Flip.Horizontal;
            }
            this.spr.setFrame(column, 10);
            this.attacking = false;
            this.usingMagic = false;
            this.readyingSpinAttack = false;
            this.spinAttackTimer = 0;
            this.spinning = false;
            this.rolling = false;
        }
        this.status.reduceHealth(dmg);
        this.flyingText.next()
            .spawn(dmg, this.pos.x, this.pos.y - this.spr.height, 0, DAMAGE_TEXT_SPEED);
    }
    hurtCollision(x, y, w, h, dmg, knockback, ev) {
        if (this.hurtTimer > 0 || this.rolling)
            return false;
        if (boxOverlay(this.pos, this.center, this.collisionBox, x, y, w, h)) {
            this.hurt(dmg, knockback, ev);
            return true;
        }
        return false;
    }
    bulletCollision(b, ev) {
        if (!b.doesExist() || b.isDying() || b.isFriendly())
            return false;
        if (this.hurtTimer > 0 || this.rolling)
            return false;
        let p = b.getPos();
        let hbox = b.getHitbox();
        if (boxOverlay(new Vector2(this.pos.x, this.pos.y - this.spr.height / 2 + 1), this.center, this.damageBox, p.x - hbox.x / 2, p.y - hbox.y / 2, hbox.x, hbox.y)) {
            this.hurt(b.getDamage(), null, ev);
            b.kill(ev);
            return true;
        }
        return false;
    }
}
const WALL_LEFT = 0;
const WALL_RIGHT = 1;
const WALL_DOWN = 2;
const WALL_UP = 3;
let getOppositeDirection = (dir) => [1, 0, 3, 2][dir];
class Room {
    constructor(left, right, down, up) {
        this.walls = [left, right, down, up];
    }
    getOverlayingTile(tmap, x, y) {
        let tid = 0;
        for (let i = 3; i >= 0 && tid == 0; --i) {
            if (this.walls[i]) {
                tid = tmap.getTile(i + 1, x, y);
                if (tid != 0)
                    return tid;
            }
        }
        return tmap.getTile(0, x, y);
    }
    getWall(i) {
        if (i < 0 || i >= this.walls.length)
            return false;
        return this.walls[i];
    }
    toggleWall(i, state) {
        if (i < 0 || i >= this.walls.length)
            return;
        this.walls[i] = state;
    }
}
class RoomMap {
    constructor(w, h) {
        this.getRoom = (x, y) => this.rooms[y * this.width + x];
        this.getStartPos = () => this.startPos.clone();
        const MAX_NTH_ITERATION = 1000;
        this.width = w;
        this.height = h;
        this.startPos = new Vector2(((Math.random() * w) | 0), h - 1);
        this.rooms = this.initilWalls();
        this.genRandomWalls();
        let i = 0;
        while (!this.fixWallMap()) {
            if (++i == MAX_NTH_ITERATION)
                throw "Endless loop detected in the map generation!";
        }
    }
    initilWalls() {
        let w = this.width;
        let h = this.height;
        return (new Array(w * h))
            .fill(null)
            .map((a, i) => new Room(i % w == 0, i % w == w - 1, ((i / w) | 0) == h - 1, i < w));
    }
    genRandomWalls() {
        let room;
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                room = this.getRoom(x, y);
                if (x > 0)
                    room.toggleWall(WALL_LEFT, this.getRoom(x - 1, y).getWall(WALL_RIGHT));
                if (y > 0)
                    room.toggleWall(WALL_UP, this.getRoom(x, y - 1).getWall(WALL_DOWN));
                if (x < this.width - 1)
                    room.toggleWall(WALL_RIGHT, Math.random() >= 0.5);
                if (y < this.height - 1)
                    room.toggleWall(WALL_DOWN, Math.random() >= 0.5);
            }
        }
    }
    genReachArray() {
        let out = (new Array(this.width * this.height)).fill(false);
        out[this.startPos.y * this.width + this.startPos.x] = true;
        let room;
        let count = 0;
        let newRoomVisited = false;
        do {
            count = 0;
            newRoomVisited = false;
            for (let y = 0; y < this.height; ++y) {
                for (let x = 0; x < this.width; ++x) {
                    if (out[y * this.width + x]) {
                        ++count;
                        continue;
                    }
                    room = this.getRoom(x, y);
                    if ((x < this.width - 1 && !room.getWall(WALL_RIGHT) && out[y * this.width + (x + 1)]) ||
                        (x > 0 && !room.getWall(WALL_LEFT) && out[y * this.width + (x - 1)]) ||
                        (y < this.height - 1 && !room.getWall(WALL_DOWN) && out[(y + 1) * this.width + x]) ||
                        (y > 0 && !room.getWall(WALL_UP) && out[(y - 1) * this.width + x])) {
                        out[y * this.width + x] = true;
                        newRoomVisited = true;
                    }
                }
            }
        } while (newRoomVisited);
        return [out, count];
    }
    checkAdjacentRoom(x, y, dir, reached) {
        const DIR_X = [-1, 1, 0, 0];
        const DIR_Y = [0, 0, 1, -1];
        let dx = x + DIR_X[dir];
        let dy = y + DIR_Y[dir];
        if (dx < 0 || dy < 0 || dx >= this.width || dy >= this.height)
            return false;
        if (!reached[dy * this.width + dx])
            return false;
        this.getRoom(x, y).toggleWall(dir, false);
        this.getRoom(dx, dy).toggleWall(getOppositeDirection(dir), false);
        return true;
    }
    fixWallMap() {
        let [reached, count] = this.genReachArray();
        if (count >= this.width * this.height)
            return true;
        let startDir = (Math.random() * 4) | 0;
        let dir = 0;
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                if (reached[y * this.width + x])
                    continue;
                dir = startDir;
                while (!this.checkAdjacentRoom(x, y, dir, reached)) {
                    dir = (dir + 1) % 4;
                    if (dir == startDir)
                        break;
                }
            }
        }
        return false;
    }
    cloneRoomArray() {
        return Array.from(this.rooms);
    }
}
const ROOM_WIDTH = 10;
const ROOM_HEIGHT = 8;
const COL_DOWN = 0b0001;
const COL_WALL_LEFT = 0b0010;
const COL_WALL_RIGHT = 0b0100;
const COL_UP = 0b1000;
const COLLISION_TABLE = [
    COL_DOWN,
    COL_WALL_RIGHT,
    COL_UP,
    COL_WALL_LEFT,
    COL_DOWN | COL_UP,
    COL_WALL_LEFT | COL_WALL_RIGHT,
    COL_WALL_LEFT | COL_DOWN,
    COL_WALL_RIGHT | COL_DOWN,
    COL_WALL_RIGHT | COL_UP,
    COL_WALL_LEFT | COL_UP,
    COL_WALL_LEFT | COL_DOWN | COL_WALL_RIGHT,
    COL_WALL_RIGHT | COL_DOWN | COL_UP,
    COL_WALL_LEFT | COL_UP | COL_WALL_RIGHT,
    COL_WALL_LEFT | COL_DOWN | COL_UP,
    COL_WALL_LEFT | COL_DOWN | COL_WALL_RIGHT | COL_UP,
];
class Stage {
    constructor(roomCountX, roomCountY, cam, ev) {
        this.collisionMap = ev.getTilemap("collisions");
        this.width = ROOM_WIDTH * roomCountX;
        this.height = ROOM_HEIGHT * roomCountY;
        this.roomCountX = roomCountX;
        this.roomCountY = roomCountY;
        this.baseLayer = new Array(this.width * this.height);
        let baseRoom = ev.getTilemap("baseRoom");
        let roomMap = new RoomMap(roomCountX, roomCountY);
        this.rooms = roomMap.cloneRoomArray();
        this.startPos = roomMap.getStartPos();
        cam.setPos(this.startPos.x, this.startPos.y);
        this.roomMapCount = this.computeRoomMapCount(ev);
        let wallData;
        let roomData;
        for (let y = 0; y < roomCountY; ++y) {
            for (let x = 0; x < roomCountX; ++x) {
                if (x == this.startPos.x && y == this.startPos.y) {
                    roomData = ev.getTilemap("startRoom");
                    wallData = roomData;
                }
                else {
                    wallData = baseRoom;
                    roomData = ev.getTilemap("room" + String(1 + (Math.random() * this.roomMapCount) | 0));
                }
                this.buildRoom(x, y, this.rooms[y * roomCountX + x], wallData, roomData);
            }
        }
        this.leaves = new ObjectGenerator(Leaf);
        this.sprWater = new Sprite(16, 16);
        this.waterPos = 0;
        this.computePreservedTiles();
    }
    computeRoomMapCount(ev) {
        let num = 0;
        for (;; ++num) {
            if (ev.getTilemap("room" + String(1 + num)) == null)
                break;
        }
        return num;
    }
    passCollectibleGenerator(gen) {
        this.collectibles = gen;
    }
    isTileFree(x, y) {
        let noCollision = this.getTile(x, y) <= 0 ||
            this.collisionMap.getIndexedTile(0, this.getTile(x, y) - 1) <= 0;
        let modx = x % ROOM_WIDTH;
        let mody = y % ROOM_HEIGHT;
        let noDoor = !(modx >= 4 && modx <= 5 && (mody < 2 || mody >= ROOM_HEIGHT - 2)) &&
            !(mody >= 3 && mody <= 4 && (modx < 2 || modx >= ROOM_WIDTH - 2));
        return noCollision && noDoor;
    }
    computePreservedTiles() {
        this.preservedTiles = new Array(this.width * this.height);
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                this.preservedTiles[y * this.width + x] = !this.isTileFree(x, y);
            }
        }
    }
    buildRoom(roomX, roomY, r, wallMap, decorationMap) {
        let dx = roomX * ROOM_WIDTH;
        let dy = roomY * ROOM_HEIGHT;
        let tid = 0;
        let m;
        for (let y = 0; y < ROOM_HEIGHT; ++y) {
            for (let x = 0; x < ROOM_WIDTH; ++x) {
                m = (x == 0 || y == 0 ||
                    x == ROOM_WIDTH - 1 || y == ROOM_HEIGHT - 1) ?
                    wallMap : decorationMap;
                tid = r.getOverlayingTile(m, x, y);
                this.baseLayer[(dy + y) * this.width + (dx + x)] = tid;
            }
        }
    }
    getTile(x, y) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height)
            return -1;
        return this.baseLayer[y * this.width + x];
    }
    update(cam, ev) {
        const WATER_ANIM_SPEED = 20;
        const WATER_SPEED = 0.1;
        this.sprWater.animate(0, 0, 3, WATER_ANIM_SPEED, ev.step);
        this.leaves.update(cam, ev);
        this.waterPos = (this.waterPos + WATER_SPEED * ev.step) % 16;
    }
    drawBackground(c, cam) {
        let shiftx = -cam.getWorldPos().x % 16;
        let shifty = -cam.getWorldPos().y % 16;
        let bmp = c.getBitmap("tileset");
        let pos = this.waterPos | 0;
        for (let y = -1; y < ROOM_HEIGHT + 2; ++y) {
            for (let x = -1; x < ROOM_WIDTH + 2; ++x) {
                c.drawBitmapRegion(bmp, 48 + this.sprWater.getColumn() * 16, 96, 16, 16, x * 16 + shiftx - pos, y * 16 + shifty + pos);
            }
        }
    }
    draw(c, cam) {
        const OMIT = [114];
        let tid;
        let sx, sy;
        let bmp = c.getBitmap("tileset");
        let startx = ((cam.getWorldPos().x / 16) | 0) - 1;
        let starty = ((cam.getWorldPos().y / 16) | 0) - 1;
        let endx = startx + ROOM_WIDTH + 2;
        let endy = starty + ROOM_HEIGHT + 2;
        for (let y = starty; y <= endy; ++y) {
            for (let x = startx; x <= endx; ++x) {
                tid = this.getTile(x, y);
                if (tid <= 0 || OMIT.includes(tid))
                    continue;
                --tid;
                sx = tid % 16;
                sy = (tid / 16) | 0;
                c.drawBitmapRegion(bmp, sx * 16, sy * 16, 16, 16, x * 16, y * 16);
            }
        }
    }
    pushLeavesToDrawBuffer(buffer) {
        this.leaves.pushObjectsToArray(buffer);
    }
    handeTileCollision(o, x, y, colId, ev) {
        let c = COLLISION_TABLE[colId];
        if ((c & COL_DOWN) == COL_DOWN) {
            o.verticalCollision(x * 16, y * 16, 16, 1, ev);
        }
        if ((c & COL_UP) == COL_UP) {
            o.verticalCollision(x * 16, (y + 1) * 16, 16, -1, ev);
        }
        if ((c & COL_WALL_RIGHT) == COL_WALL_RIGHT) {
            o.horizontalCollision((x + 1) * 16, y * 16, 16, -1, ev);
        }
        if ((c & COL_WALL_LEFT) == COL_WALL_LEFT) {
            o.horizontalCollision(x * 16, y * 16, 16, 1, ev);
        }
    }
    spawnLeaves(x, y, count, id = 0) {
        const MAX_SPEED = 1.5;
        const MIN_SPEED = 0.5;
        const GRAVITY_BONUS = -1.0;
        const H_BONUS = 1.25;
        const ITEM_PROB = 0.5;
        let angle = 0;
        let angleStep = Math.PI * 2 / count;
        let sx, sy;
        let speed;
        for (let i = 0; i < count; ++i) {
            speed = Math.random() * (MAX_SPEED - MIN_SPEED) + MIN_SPEED;
            angle = angleStep * i;
            sx = Math.cos(angle) * speed * H_BONUS;
            sy = Math.sin(angle) * speed + GRAVITY_BONUS;
            this.leaves.next().spawn(id, x, y, sx, sy);
        }
        this.collectibles.next().spawn(determineGeneratedColletibleId(ITEM_PROB), x, y);
    }
    handleWaterHurtCollision(o, id, x, y, ev) {
        const BASE_HURT_DAMAGE = 2;
        const START_X = [4, 0, 0, 4, 0, 0, 4, 0, 0, 0, 4];
        const START_Y = [4, 4, 4, 0, 0, 0, 0, 0, 0, 4, 0];
        const WIDTH = [12, 16, 12, 12, 16, 12, 12, 16, 12, 16, 12];
        const HEIGHT = [12, 12, 12, 16, 16, 16, 12, 12, 12, 12, 16];
        if (o.doesAvoidWater()) {
            o.boxCollision(x * 16 + START_X[id], y * 16 + START_Y[id], WIDTH[id], HEIGHT[id], ev);
        }
        else {
            o.hurtCollision(x * 16 + START_X[id], y * 16 + START_Y[id], WIDTH[id], HEIGHT[id], BASE_HURT_DAMAGE, null, ev);
        }
    }
    handleSpecialTileCollision(o, x, y, colId, tid, ev) {
        const BUSH_OFFSET = 4;
        let t = colId - 16;
        if (t >= 16 && t < 32) {
            this.handleWaterHurtCollision(o, t - 16, x, y, ev);
            return;
        }
        switch (t) {
            case 0:
            case 1:
                if (o.attackCollisionCheck(x * 16 + BUSH_OFFSET, y * 16 + BUSH_OFFSET, 16 - BUSH_OFFSET * 2, 16 - BUSH_OFFSET * 2, t)) {
                    this.baseLayer[y * this.width + x] -= 16;
                    this.spawnLeaves(x * 16 + 8, y * 16 + 8, 6, clamp((tid / 32) | 0, 0, 1) + t * 2);
                }
                else {
                    this.handeTileCollision(o, x, y, 14, ev);
                }
                break;
            default:
                break;
        }
    }
    objectCollisions(o, cam, ev) {
        const RADIUS = 2;
        const CAM_COL_OFFSET = 2;
        if (!o.doesExist() || (!o.doesIgnoreDeathOnCollision() && o.isDying()))
            return;
        let px = Math.floor(o.getPos().x / 16);
        let py = Math.floor(o.getPos().y / 16);
        let tid, colId;
        for (let y = py - RADIUS; y <= py + RADIUS; ++y) {
            for (let x = px - RADIUS; x <= px + RADIUS; ++x) {
                tid = this.getTile(x, y);
                if (tid <= 0)
                    continue;
                colId = this.collisionMap.getIndexedTile(0, tid - 1);
                if (colId <= 0)
                    continue;
                if (colId <= 16)
                    this.handeTileCollision(o, x, y, colId - 1, ev);
                else
                    this.handleSpecialTileCollision(o, x, y, colId - 1, tid, ev);
            }
        }
        let topLeft;
        if (!cam.isMoving() && o.doesAllowCameraCollision()) {
            topLeft = cam.getWorldPos();
            o.verticalCollision(topLeft.x, topLeft.y + 128 - CAM_COL_OFFSET, 160, 1, ev, true);
            o.verticalCollision(topLeft.x, topLeft.y + CAM_COL_OFFSET, 160, -1, ev, true);
            o.horizontalCollision(topLeft.x + CAM_COL_OFFSET, topLeft.y, 128, -1, ev, true);
            o.horizontalCollision(topLeft.x + 160 - CAM_COL_OFFSET, topLeft.y, 128, 1, ev, true);
        }
    }
    genEnemiesToSingleRoom(enemies, dx, dy, minCount, maxCount, flyingText, collectibles) {
        let leftx = dx * ROOM_WIDTH + 1;
        let topy = dy * ROOM_HEIGHT + 1;
        let w = ROOM_WIDTH - 2;
        let h = ROOM_HEIGHT - 2;
        let px, py;
        let startx, starty;
        let count = minCount + ((Math.random() * ((maxCount + 1) - minCount)) | 0);
        let typeIndex;
        for (let i = 0; i < count; ++i) {
            typeIndex = ((Math.random() * (enemies.maxEnemyTypeIndex + 1)) | 0);
            startx = leftx + ((Math.random() * w) | 0);
            starty = topy + ((Math.random() * h) | 0);
            px = startx;
            py = starty;
            do {
                if (this.preservedTiles[py * this.width + px]) {
                    ++px;
                    if (px >= leftx + w) {
                        px = leftx;
                        ++py;
                        if (py >= topy + h)
                            py = topy;
                    }
                    continue;
                }
                enemies.spawnEnemy(typeIndex, px * 16 + 8, py * 16 + 8, flyingText, collectibles);
                this.preservedTiles[py * this.width + px] = true;
                break;
            } while (px != startx || py != starty);
        }
    }
    generateEnemies(enemies, flyingText, collectibles) {
        const MIN_ENEMY_COUNT = 1;
        const MAX_ENEMY_COUNT = 5;
        for (let y = 0; y < this.roomCountY; ++y) {
            for (let x = 0; x < this.roomCountX; ++x) {
                if (x == this.startPos.x &&
                    y == this.startPos.y)
                    continue;
                this.genEnemiesToSingleRoom(enemies, x, y, MIN_ENEMY_COUNT, MAX_ENEMY_COUNT, flyingText, collectibles);
            }
        }
    }
}
class PlayerStatus {
    constructor(initialHealth, initialBullets, initialGems, initialTime) {
        this.getHealth = () => this.health;
        this.getMaxHealth = () => this.maxHealth;
        this.getBulletCount = () => this.bulletCount;
        this.getGemCount = () => this.gems;
        this.getTime = () => this.time;
        this.health = initialHealth;
        this.maxHealth = this.health;
        this.bulletCount = initialBullets;
        this.gems = initialGems;
        this.time = (initialTime + 1) * 60;
    }
    update(ev) {
        return (this.time = Math.max(0, this.time - ev.step)) <= 0;
    }
    reduceBullet(count) {
        let newCount = this.bulletCount - count;
        this.bulletCount = Math.max(0, newCount);
        return this.bulletCount == newCount;
    }
    recoverHealth(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }
    reduceHealth(amount) {
        this.health = Math.max(0, this.health - amount);
    }
    addGemStones(count) {
        this.gems = Math.min(99, this.gems + count);
    }
    addBullets(count) {
        this.bulletCount = Math.min(99, this.bulletCount + count);
    }
    computeSwordDamage(spinAttack) {
        const BASE_DAMAGE = 5;
        const SPIN_ATTACK_BONUS = 2;
        let dmg = BASE_DAMAGE;
        if (spinAttack)
            dmg += SPIN_ATTACK_BONUS;
        return dmg;
    }
    computeMagicDamage() {
        const BASE_DAMAGE = 10;
        return BASE_DAMAGE;
    }
}
const TITLE_TEXT = `UNNAMED DUNGEON
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
class TitleScreen {
    constructor(param, ev) {
    }
    refresh(ev) {
        if (ev.getAction("start") == State.Pressed ||
            ev.getAction("fire1") == State.Pressed) {
            ev.changeScene(Game);
        }
    }
    redraw(c) {
        let font = c.getBitmap("font");
        c.clear(0, 85, 170);
        c.drawText(font, TITLE_TEXT, 4, 4, 0, 0, false);
    }
    dispose() {
        return null;
    }
}
//# sourceMappingURL=out.js.map