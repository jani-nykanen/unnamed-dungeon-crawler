/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


const INPUT_SPECIAL_EPS = 0.25;


enum State {

    Up = 0, 
    Released = 2,
    Down = 1, 
    Pressed = 3, 

    DownOrPressed = 1,
}


// TODO: Make this more proper TypeScript, that is,
// replace "any" objects with proper data types
class InputManager {


    private keyStates : any;
    private prevent : any;
    private actions : any;

    private gamepad : GamePadListener;

    private stick : Vector2;
    private oldStick : Vector2;
    private stickDelta : Vector2;

    private anyKeyPressed : boolean;
    

    constructor() {

        this.keyStates = {};
        this.prevent = {};
        this.actions = {};

        this.gamepad = new GamePadListener();

        this.stick = new Vector2(0, 0);
        this.oldStick = new Vector2(0, 0);
        this.stickDelta = new Vector2(0, 0);

        window.addEventListener("keydown", 
            (e : any) => {

                if (this.keyPressed(e.code)) 
                    e.preventDefault();
            });
        window.addEventListener("keyup", 
            (e : any) => {

                if (this.keyReleased(e.code))
                    e.preventDefault();
            });   
    
        window.addEventListener("contextmenu", (e) => {

            e.preventDefault();
        });

        // To get the focus when embedded to an iframe
        window.addEventListener("mousemove", (e) => {

            window.focus();
        });
        window.addEventListener("mousedown", (e) => {

            window.focus();
        });

        this.anyKeyPressed = false;
    }

    
    public addAction(name : string, key : string, 
        button1 : number, button2 = -1) {

        this.actions[name] = {
            state: State.Up,
            key: key,
            button1: button1,
            button2: button2
        };
        this.prevent[key] = true;

        return this;
    }

    
    public keyPressed(key : number) {

        if (this.keyStates[key] != State.Down) {

            this.anyKeyPressed = true;
            this.keyStates[key] = State.Pressed;
        }

        return this.prevent[key];
    }


    public keyReleased(key : number) {

        if (this.keyStates[key] != State.Up)
            this.keyStates[key] = State.Released;

        return this.prevent[key];
    }


    private updateStateArray(arr : Array<State>) {

        for (let k in arr) {

            if (arr[k] == State.Pressed)
                arr[k] = State.Down;
            else if(arr[k] == State.Released) 
                arr[k] = State.Up;
        }
    }


    private updateStick() {

        const DEADZONE = 0.25;

        let padStick = this.gamepad.getStick();

        this.oldStick = this.stick.clone();

        this.stick.zeros();
        if (Math.abs(padStick.x) >= DEADZONE ||
            Math.abs(padStick.y) >= DEADZONE) {

            this.stick = padStick;
        }
        
        if (this.actions["right"].state & State.DownOrPressed) {

            this.stick.x = 1;
        }
        else if (this.actions["left"].state & State.DownOrPressed) {

            this.stick.x = -1;
        }

        if (this.actions["down"].state & State.DownOrPressed) {

            this.stick.y = 1;
        }
        else if (this.actions["up"].state & State.DownOrPressed) {

            this.stick.y = -1;
        }
        this.stick.normalize();

        this.stickDelta = new Vector2(
            this.stick.x - this.oldStick.x,
            this.stick.y - this.oldStick.y
        );
    }


    // This one is called before the current scene
    // is "refreshed"
    public preUpdate() {

        this.gamepad.update();

        for (let k in this.actions) {

            this.actions[k].state = this.keyStates[this.actions[k].key] | State.Up;
            if (this.actions[k].state == State.Up) {

                if (this.actions[k].button1 != null)
                    this.actions[k].state = this.gamepad
                        .getButtonState(this.actions[k].button1);

                if (this.actions[k].state == State.Up &&
                    this.actions[k].button2 != null) {

                    this.actions[k].state = this.gamepad
                        .getButtonState(this.actions[k].button2);
                }
            }
        }

        this.updateStick();
    }


    // And this one afterwards
    public postUpdate() {

        this.updateStateArray(this.keyStates);

        this.anyKeyPressed = false;
    }


    //
    // The next functions makes dealing with gamepad
    // easier in menus
    //

    public upPress() : boolean {

        return this.stick.y < 0 && 
            this.oldStick.y >= -INPUT_SPECIAL_EPS &&
            this.stickDelta.y < -INPUT_SPECIAL_EPS;
    }

    public downPress() : boolean {

        return this.stick.y > 0 && 
            this.oldStick.y <= INPUT_SPECIAL_EPS &&
            this.stickDelta.y > INPUT_SPECIAL_EPS;
    }


    public leftPress() : boolean {

        return this.stick.x < 0 && 
            this.oldStick.x >= -INPUT_SPECIAL_EPS &&
            this.stickDelta.x < -INPUT_SPECIAL_EPS;
    }

    public rightPress() : boolean {

        return this.stick.x > 0 && 
            this.oldStick.x <= INPUT_SPECIAL_EPS &&
            this.stickDelta.x > INPUT_SPECIAL_EPS;
    }


    public anyPressed() : boolean {

        return this.anyKeyPressed || this.gamepad.isAnyButtonPressed();
    }


    public getStick() : Vector2 {

        return this.stick.clone();
    }

}
