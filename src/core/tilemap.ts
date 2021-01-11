/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


class Tilemap {


    private layers : Array<Array<number>>;
    private properties : Array<KeyValuePair<string>>;
    public readonly width : number;
    public readonly height : number;


    constructor(xmlString : string) {

        let doc = (new DOMParser()).parseFromString(xmlString, "text/xml");
        let root = doc.getElementsByTagName("map")[0];

        this.width = Number(root.getAttribute("width"));
        this.height = Number(root.getAttribute("height"));

        // TODO: Get rid of <any>
        let data = <any>root.getElementsByTagName("layer");
        this.layers = new Array<Array<number>>();

        // Find the minimal id
        let min = 9999; // "Big number"
        for (let d of data) {

            if (d.id < min) {

                min = d.id;
            }
        }

        let str, content;
        let id;
        for (let i = 0; i < data.length; ++ i) {

            id = data[i].id - min;

            // Get layer data & remove newlines
            str = data[i].getElementsByTagName("data")[0]
                .childNodes[0]
                .nodeValue
                .replace(/(\r\n|\n|\r)/gm, "");
            content = str.split(",");

            this.layers[id] = new Array<number>();
            for (let j = 0; j < content.length; ++ j) {

                this.layers[id][j] = parseInt(content[j]);
            }
        }

        // Read (optional) properties
        this.properties = new Array<KeyValuePair<string>> ();
        let prop = root.getElementsByTagName("properties")[0];

        if (prop != undefined) {

            // TODO: Get rid of <any>
            for (let p of <any>prop.getElementsByTagName("property")) {

                if ( p.getAttribute("name") != undefined) {

                    this.properties.push(new KeyValuePair<string> (p.getAttribute("name"), p.getAttribute("value")));
                }
            }
        }   
    }


    public getTile(l : number, x : number, y : number) : number {

        if (l < 0 || l >= this.layers.length || x < 0 || y < 0 ||
            x >= this.width || y >= this.height)
            return -1;

        return this.layers[l][y * this.width + x];
    }


    public cloneLayer(l : number) : Array<number> {

        if (l < 0 || l >= this.layers.length) 
            return null;

        return Array.from(this.layers[l]);
    }
}
