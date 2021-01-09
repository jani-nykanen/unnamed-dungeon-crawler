/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


class GameEvent {


    public readonly step : number;
    private readonly input : InputManager;


    constructor(step : number, input : InputManager) {

        this.step = step;
        this.input = input;
    }


    public getStick() : Vector2 {

        return this.input.getStick();
    }


    public getAction(name : string) : State {

        return this.input.getAction(name);
    }
}


class Core {

    private canvas : Canvas;
    private assets : AssetManager;
    private input : InputManager;
    private activeScene : Scene;
    private ev : GameEvent;

    private timeSum : number;
    private oldTime : number;

    private initialized : boolean;


    constructor(canvasWidth : number, canvasHeight : number, frameSkip : number) {

        this.assets = new AssetManager();
        this.canvas = new Canvas(canvasWidth, canvasHeight, this.assets);

        this.input = new InputManager();
        this.input.addAction("left", "ArrowLeft", 14)
            .addAction("up", "ArrowUp", 12)
            .addAction("right", "ArrowRight", 15)
            .addAction("down", "ArrowDown", 13),

        this.ev = new GameEvent(frameSkip+1, this.input);

        this.timeSum = 0.0;
        this.oldTime = 0.0;

        this.initialized = false;
    }


    private drawLoadingScreen(c : Canvas) {

        let barWidth = c.width / 4;
        let barHeight = barWidth / 8;

        c.clear(0, 0, 0);
    
        let t = this.assets.dataLoadedUnit();
        let x = c.width/2 - barWidth/2;
        let y = c.height/2 - barHeight/2;

        x |= 0;
        y |= 0;
    
        // Outlines
        c.setFillColor(255);
        c.fillRect(x-2, y-2, barWidth+4, barHeight+4);
        c.setFillColor(0);
        c.fillRect(x-1, y-1, barWidth+2, barHeight+2);
    
        // Bar
        let w = (barWidth*t) | 0;
        c.setFillColor(255);
        c.fillRect(x, y, w, barHeight);
    }


    private loop(ts : number) {

        const MAX_REFRESH_COUNT = 5;
        const FRAME_WAIT = 16.66667 * this.ev.step;

        this.timeSum += ts - this.oldTime;
        this.timeSum = Math.min(MAX_REFRESH_COUNT * FRAME_WAIT, this.timeSum);
        this.oldTime = ts;

        let refreshCount = (this.timeSum / FRAME_WAIT) | 0;
        while ((refreshCount --) > 0) {

            if (!this.initialized && this.assets.hasLoaded()) {
    
                this.activeScene.init(null, this.ev);
                this.initialized = true;
            }

            this.input.preUpdate();

            if (this.initialized) {

                this.activeScene.refresh(this.ev);
            }

            this.input.postUpdate();

            this.timeSum -= FRAME_WAIT;
        }

        if (this.initialized) {

            this.activeScene.redraw(this.canvas);
        }
        else {

            this.drawLoadingScreen(this.canvas);
        }

        window.requestAnimationFrame(ts => this.loop(ts));
    }


    public addInputAction(name : string, key : string, 
        button1 : number, button2 = -1) : Core {

        this.input.addAction(name, key, button1, button2);

        return this;
    }


    public loadBitmap(name : string, url : string) : Core {

        this.assets.loadBitmap(name, url);

        return this;
    }


    public run(initialScene : Scene) {

        this.activeScene = initialScene;

        this.loop(0);
    }
}
