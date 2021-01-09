/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


class AssetContainer<T> {


    private assets : Array<KeyValuePair<T>>;


    constructor() {

        this.assets = new Array<KeyValuePair<T>> ();
    }


    public getAsset(name : string) : T {

        for (let a of this.assets) {

            if (a.key == name)
                return a.value;
        }

        return null;
    }


    public addAsset(name : string, data : T) {

        this.assets.push(new KeyValuePair<T>(name, data));
    }

}


class AssetManager {


    private bitmaps : AssetContainer<HTMLImageElement>;
    private loaded : number;
    private total : number;


    constructor() {

        this.bitmaps = new AssetContainer<HTMLImageElement> ();

        this.total = 0;
        this.loaded = 0;
    }


    public loadBitmap(name : string, url : string) {

        ++ this.total;

        let image = new Image();
        image.onload = () => {

            ++ this.loaded;
            this.bitmaps.addAsset(name, image);
        }
        image.src = url;
    }


    public hasLoaded() : boolean {

        return this.loaded >= this.total;
    }
    

    public getBitmap(name : string) : HTMLImageElement {

        return this.bitmaps.getAsset(name);
    }


    public dataLoadedUnit() : number {

        return this.total == 0 ? 1.0 : this.loaded / this.total;
    }
}
