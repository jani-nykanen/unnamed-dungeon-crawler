/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


class Canvas {

    public readonly width : number;
    public readonly height : number;

    private canvas : HTMLCanvasElement;
    private ctx : CanvasRenderingContext2D;

    private translation : Vector2;


    constructor(width : number, height : number) {

        this.width = width;
        this.height = height;    

        this.translation = new Vector2();

        this.createHtml5Canvas(width, height);
        window.addEventListener("resize", () => this.resize(
            window.innerWidth, window.innerHeight));
    }


    private createHtml5Canvas(width : number, height : number) {

        let cdiv = document.createElement("div");
        cdiv.setAttribute("style", 
            "position: absolute; top: 0; left: 0; z-index: -1;");

        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;

        this.canvas.setAttribute(
            "style", 
            "position: absolute; top: 0; left: 0; z-index: -1;" + 
            "image-rendering: optimizeSpeed;" + 
            "image-rendering: pixelated;" +
            "image-rendering: -moz-crisp-edges;"
            );
        cdiv.appendChild(this.canvas);
        document.body.appendChild(cdiv);

        this.ctx = this.canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;

        this.resize(window.innerWidth, window.innerHeight);
    }


    private getColorString(r : number, g : number, b : number, a = 1.0) : string {

        return "rgba(" + String(r | 0) + "," + 
            String(g | 0) + "," + 
            String(b | 0) + "," + 
            String(clamp(a, 0.0, 1.0));
    }


    private resize(width : number, height : number) {

        let c = this.canvas;

        // Find the best multiplier for
        // square pixels
        let mul = Math.min(
            (width / c.width) | 0, 
            (height / c.height) | 0);

        let totalWidth = c.width * mul;
        let totalHeight = c.height * mul;
        let x = width/2 - totalWidth/2;
        let y = height/2 - totalHeight/2;

        let top = String(y | 0) + "px";
        let left = String(x | 0) + "px";

        c.style.width = String(totalWidth | 0) + "px";
        c.style.height = String(totalHeight | 0) + "px";
        
        c.style.top = top;
        c.style.left = left;
    }


    public moveTo(x = 0.0, y = 0.0) {

        this.translation.x = x;
        this.translation.y = y;
    }


    public move(x : number, y : number) {

        this.translation.x += x;
        this.translation.y += y;
    }


    public clear(r : number, g : number, b : number) {

        this.ctx.fillStyle = this.getColorString(r, g, b);
        this.ctx.fillRect(0, 0, this.width, this.height);
    }


   public setFillColor(r : number, g = r, b = g, a = 1.0) {

        let colorStr = this.getColorString(r, g, b, a);

        this.ctx.fillStyle = colorStr;
        // this.ctx.strokeStyle = colorStr;
    }


    public fillRect(x : number, y : number, w : number, h : number) {

        x += this.translation.x;
        y += this.translation.y;

        this.ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
    }
}

