/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */


class PlayerStatus {


    private health : number;
    private maxHealth : number;
    private bulletCount : number;
    private gems : number;
    private time : number;


    constructor(initialHealth : number, initialBullets : number,
        initialGems : number, initialTime : number) {

        this.health = initialHealth;
        this.maxHealth = this.health;
        this.bulletCount = initialBullets;
        this.gems = initialGems;
        this.time = (initialTime+1) * 60;
    }


    public update(ev : GameEvent) : boolean {

        return (this.time = Math.max(0, this.time - ev.step)) <= 0;
    }


    public getHealth = () : number => this.health;
    public getMaxHealth = () : number => this.maxHealth;
    public getBulletCount = () : number => this.bulletCount;
    public getGemCount = () : number => this.gems;
    public getTime = () : number => this.time;


    public reduceBullet(count : number) : boolean {

        let newCount = this.bulletCount - count;
        this.bulletCount = Math.max(0, newCount)

        return this.bulletCount == newCount;
    }

    
    public reduceHealth(amount : number) {

        this.health = Math.max(0, this.health - amount);
    }
}   