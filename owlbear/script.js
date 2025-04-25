const TOP_MARGIN = window.innerHeight *0.2;

const ENEMY_SPEED = 3;

const PLAYER_HEALTH = 1000;



// Draw circle
function drawCircle(context, x, y, radius, color, opacity) {
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    // save() & restore() allows us to apply globalAlpha only to fill()
    context.save();
    context.fillStyle = color;
    context.globalAlpha = opacity;
    context.fill()
    context.restore();
    context.stroke();
}

window.addEventListener('load', function ()     // Waits for the whole page to load before running the code
{ 
    // Get the canvas and overlay elements
    const canvas = this.document.getElementById('canvas1');
    const overlay = this.document.getElementById('overlay');

    // getContext('2d') gives access to the canvas’s 2D drawing tools 
    const ctx = canvas.getContext('2d');

    // Set canvas and overlay dimensions
    canvas.width = window.innerWidth * 0.95;
    canvas.height = window.innerHeight * 0.95;
    // overlay.width = window.innerWidth * 0.95;
    // overlay.height = window.innerHeight * 0.95;

    
    // InputHandler updates game.lastKey
    class InputHandler {
        constructor(game){
            this.game = game;
            window.addEventListener('keydown', (e) => {
                this.game.lastKey = e.key + 'Pressed';
            });
            window.addEventListener('keyup', (e) => {
                this.game.lastKey = e.key + 'Released';
            });
        }

    }

    // ==================== Player Class ====================
    class Player {
        constructor(game){
            this.game = game;

            // Set image and sprites
            this.image = document.getElementById('player');
            this.spriteWidth = 200;
            this.spriteHeight = 200;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 30;

            // Set image size, location, speed and health
            this.width = this.spriteWidth;
            this.height = this.spriteHeight
            this.x = this.game.width * 0.5;
            this.y = this.game.height * 0.5;
            this.speedX = 0;
            this.speedY = 0;
            this.maxSpeed = 7;
            this.health = PLAYER_HEALTH;
            
            this.fps = 30;
            this.frameInterval = 1000/this.fps;
            this.frameTimer = 0;
        }

        draw(context){
            // context.fillRect(this.x, this.y, this.width, this.height);
            context.drawImage(
                this.image,
                this.frameX * this.spriteWidth , this.frameY * this.spriteHeight,
                this.spriteWidth, this.spriteHeight, 
                this.x, this.y,
                this.width, this.height
            );

            if(this.game.debug){
                drawCircle(context, this.x, this.y+17, 7, "black", 1);
                drawCircle(context, this.x, this.y+this.height, 7, "yellow", 1);
                drawCircle(context, this.x+this.width, this.y+17, 7, "white", 1);
                drawCircle(context, this.x+this.width, this.y+this.height, 7, "red", 1);
            }
        }

        setSpeed(speedX, speedY) {
            this.speedX = speedX;
            this.speedY = speedY;
        }

        update(deltaTime){
            // Set speed and update sprite according to last key pressed
            if(this.game.lastKey == "ArrowLeftPressed") {
                this.setSpeed(-this.maxSpeed, 0);
                this.frameY = 3;
            } else if (this.game.lastKey == "ArrowLeftReleased" && this.speedX < 0) {
                this.setSpeed(0, 0);
                this.frameY = 2;
            } else if (this.game.lastKey == "ArrowRightPressed") {
                this.setSpeed(this.maxSpeed, 0);
                this.frameY = 5;
            } else if (this.game.lastKey == "ArrowRightReleased" && this.speedX > 0) {
                this.setSpeed(0, 0);
                this.frameY = 4;
            } else if (this.game.lastKey == "ArrowUpPressed"){
                this.setSpeed(0, -this.maxSpeed * 0.6);
                this.frameY = 7;
            } else if (this.game.lastKey == "ArrowUpReleased" && this.speedY < 0){
                this.setSpeed(0, 0);
                this.frameY = 6;
            } else if (this.game.lastKey == "ArrowDownPressed") {
                this.setSpeed(0, this.maxSpeed * 0.6);
                this.frameY = 1;
            } else if (this.game.lastKey == "ArrowDownReleased" && this.speedY > 0) {
                this.setSpeed(0, 0);
                this.frameY = 0;
            }

            // Update player location
            this.x += this.speedX;
            this.y += this.speedY;

            // Horizontal boundaries
            if(this.x < 0) {
                this.x = 0;
            } else if (this.x > this.game.width - this.width) {
                this.x = this.game.width - this.width;
            }

            // Vertical boundaries
            if (this.y < TOP_MARGIN) {
                this.y = TOP_MARGIN;
            } else if (this.y > this.game.height - this.height ) {
                this.y = this.game.height - this.height;
            }

            // Sprite animation
            if (this.frameTimer > this.frameInterval) {
                this.frameX < this.maxFrame? this.frameX++ : this.frameX = 0;
            } else {
                this.frameTimer += deltaTime;
            }
        }
    }

    // ==================== Obstacle Classes ====================
    class Obstacle {
        constructor(game) {
            this.game = game;
            this.image;
        }

        draw(context) {
            context.drawImage(
                this.image, 
                this.x, 
                this.y, 
                this.width,
                this.height,
            );
        }

        update(){

        }
    }

    class Bush extends Obstacle {
        constructor(game) {
            super(game);
            // this.game = game;
            this.image = document.getElementById('bush');
            this.imageWidth = 216;
            this.imageHeight = 100;
            this.width = this.imageWidth;
            this.height = this.imageHeight;

            this.x = Math.random() * this.game.width - this.width;
            this.y = TOP_MARGIN + Math.random() * (this.game.height - this.height - TOP_MARGIN);
        }
    }
    
    class Grass extends Obstacle {
        constructor(game) {
            super(game);
            // this.game = game;
            this.image = document.getElementById('grass');
            this.imageWidth = 103;
            this.imageHeight = 182;
            this.width = this.imageWidth;
            this.height = this.imageHeight;

            this.x = Math.random() * this.game.width - this.width;
            this.y = TOP_MARGIN + Math.random() * (this.game.height - this.height - TOP_MARGIN);
        }
    }

    class Plant extends Obstacle {
        constructor(game) {
            super(game);
            // this.game = game;
            this.image = document.getElementById('plant');
            this.imageWidth = 212;
            this.imageHeight = 118;
            this.width = this.imageWidth;
            this.height = this.imageHeight;

            this.x = Math.random() * this.game.width - this.width;
            this.y = TOP_MARGIN + Math.random() * (this.game.height - this.height - TOP_MARGIN);
        }
    }

    // ==================== Enemy Classes ====================
    class Enemy {
        constructor(game) {
            this.game = game;
            
            // Set enemy speed and delay
            this.speedX = Math.random() * 3 + ENEMY_SPEED;
            this.delay = Math.random() * this.game.width * 0.75; // How far from screen the will enemy spawn
            
            this.image;
            this.yFrames;
            
            // Enemy, gun and bullet position
            this.x;
            this.y;
            this.gunX;
            this.gunY;
            this.bulletX;
            this.bulletY;

            // Enemy boolean flags
            this.stop;
            this.shot;
            this.bulletGone;
        }

        respawn(){
            this.side = Math.random() < 0.5 ? 'left' : 'right';
            console.log("respawn -> ", this.side)
            this.shot = false;
            this.stop = false;
            this.bulletGone = false;
            
            if (this.side == 'left') {
                this.x = - this.delay;
                this.gunX = this.x+100;
                this.frameX = 0;        
                this.bulletFrameX = 0;        
            }
            if (this.side == 'right') {
                this.x = this.game.width + this.width + this.delay;
                this.gunX = this.x-100;
                this.frameX = 1;        
                this.bulletFrameX = 1;        
            }
            this.y = TOP_MARGIN + Math.random() * (this.game.height - TOP_MARGIN);
            this.gunY = this.y+30;

            this.bulletX = this.gunX;
            this.bulletY = this.gunY;
            
            
        }

        // Draws the enemy on the canvas
        draw(context) {

            context.drawImage(
                this.image,
                this.frameX*this.width, this.frameY*this.height,
                this.width, this.height,
                this.spriteX, this.spriteY,
                this.width, this.height
            );

            if (this.shot && !this.bulletGone){

                context.drawImage(
                    this.bulletImage,
                    this.bulletFrameX*this.bulletWidth,0,
                    this.bulletWidth, this.bulletHeight,
                    this.bulletX, this.bulletY, 
                    this.bulletWidth, this.bulletHeight,
                );
            
            }
        }


        // Updates enemy position
        update() {
            // Set sprite location
            this.spriteX = this.x - this.width * 0.5;
            this.spriteY = this.y - this.height;

            // Go left / right
            if(this.side == 'right' && !this.stop && !this.shot)
                this.x -= this.speedX;
            else if(this.side == 'left' && !this.stop && !this.shot)
                this.x += this.speedX;

            else if(this.side == 'right' && this.bulletGone)
                this.x += this.speedX;
            else if(this.side == 'left' && this.bulletGone)
                this.x -= this.speedX;
            
            
            // If reached shooting position - stop
            if(!this.shot) {
                if(this.side == 'left' && this.spriteX + this.width >  this.width*0.8 || this.side == 'right' && this.spriteX + this.width*0.8 < this.game.width){
                    this.stop = true;
                }
        
            }

            // Shoot when reaching position
            if (this.stop == true && !this.shot) {
                if (this.frameY < this.yFrames)
                    this.frameY ++;
                else {
                    this.frameY = 0;
                    this.shot = true;
                    this.stop = false;
                    this.bulletX = this.side=='left' ? this.gunX : this.gunX - this.bulletWidth;
                    this.bulletY = this.gunY - 15;
                } 
                
            }
            
            //  Move bullet and respawn after going out of screen
            if (this.shot) {
                if (this.side == 'left'){ 
                    this.bulletX += 1.5*this.speedX;
                    if(!this.bulletGone && this.bulletX > this.game.width)
                        this.bulletGone = true
                    
                    // Respawn after going out of screen
                    if (this.spriteX + this.width < 0 ) {
                        this.respawn();
                    }
                }
                else {
                    
                    this.bulletX -= 1.5*this.speedX;
                    if(!this.bulletGone && this.bulletX + this.bulletWidth < 0)
                        this.bulletGone = true;
                    
                    // Respawn after going out of screen
                    if(this.spriteX > this.game.width){
                        this.respawn();
    
                    }
                }  
            }  
        }
    }

    class Billy extends Enemy {
        constructor(game) {
            super(game);
            // this.game = game;
            this.image = document.getElementById('billy1');
            this.bulletImage = document.getElementById('bullet1');

            // Set sprites dimensions    
            this.spriteWidth = 295;
            this.spirteHeight = 200;
            this.width = this.spriteWidth;
            this.height = this.spirteHeight;
            this.bulletWidth = 32;
            this.bulletHeight = 30;

            // Sprite position 
            this.spriteX;
            this.spriteY;

            // Sprite frames
            this.frameX = 0;
            this.frameY = 0;
            this.yFrames = 7;

            this.damage = 50;

            this.respawn();
        }

        draw(context){
            super.draw(context);
            if (this.game.debug){
                drawCircle(context, this.gunX, this.gunY, 15, 'red', 0.1);

                drawCircle(context, this.bulletX, this.bulletY, 3, "white", 1);
                drawCircle(context, this.bulletX, this.bulletY+this.bulletHeight, 3, "white", 1);
                drawCircle(context, this.bulletX+this.bulletWidth, this.bulletY, 3, "black", 1);
                drawCircle(context, this.bulletX+this.bulletWidth, this.bulletY+this.bulletHeight, 3, "black", 1);
            }
        }

        update(){
            super.update();

            this.spriteX = this.x - this.width * 0.5;
            this.spriteY = this.y - this.height/2;
            this.gunX = this.side == 'left' ? this.x+100 : this.x-100;

            if(this.bulletGone){
                this.bulletX = this.gunX;
                this.bulletY = this.gunY;
            }

        }
    }
    // ==================== FX Classes ====================
    class FX {
        constructor(game, x, y, color) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.color = color;
    
            // Randomize radius, speed and velocity angle
            this.radius = Math.floor(Math.random() * 10 + 5)
            this.speedX = Math.random() * 6 - 3;
            this.speedY = Math.random() * 2 + 0.5;
            this.va = Math.random() * 0.1 + 0.01;
    
            // Initialize angle and deletion flag
            this.angle = 0;
            this.needToDelete = false;
    
        }
    
        // Draws the fx on the canvas
        draw(context){
            context.save();
            context.fillStyle = this.color;
            drawCircle(context, this.x, this.y, this.radius, this.color, 0.75);
            context.restore();
        }
    
    }

    class Blood extends FX {
        update(){
            // Give the fx downward circular motion
            this.angle += this.va * 0.5;
            this.x += Math.sin(this.angle) * this.speedX;
            this.y += Math.cos(this.angle) * this.speedY + this.speedY * 0.2;
    
            // Make the drops smaller
            if (this.radius > 0.1) 
                this.radius -= 0.05;
            
            // Make drops dissapear when they are small enough
            if (this.radius < 0.2){
                this.needToDelete = true;
                this.game.fx = this.game.removeGameObjects(this.game.fx);
            }
        }
    }

    // ==================== Game Class ====================
    class Game {
        constructor(width, height){
            this.width = width;
            this.height = height;
            this.lastKey = undefined;
            this.input = new InputHandler(this);
            this.player = new Player(this);

            this.numberOfPlants = 10;
            this.plants = [];
            
            this.maxEnemies = 5;
            this.enemies = [];

            this.fx = [];

            this.gameObjects = [];
            
            this.debug = false;
        }  

        removeGameObjects(objects){
            objects = objects.filter(obj => !obj.needToDelete);
            return objects
        }

        // Check if enemy hit the player
        checkShot(enemy) {
            // Check Y coordinates
            if(enemy.bulletY >= this.player.y+17 && enemy.bulletY+enemy.bulletHeight <= this.player.y+17+this.player.height) {
            
                if(enemy.side == 'right') {
                    //  Check X coordinates
                    if(enemy.bulletX <= (this.player.x+this.player.width)*0.92 && enemy.bulletX+enemy.bulletWidth >= this.player.x) {
                        this.player.health -= enemy.damage;
                        enemy.bulletGone = true;
                        for (let i=0; i<5; i++){
                            this.fx.push(new Blood(this, enemy.bulletX, enemy.bulletY, "red"));
                        }
                    }
                }
                else {
                    //  Check X coordinates
                    if(enemy.bulletX+enemy.bulletWidth >= this.player.x+this.player.width*0.08 && enemy.bulletX+enemy.bulletWidth <= this.player.x+this.player.width) {
                        this.player.health -= enemy.damage;
                        enemy.bulletGone = true;
                        for (let i=0; i<5; i++){
                            this.fx.push(new Blood(this, enemy.bulletX, enemy.bulletY, "red"));
                        }
                    }
                }
            }
        }

        render(context, deltaTime) {
            this.gameObjects = [this.player, ...this.plants];
            
            this.gameObjects.sort((a,b) => {
                return ((a.y + a.height) - (b.y + b.height))
            });

            this.gameObjects.forEach(obj => {
                obj.draw(context);
                obj.update(deltaTime);
            })

            this.fx.forEach(fx => {
                fx.draw(context);
                fx.update(context);
            });

            this.enemies.forEach(enemy => {
                enemy.draw(context);
                enemy.update(context);
                this.checkShot(enemy);
            });

            context.save();
            ctx.fillStyle='white';
            ctx.font = '35px Helvetica';
            context.textAlign = 'left';
            ctx.lineWidth = 5;
            ctx.strokeStyle='black';

            context.strokeText('HEALTH: ' + this.player.health, 80, 70);
            context.fillText('HEALTH: ' + this.player.health, 80, 70);
            context.restore();            

        }

        init(){
            for(let i=0; i<this.numberOfPlants; i++){
                const num = Math.random();
                if(num < 0.333)
                    this.plants.push(new Bush(this));
                else if(num < 0.666)
                    this.plants.push(new Plant(this));
                else this.plants.push(new Grass(this));
                
                if(i < this.maxEnemies){
                        this.enemies.push(new Billy(this));
            
                }
            }
        }
    }

    const game = new Game(canvas.width, canvas.height);
    game.init();

    let lastTime = 0;

    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp; 
        ctx.clearRect(0,0, canvas.width, canvas.height);
        game.render(ctx, deltaTime);
        requestAnimationFrame(animate);
    }

    animate(0);
});