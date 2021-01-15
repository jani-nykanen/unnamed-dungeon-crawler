/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


class Vector2 {


    public x : number;
    public y : number


	constructor(x = 0.0, y = 0.0) {
		
		this.x = x == undefined ? 0 : x;
        this.y = y == undefined ? 0 : y;
	}
	
	
	public length() : number {
		
		return Math.hypot(this.x, this.y);
	}
	
	
	public normalize(forceUnit = false) : Vector2 {
		
		const EPS = 0.0001;
		
		let l = this.length();
		if (l < EPS) {
			
			this.x = forceUnit ? 1 : 0;
            this.y = 0;

			return this.clone();;
		}
		
		this.x /= l;
		this.y /= l;
		
		return this.clone();
	}
	
	
	public clone() : Vector2 {
		
		return new Vector2(this.x, this.y);
	}


	public zeros() {

        this.x = 0;
        this.y = 0;
	}


	public scalarMultiply(s : number) : Vector2 {

		this.x *= s;
		this.y *= s;

		return this.clone();
	}


	static dot(u : Vector2, v : Vector2) {

		return u.x*v.x + u.y*v.y;
	}


	static normalize(v : Vector2, forceUnit = false) : Vector2 {

		return v.clone().normalize(forceUnit);
	}
}
