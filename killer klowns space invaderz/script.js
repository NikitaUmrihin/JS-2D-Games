const ENEMY_SIZE = 75;

class Enemy {
    constructor(game, positionX, positionY) {
        this.game = game;
        this.width = ENEMY_SIZE;
        this.height = ENEMY_SIZE;

        // Actual position
        this.x = this.game.width / 2 - this.width / 2; 
        this.y = this.game.height - this.height;

        // Position of enemy within the wave matrix
        this.positionX = positionX;
        this.positionY = positionY;

        this.speed = 10;
    }
    
    draw(context) {
        context.strokeRect(this.x, this.y, this.width, this.height);    
    }

    update(x, y){
        this.x = x + this.positionX;
        this.y = y + this.positionY;
    }
    
}


// _____________________________________________________________________________
// _____________________________________________________________________________

class Wave{
    constructor(game) {
        this.game = game;
        this.width = ENEMY_SIZE * this.game.columns;
        this.height = ENEMY_SIZE * this.game.rows;
        this.x = 0; 
        this.y = -this.height;
        this.speed = 5;
        this.enemies = [];
        this.create();        
    }

    render(context){

        context.strokeStyle = 'white';

        if(this.y < 0)
            this.y += this.speed;

        this.speedY = 0;

        context.strokeRect(this.x, this.y, this.width, this.height);
        
        // Bounce off walls
        if (this.x < 0 || this.x + this.width > this.game.width){
            this.speed *= -1;
            this.y += ENEMY_SIZE * 0.5;
        }
        
        this.x += this.speed;

        this.enemies.forEach(enemy => {
            enemy.update(this.x, this.y);
            enemy.draw(context);
        });
        
    }

    create(){
        for (let y = 0; y < this.game.rows; y++){
            for (let x = 0; x < this.game.columns; x++){
                let enemyX = x * ENEMY_SIZE;
                let enemyY = y * ENEMY_SIZE;
                this.enemies.push(new Enemy(this.game, enemyX, enemyY));
            }


        }
    }

}

// _____________________________________________________________________________
// _____________________________________________________________________________


class Player {
    constructor(game) {
        this.game = game;
        this.width = 100;
        this.height = 100;
        this.x = this.game.width / 2 - this.width / 2; 
        this.y = this.game.height - this.height;

        this.speed = 10;
    }

    draw(context) {
        context.fillStyle = 'white';
        context.fillRect(this.x, this.y, this.width, this.height);    
    }

    update(){
        // Move player according to pressed keys
        if(this.game.keys.indexOf('ArrowLeft') > -1) 
            this.x -= this.speed;
        if(this.game.keys.indexOf('ArrowRight') > -1) 
            this.x += this.speed;
        
        // Set player boundaries
        if(this.x < 0) 
            this.x = 0;
        if(this.x > this.game.width - this.width) 
            this.x = this.game.width - this.width;
    }

    shoot(){
        const missile = this.game.getMissile();
        if(missile){
            missile.start(this.x + this.width / 2 - missile.width / 2, this.y);
        }
    }
}


// _____________________________________________________________________________
// _____________________________________________________________________________

class Missile {
    constructor(game){
        this.width = 4;
        this.height = 20;
        this.x = game.width / 2 - this.width / 2;
        this.y = game.height - this.height;

        this.speed = 10;
        this.available = true;
    }

    draw(context){
        // if missile not available -> its been shot -> draw it
        if(!this.available){
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    update(){
        if(!this.available) {
            this.y -= this.speed;
            if(this.y < 0 - this.height){
                this.reset();
            }
        }

    }
    start(x, y){
        this.x = x;
        this.y = y;
        this.available = false;
    }
    reset(){
        this.available = true;
    }
}

// _____________________________________________________________________________
// _____________________________________________________________________________




class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.keys = [];
        this.player = new Player(this);

        this.missiles = [];
        this.numberofMissiles = 5; 
        this.createMissiles();
        

        this.rows = 3;
        this.columns = 5;
        

        this.waves = [];
        this.waves.push(new Wave(this));

        window.addEventListener('keydown', e => {
            if(this.keys.indexOf(e.key) === -1)
                this.keys.push(e.key);
            if(e.key === ' ')
                this.player.shoot();
        });
        
        window.addEventListener('keyup', e => {
            if(this.keys.indexOf(e.key) !== -1)
                this.keys.splice(this.keys.indexOf(e.key), 1);
        });
        
    }


    render(context){
        this.player.draw(context);
        this.player.update();
        this.missiles.forEach(missile => {
            missile.update();
            missile.draw(context);
        });
        this.waves.forEach(wave => {
            wave.render(context);
        });
    }



    createMissiles(){
        for(let i = 0; i < this.numberofMissiles; i++){
            this.missiles.push(new Missile(this));
        }
    }
    getMissile(){
        for(let i = 0; i < this.numberofMissiles; i++){
            if(this.missiles[i].available){
                return this.missiles[i];
            }
        }
    }

}

// _____________________________________________________________________________
// _____________________________________________________________________________

// Waits for the whole page to load before running the code
window.addEventListener('load', function ()     
{ 
    // Get the canvas elements
    const canvas = this.document.getElementById('canvas1');

    // getContext('2d') gives access to the canvas’s 2D drawing tools 
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions (almost fullscreen)
    canvas.width = window.innerWidth * 0.95;
    canvas.height = window.innerHeight * 0.95;

    // Create a new game
    const game = new Game(canvas);
    
    
    function animate(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.render(ctx);
        requestAnimationFrame(animate);
    }
    animate();
    

});