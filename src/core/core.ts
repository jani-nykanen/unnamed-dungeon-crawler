/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


class GameEvent {


    public readonly step : number;
    public readonly input : InputManager;


    constructor(step : number, input : InputManager) {

        this.step = step;
        this.input = input;
    }
}


class Core {

    private canvas : Canvas;
    private input : InputManager;
    private activeScene : Scene;
    private ev : GameEvent;

    private timeSum : number;
    private oldTime : number;

    private initialized : boolean;


    constructor(canvasWidth : number, canvasHeight : number, frameSkip : number) {

        this.canvas = new Canvas(canvasWidth, canvasHeight);

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


    public loop(ts : number) {

        const MAX_REFRESH_COUNT = 5;
        const FRAME_WAIT = 16.66667 * this.ev.step;

        this.timeSum += ts - this.oldTime;
        this.timeSum = Math.min(MAX_REFRESH_COUNT * FRAME_WAIT, this.timeSum);
        this.oldTime = ts;

        let refreshCount = (this.timeSum / FRAME_WAIT) | 0;
        while ((refreshCount --) > 0) {

            if (!this.initialized) { // && this.assets.loaded()
    
                this.activeScene.init(null, this.ev);
                this.initialized = true;
            }

            this.input.preUpdate();

            this.activeScene.refresh(this.ev);

            this.input.postUpdate();

            this.timeSum -= FRAME_WAIT;
        }

        this.activeScene.redraw(this.canvas);

        window.requestAnimationFrame(ts => this.loop(ts));
    }


    public addInputAction(name : string, key : string, 
        button1 : number, button2 = -1) : Core {

        this.input.addAction(name, key, button1, button2);

        return this;
    }


    public run(initialScene : Scene) {

        this.activeScene = initialScene;

        this.loop(0);
    }
}
