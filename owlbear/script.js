const TOP_MARGIN = window.innerHeight *0.2;

// BILLIES ORDER =              {Billy, BillyBoy, BabyBilly, BillyGirl, BillyGoat, BillyBob, BillyBeth}
const BILLIES_SPEED =           [5,     4,        4,         3,         3,         1,        0.75];
const BILLIES_BULLET_SPEED =    [2,     3,        5,         4,         7,         6,        5];
const BILLIES_BULLET_DAMAGE =   [50,    50,       30,        75,        100,       100,      100];

const SHROOM_GOAL = 50;
const SHROOM_SPAWN_SECONDS = 4;
const MAX_SHROOMS = 10;

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
                if (e.key === 'd'){
                    this.game.debug = !this.game.debug;
                }
                else if(e.key === 'r') {
                    this.game.restart();
                    this.game.init();
                }
                else
                    this.game.lastKey = e.key + 'Pressed';
            });
            window.addEventListener('keyup', (e) => {
                if(e.key !== 'd')
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

            // Set image size, location, speed, health andradius
            this.width = this.spriteWidth;
            this.height = this.spriteHeight
            this.x = this.game.width * 0.5;
            this.y = this.game.height * 0.5;
            this.speedX = 0;
            this.speedY = 0;
            this.maxSpeed = 7;
            this.health = PLAYER_HEALTH;
            this.radius = 70;

            this.fps = 30;
            this.frameInterval = 1000/this.fps;
            this.frameTimer = 0;
        }
        
        restart(){
            this.x = this.game.width * 0.5;
            this.y = this.game.height * 0.5;
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5;
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

                drawCircle(context, this.x+this.width*0.5, this.y+this.height*0.5, this.radius, "white", 0.3);

                drawCircle(context, this.x, this.y+17, 7, "black", 1);
                drawCircle(context, this.x, this.y+this.height, 7, "yellow", 1);
                drawCircle(context, this.x+this.width, this.y+17, 7, "white", 1);
                drawCircle(context, this.x+this.width, this.y+this.height, 7, "blue", 1);
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

    // ==================== PowerUp Classes ====================
    class MushroomPowerUp {
        constructor(game) {
            this.game = game;
            this.image = document.getElementById('shrooms');
            this.spriteWidth = 220;
            this.spriteHeight = 220;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.radius = 50;
                        
            // Randomly place shrooms in game 
            this.y = TOP_MARGIN + Math.random() * (this.game.height - this.height - TOP_MARGIN);
            this.x = this.game.width * 0.15 + Math.random() * (this.game.width * 0.7 - this.width);

            // Randomize the sprite frame for variety 
            this.frameX = Math.floor(Math.random() * 3);
            this.frameY = Math.floor(Math.random() * 3);
            
            // Mushroom state (for munching animation)
            this.state = 0;
            this.changeState = false;
            this.needToDelete = false;
        }

        draw(context) {
            context.drawImage(
                this.image,
                this.frameX * this.spriteWidth, this.frameY * this.spriteHeight,
                this.spriteWidth, this.spriteHeight,
                this.x, this.y,
                this.width, this.height
            );
            if (game.debug){
                drawCircle(context, this.x + this.width*0.5, this.y +this.height*0.75, this.radius, 'white', 0.3)
                drawCircle(context, this.x, this.y, 5, 'black', 0.5)
            }
        }

        update(){ 
            
            //  Sprite animantion
            if(this.state <= 1){
                this.changeState = false;
                this.state += 0.04;
            } else {
                this.changeState = true;
                this.state = 0;
                this.frameX += 3;
            }

            //  If mushroom was eaeten - remove it 
            if(this.frameX >= 27) {
                if(!this.game.gameOver)
                    this.game.score++;
                this.needToDelete = true;
                this.game.shrooms = this.game.removeGameObjects(this.game.shrooms);
                for (let i=0; i<4; i++){
                    this.game.fx.push(new Munch(this.game, this.x + this.width*0.5, this.y +this.height*0.75, "purple", 0.6));
                }
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
            this.speedX = Math.random() * 3;
            this.delay = Math.random() * this.game.width * 5; // How far from screen the will enemy spawn
            
            this.image;
            this.yFrames;
            
            // Enemy, gun and bullet position
            this.x;
            this.y;
            this.gunX;
            this.gunY;
            this.bulletX;
            this.bulletY;

            // Boolean flags
            this.stop;
            this.shot;
            this.bulletGone;
            this.burst = false;
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

            // Bullets in the air
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

            // Enemy appears on screen
            if(this.side == 'right' && !this.stop && !this.shot)
                this.x -= this.speedX;
            else if(this.side == 'left' && !this.stop && !this.shot)
                this.x += this.speedX;

            // Enemy dissapears after shooting
            else if(this.side == 'right' && !this.stop && this.shot)
                this.x += this.speedX;
            else if(this.side == 'left' && !this.stop && this.shot)
                this.x -= this.speedX;
            
            
            // If reached shooting position - stop
            if(!this.shot) {
                if(this.side == 'left' && this.spriteX + this.width >  this.width*0.8 || this.side == 'right' && this.spriteX + this.width*0.8 < this.game.width){
                    this.stop = true;
                }
        
            }

            // Shoot when reaching position
            if (this.stop && !this.shot) {
                if (this.frameY < this.yFrames)
                    this.frameY ++;
                else {
                    this.frameY = 0;
                    this.shot = true;
                    // this.stop = false;
                    this.bulletX = this.side=='left' ? this.gunX : this.gunX - this.bulletWidth;
                    this.bulletY = this.gunY - 15;
                } 
                
            }
            
            //  Move bullet and respawn after going out of screen
            if (this.shot && !this.burst) {
                if (this.side == 'left'){ 
                    this.bulletX += this.bulletSpeedX;
                    if(!this.bulletGone && this.bulletX > this.game.width*0.85)
                        this.stop = false;
                    if(!this.bulletGone && this.bulletX > this.game.width)
                        this.bulletGone = true;
                        
                        
                        // Respawn after going out of screen
                        if (this.spriteX + this.width < 0  && !this.game.gameOver) {
                        this.respawn();
                    }
                }
                else {
                    
                    this.bulletX -= this.bulletSpeedX;
                    if(!this.bulletGone && this.bulletX + this.bulletWidth < this.game.width*0.15)
                        this.stop = false;
                    
                    if(!this.bulletGone && this.bulletX + this.bulletWidth < 0)
                        this.bulletGone = true;

                    // Respawn after going out of screen
                    if(this.spriteX > this.game.width && !this.game.gameOver){
                        this.respawn();
    
                    }
                }  
            }
            
            if(this.bulletGone){
                this.bulletX = this.side=='left' ? this.gunX - this.width : this.gunX + this.width;
                this.bulletY = this.gunY;
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

            this.damage = BILLIES_BULLET_DAMAGE[0];
            this.speedX = this.speedX + BILLIES_SPEED[0];
            this.bulletSpeedX = this.speedX + BILLIES_BULLET_SPEED[0];

            this.respawn();
        }

        respawn(){
            super.respawn();
            if(this.bulletGone) this.stop = false;
            this.gunY = this.y+30;
            this.bulletX = this.gunX;
            this.bulletY = this.gunY;
        }
        draw(context){
            super.draw(context);
            if (this.game.debug){
                drawCircle(context, this.gunX, this.gunY, 15, 'red', 0.5);

                drawCircle(context, this.bulletX, this.bulletY, 3, "white", 1);
                drawCircle(context, this.bulletX, this.bulletY+this.bulletHeight, 3, "white", 1);
                drawCircle(context, this.bulletX+this.bulletWidth, this.bulletY, 3, "black", 1);
                drawCircle(context, this.bulletX+this.bulletWidth, this.bulletY+this.bulletHeight, 3, "black", 1);
            }
        }

        update(){
            super.update();
            if(this.bulletGone) this.stop = false;
            this.spriteX = this.x - this.width * 0.5;
            this.spriteY = this.y - this.height/2;
            this.gunX = this.side == 'left' ? this.x+100 : this.x-100;
        }
    }


    class BillyBoy extends Enemy {
        constructor(game) {
            super(game);
            // this.game = game;
            this.image = document.getElementById('billy2');
            this.bulletImage = document.getElementById('bullet1');

            // Set sprites dimensions    
            this.spriteWidth = 282;
            this.spirteHeight = 204;
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

            this.damage = BILLIES_BULLET_DAMAGE[1];
            this.speedX = this.speedX + BILLIES_SPEED[1];
            this.bulletSpeedX = this.speedX + BILLIES_BULLET_SPEED[1];

            this.respawn();
        }

        respawn(){
            super.respawn();
            if(this.bulletGone) this.stop = false;
            this.gunY = this.y+30;
            this.bulletX = this.gunX;
            this.bulletY = this.gunY;
        }

        draw(context){
            super.draw(context);
            if (this.game.debug){
                drawCircle(context, this.gunX, this.gunY, 15, 'red', 0.5);

                drawCircle(context, this.bulletX, this.bulletY, 3, "white", 1);
                drawCircle(context, this.bulletX, this.bulletY+this.bulletHeight, 3, "white", 1);
                drawCircle(context, this.bulletX+this.bulletWidth, this.bulletY, 3, "black", 1);
                drawCircle(context, this.bulletX+this.bulletWidth, this.bulletY+this.bulletHeight, 3, "black", 1);
            }
        }

        update(){
            super.update();
            if(this.bulletGone) this.stop = false;
            this.spriteX = this.x - this.width * 0.5;
            this.spriteY = this.y - this.height/2;
            this.gunX = this.side == 'left' ? this.x+100 : this.x-100;

        }
    }


    class BabyBillyBoy extends Enemy {
        constructor(game) {
            super(game);
            // this.game = game;
            this.image = document.getElementById('billy3');
            this.bulletImage = document.getElementById('bullet2');

            // Set sprites dimensions    
            this.spriteWidth = 278;
            this.spirteHeight = 145;
            this.width = this.spriteWidth;
            this.height = this.spirteHeight;
            this.bulletWidth = 33;
            this.bulletHeight = 20;

            // Sprite position 
            this.spriteX;
            this.spriteY;

            // Sprite frames
            this.frameX = 0;
            this.frameY = 0;
            this.yFrames = 7;

            this.damage = BILLIES_BULLET_DAMAGE[2];
            this.speedX = this.speedX + BILLIES_SPEED[2];
            this.bulletSpeedX = this.speedX + BILLIES_BULLET_SPEED[2];

            this.respawn();
        }

        respawn(){
            super.respawn();
            this.gunY = this.y+20;

            this.bulletX = this.gunX;
            this.bulletY = this.gunY;
        }

        draw(context){
            super.draw(context);
            if (this.game.debug){
                drawCircle(context, this.gunX, this.gunY, 10, 'red', 0.5);

                drawCircle(context, this.bulletX, this.bulletY, 3, "white", 1);
                drawCircle(context, this.bulletX, this.bulletY+this.bulletHeight, 3, "white", 1);
                drawCircle(context, this.bulletX+this.bulletWidth, this.bulletY, 3, "black", 1);
                drawCircle(context, this.bulletX+this.bulletWidth, this.bulletY+this.bulletHeight, 3, "black", 1);
            }
        }

        update(){
            super.update();
            if(this.bulletGone) this.stop = false;
            this.spriteX = this.x - this.width * 0.5;
            this.spriteY = this.y - this.height/2;
            this.gunX = this.side == 'left' ? this.x+100 : this.x-100;

        }
    }

    class BillyGirl extends Enemy {
        constructor(game) {
            super(game);
            // this.game = game;
            this.image = document.getElementById('billy4');
            this.bulletImage = document.getElementById('bullet3');

            // Set sprites dimensions    
            this.spriteWidth = 450;
            this.spirteHeight = 200;
            this.width = this.spriteWidth;
            this.height = this.spirteHeight;
            this.bulletWidth = 67;
            this.bulletHeight = 30;

            // Sprite position 
            this.spriteX;
            this.spriteY;

            // Sprite frames
            this.frameX = 0;
            this.frameY = 0;
            this.yFrames = 7;

            this.damage = BILLIES_BULLET_DAMAGE[3];
            this.speedX = this.speedX + BILLIES_SPEED[3];
            this.bulletSpeedX = this.speedX + BILLIES_BULLET_SPEED[3];

            this.respawn();
        }

        respawn(){
            super.respawn();
            if(this.bulletGone) this.stop = false;
            this.gunY = this.y+30;
            this.bulletX = this.gunX;
            this.bulletY = this.gunY;
        }

        draw(context){
            super.draw(context);
            if (this.game.debug){
                drawCircle(context, this.gunX, this.gunY, 15, 'red', 0.5);

                drawCircle(context, this.bulletX, this.bulletY, 3, "white", 1);
                drawCircle(context, this.bulletX, this.bulletY+this.bulletHeight, 3, "white", 1);
                drawCircle(context, this.bulletX+this.bulletWidth, this.bulletY, 3, "black", 1);
                drawCircle(context, this.bulletX+this.bulletWidth, this.bulletY+this.bulletHeight, 3, "black", 1);
            }
        }

        update(){
            super.update();
            if(this.bulletGone) this.stop = false;
            this.spriteX = this.x - this.width * 0.5;
            this.spriteY = this.y - this.height/2;
            this.gunX = this.side == 'left' ? this.x+150 : this.x-150;

        }
    }


    class BillyGoat extends Enemy {
        constructor(game) {
            super(game);
            // this.game = game;
            this.image = document.getElementById('billy5');
            this.bulletImage = document.getElementById('bullet3');

            // Set sprites dimensions    
            this.spriteWidth = 327;
            this.spirteHeight = 210;
            this.width = this.spriteWidth;
            this.height = this.spirteHeight;
            this.bulletWidth = 67;
            this.bulletHeight = 30;

            // Sprite position 
            this.spriteX;
            this.spriteY;

            // Sprite frames
            this.frameX = 0;
            this.frameY = 0;
            this.yFrames = 7;

            this.damage = BILLIES_BULLET_DAMAGE[4];
            this.speedX = this.speedX + BILLIES_SPEED[4];
            this.bulletSpeedX = this.speedX + BILLIES_BULLET_SPEED[4];

            this.respawn();
        }

        respawn(){
            super.respawn();
            this.gunY = this.y+25;
            this.bulletX = this.gunX;
            this.bulletY = this.gunY;
        }

        draw(context){
            super.draw(context);
            if (this.game.debug){
                drawCircle(context, this.gunX, this.gunY, 15, 'red', 0.5);

                drawCircle(context, this.bulletX, this.bulletY, 3, "white", 1);
                drawCircle(context, this.bulletX, this.bulletY+this.bulletHeight, 3, "white", 1);
                drawCircle(context, this.bulletX+this.bulletWidth, this.bulletY, 3, "black", 1);
                drawCircle(context, this.bulletX+this.bulletWidth, this.bulletY+this.bulletHeight, 3, "black", 1);
            }
        }

        update(){
            super.update();
            if(this.bulletGone) this.stop = false;
            this.spriteX = this.x - this.width * 0.5;
            this.spriteY = this.y - this.height/2;
            this.gunX = this.side == 'left' ? this.x+100 : this.x-100;

        }
    }

    class BillyBob extends Enemy {
        constructor(game) {
            super(game);
            // this.game = game;
            this.image = document.getElementById('billy6');
            this.bulletImage = document.getElementById('bullet3');

            // Set sprites dimensions    
            this.spriteWidth = 489;
            this.spirteHeight = 195;
            this.width = this.spriteWidth;
            this.height = this.spirteHeight;
            this.bulletWidth = 67;
            this.bulletHeight = 30;

            // Sprite position 
            this.spriteX;
            this.spriteY;

            // Sprite frames
            this.frameX = 0;
            this.frameY = 0;
            this.yFrames = 7;

            this.damage = BILLIES_BULLET_DAMAGE[5];
            this.speedX = this.speedX + BILLIES_SPEED[5];
            this.bulletSpeedX = this.speedX + BILLIES_BULLET_SPEED[5];

            this.hasSecondShot = false;
            this.firstBulletGone = false;
            this.secondBulletGone = false;

            this.respawn();
        }

        respawn(){
            super.respawn();
            this.gunY = this.y+20;
            this.hasSecondShot = false;
            this.firstBulletGone = false;
            this.secondBulletGone = false;
            this.bulletX = this.gunX;
            this.bulletY = this.gunY;
            this.secondBulletX = this.gunX;
            this.secondBulletY = this.gunY;
        }

        draw(context){
            super.draw(context);

            if (this.game.debug){
                drawCircle(context, this.gunX, this.gunY, 15, 'red', 0.5);

                drawCircle(context, this.bulletX, this.bulletY, 3, "white", 1);
                drawCircle(context, this.bulletX, this.bulletY+this.bulletHeight, 3, "white", 1);
                drawCircle(context, this.bulletX+this.bulletWidth, this.bulletY, 3, "black", 1);
                drawCircle(context, this.bulletX+this.bulletWidth, this.bulletY+this.bulletHeight, 3, "black", 1);


                drawCircle(context, this.secondBulletX, this.secondBulletY, 3, "white", 1);
                drawCircle(context, this.secondBulletX, this.secondBulletY+this.bulletHeight, 3, "white", 1);
                drawCircle(context, this.secondBulletX+this.bulletWidth, this.secondBulletY, 3, "black", 1);
                drawCircle(context, this.secondBulletX+this.bulletWidth, this.secondBulletY+this.bulletHeight, 3, "black", 1);
            }

            // Draw second bullet if shot
            if (this.hasSecondShot && !this.secondBulletGone) {
                context.drawImage(
                    this.bulletImage,
                    this.frameX * this.bulletWidth, 0,
                    this.bulletWidth, this.bulletHeight,
                    this.secondBulletX, this.secondBulletY,
                    this.bulletWidth, this.bulletHeight
                );
            }
        }

        update(){
            super.update();

            this.spriteX = this.x - this.width * 0.5;
            this.spriteY = this.y - this.height/2;
            this.gunX = this.side == 'left' ? this.x+120 : this.x-120;

            if(this.shot && !this.secondBulletGone)
                this.stop = true;

            
            if (this.shot && !this.hasSecondShot) {
                // Randomization factor for second shot
                let r; do r = Math.random(); while (r === 0);   
                // When first bullet travels r % of screen, fire second shot
                if ((this.side === 'left'  && this.bulletX >= this.game.width * r) ||
                    (this.side === 'right' && this.bulletX <= this.game.width * 1-r)) {
                    
                    if (this.frameY < this.yFrames)
                        this.frameY ++;
                    else {
                        this.frameY = 0;
                        this.hasSecondShot = true;
                        this.secondBulletX = this.side=='left' ? this.gunX : this.gunX - this.bulletWidth;
                        this.secondBulletY = this.gunY-15;
                    }
                }
            }

            // Move second bullet
            if (this.hasSecondShot && !this.secondBulletGone) {
                if (this.side === 'left') {
                    this.secondBulletX += this.bulletSpeedX;
                    if (this.secondBulletX > this.game.width * 0.85 || this.secondBulletGone) {
                        this.stop = false;
                    }
                } else {
                    this.secondBulletX -= this.bulletSpeedX;
                    if (this.secondBulletX + this.bulletWidth < this.game.width * 0.15 || this.secondBulletGone) {
                        this.stop = false;
                    }
                }
            }

        }
    }


    class BillyBeth extends Enemy {
        constructor(game) {
            super(game);
            // this.game = game;
            this.image = document.getElementById('billy7');
            this.bulletImage = document.getElementById('bullet4');

            // Set sprites dimensions    
            this.spriteWidth = 389;
            this.spirteHeight = 191;
            this.width = this.spriteWidth;
            this.height = this.spirteHeight;
            this.bulletWidth = 120;
            this.bulletHeight = 34;

            // Sprite position 
            this.spriteX;
            this.spriteY;

            // Sprite frames
            this.frameX = 0;
            this.frameY = 0;
            this.yFrames = 7;

            this.damage = BILLIES_BULLET_DAMAGE[6];
            this.speedX = this.speedX + BILLIES_SPEED[6];
            this.bulletSpeedX = this.speedX + BILLIES_BULLET_SPEED[6];

            this.respawn();
        }

        respawn(){
            super.respawn();
            this.gunY = this.y+15;
            this.bulletX = this.gunX;
            this.bulletY = this.gunY;
        }

        draw(context){
            super.draw(context);
            if (this.game.debug){
                drawCircle(context, this.gunX, this.gunY, 15, 'red', 0.5);

                drawCircle(context, this.bulletX, this.bulletY, 3, "white", 1);
                drawCircle(context, this.bulletX, this.bulletY+this.bulletHeight, 3, "white", 1);
                drawCircle(context, this.bulletX+this.bulletWidth, this.bulletY, 3, "black", 1);
                drawCircle(context, this.bulletX+this.bulletWidth, this.bulletY+this.bulletHeight, 3, "black", 1);
            }
        }

        update(){
            super.update();
            if(this.bulletGone) this.stop = false;
            this.spriteX = this.x - this.width * 0.5;
            this.spriteY = this.y - this.height/2;
            this.gunX = this.side == 'left' ? this.x+100 : this.x-100;

        }
    }

    // ==================== FX Classes ====================
    class FX {
        constructor(game, x, y, color, opacity) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.color = color;
            this.opacity = opacity;

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
            drawCircle(context, this.x, this.y, this.radius, this.color, this.opacity);
            context.restore();
        }
    
    }

    // Blood class - used when a player gets hit by enemy
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

    // Explosion class - used when a player gets hit by rocket
    class Explosion extends FX {
        update(){
            // Give the fx downward circular motion
            this.angle += this.va * 0.5;
            this.x += 2 * Math.sin(this.angle) * this.speedX;
            this.y -= Math.cos(this.angle) * this.speedY;
    
            // Make the particles smaller
            if (this.radius > 0.1) 
                this.radius -= 0.05;
            
            // Make particles dissapear when they are small enough
            if (this.radius < 0.2){
                this.needToDelete = true;
                this.game.fx = this.game.removeGameObjects(this.game.fx);
            }
        }
    }

    // Munch class - used when player eats a shroom
    class Munch extends FX {
        constructor(game, x, y, color, opacity){
            super(game, x, y, color, opacity);
            this.radius += 2;
        }
        update(){
            // Give the fx wobbly motion
            this.angle += this.va;
            this.x += Math.cos(this.angle) * this.speedX; 
            this.y -= this.speedY;

            // Make fx smaller
            if (this.radius > 0.1) 
                this.radius -= 0.05;

            // Remove fx when it goes off screen or become small enough
            if (this.y < 0 - this.radius || this.radius < 0.2){
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
            
            this.score = 0;
            this.player = new Player(this);

            this.numberOfPlants = 10;
            this.plants = [];
            
            this.shroomSpawnTimer = 0;
            this.shroomSpawnInterval = SHROOM_SPAWN_SECONDS * 1000;
            this.numberOfShrooms = 10;
            this.shrooms = [];
            
            this.maxEnemies = 5;
            this.enemies = [];

            this.fx = [];

            this.gameObjects = [];
            
            this.win = false;
            this.gameOver = false;            
            this.debug = false;
        }  

        restart() {
            this.player.restart();
            this.score = 0;
            this.plants = [];
            this.enemies = [];
            this.shrooms = [];
            this.fx = [];
            this.gameObjects = [];
            this.shroomSpawnTimer = 0;
            this.win = false;
            this.gameOver = false;  

        }
        removeGameObjects(objects){
            objects = objects.filter(obj => !obj.needToDelete);
            return objects
        }
        

        eatShroom(shroom){
            const dx = (this.player.x+this.player.width*0.5) - (shroom.x + shroom.width*0.5);
            const dy = (this.player.y+this.player.height*0.5) - (shroom.y +shroom.height*0.75);
            const distance = Math.sqrt(dx ** 2 + dy ** 2);
            const radiusSum = this.player.radius + shroom.radius
            return distance < radiusSum*0.85 
        }

        // Check if enemy hit the player
        checkShot(enemy) {

            // Check Y coordinates
            if(enemy.bulletY >= this.player.y+17 && enemy.bulletY+enemy.bulletHeight <= this.player.y+17+this.player.height) {
            
                if(enemy.side == 'right') {
                    //  Check X coordinates
                    if(enemy.bulletX <= this.player.x+this.player.width*0.92 && enemy.bulletX+enemy.bulletWidth >= this.player.x) {
                        
                        if(!this.gameOver){
                            let r;      //  Randomization factor for enemy damage 
                            do r = Math.random(); while (r === 0); 
                            this.player.health -= Math.floor(r * enemy.damage);
                        }

                        enemy.bulletGone = true;
                        // enemy.stop = false;
                        for (let i=0; i<5; i++){
                            this.fx.push(new Blood(this, enemy.bulletX, enemy.bulletY, "red", 0.75));
                            if(enemy.bulletWidth == 120)
                                this.fx.push(new Explosion(this, enemy.bulletX, enemy.bulletY, "orange", 0.75));
                        }
                    }
                }
                else {
                    //  Check X coordinates
                    if(enemy.bulletX >= this.player.x+this.player.width*0.08 && enemy.bulletX+enemy.bulletWidth <= this.player.x+this.player.width) {
                        if(!this.gameOver){
                            let r;      //  Randomization factor for enemy damage
                            do r = Math.random(); while (r === 0); 
                            this.player.health -= Math.floor(r * enemy.damage);
                        }
                        enemy.bulletGone = true;
                        // enemy.stop = false;
                        for (let i=0; i<5; i++){
                            this.fx.push(new Blood(this, enemy.bulletX, enemy.bulletY, "red", 0.75));
                            if(enemy.bulletWidth == 120)
                                this.fx.push(new Explosion(this, enemy.bulletX, enemy.bulletY, "orange", 0.75));
                        }
                    }
                }
            }

            // Check second bullet if present
            if (enemy.hasSecondShot && !enemy.secondBulletGone) {
                // Check Y coordinates
                if (enemy.secondBulletY >= this.player.y + 17 &&
                    enemy.secondBulletY + enemy.bulletHeight <= this.player.y + 17 + this.player.height) {

                    if (enemy.side === 'right') {
                        if (enemy.secondBulletX <= this.player.x + this.player.width * 0.92 && enemy.secondBulletX + enemy.bulletWidth >= this.player.x) {
                            let r;      //  Randomization factor for enemy damage
                            do r = Math.random(); while (r === 0);                            
                            this.player.health -= Math.floor(r * enemy.damage);
                            enemy.secondBulletGone = true;
                            enemy.stop = false;
                            
                            for (let i = 0; i < 5; i++)
                                this.fx.push(new Blood(this, enemy.secondBulletX, enemy.secondBulletY, "red", 0.75));
                        }
                    } else {
                        if (enemy.secondBulletX >= this.player.x + this.player.width * 0.08 && enemy.secondBulletX + enemy.bulletWidth <= this.player.x + this.player.width) {
                            let r;      //  Randomization factor for enemy damage
                            do r = Math.random(); while (r === 0);   
                            this.player.health -= Math.floor(r * enemy.damage);
                            enemy.secondBulletGone = true;
                            enemy.stop = false;

                            for (let i = 0; i < 5; i++)
                                this.fx.push(new Blood(this, enemy.secondBulletX, enemy.secondBulletY, "red", 0.75));
                        }
                    }
                }
            }
        }
        showFinalMessage(context) {
            this.gameOver = true;
            if (!this.win) {
                this.player.health = 0;
            }
        
            context.save();
            context.fillStyle = 'rgba(0,0,0,0.75)';
            context.fillRect(0, 0, canvas.width, canvas.height);
        
            context.fillStyle = this.win ? 'lightgreen' : '#CD9A99';
            context.fillStroke = this.win ? 'darkgreen' : 'red';
            context.lineWidth = 1;
        
            context.textAlign = 'center';
        
            context.font = '130px David';
            context.fillText(this.win ? "WINNER" : "LOSER", this.width * 0.5, this.height * 0.25);
            context.strokeText(this.win ? "WINNER" : "LOSER", this.width * 0.5, this.height * 0.25);
        
            context.font = '42px Tahoma';
            context.fillText(
                this.win ? "YOU ESCAPED THE" : "YOU WERE HUNTED BY",
                this.width * 0.5,
                this.height * 0.25 + 50
            );
            context.strokeText(
                this.win ? "YOU ESCAPED THE" : "YOU WERE HUNTED BY",
                this.width * 0.5,
                this.height * 0.25 + 50
            );
        
            context.font = '120px Georgia';
            context.fillText("HILL BILLIES", this.width * 0.5, this.height * 0.25 + 150);
            context.strokeText("HILL BILLIES", this.width * 0.5, this.height * 0.25 + 150);
        
            context.restore();
        }
        


        render(context, deltaTime) {
            this.gameObjects = [this.player, ...this.plants, ...this.shrooms];
            
            this.gameObjects.sort((a,b) => {
                return ((a.y + a.height) - (b.y + b.height))
            });

            this.gameObjects.forEach(obj => {
                obj.draw(context);
                if(this.eatShroom(obj))
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

            // Spawn a new shroom every 'shroomSpawnInterval' ms, up to MAX_SHROOMS
            if (!this.gameOver && this.shroomSpawnTimer > this.shroomSpawnInterval && this.shrooms.length < MAX_SHROOMS) {
                this.shrooms.push(new MushroomPowerUp(this))
                this.shroomSpawnTimer = 0;
            } else {
                this.shroomSpawnTimer += deltaTime;
            }

            if (this.player.health <= 0){
                this.showFinalMessage(ctx);
            }
            
            if (this.score >= SHROOM_GOAL){
                this.win = true;
                this.showFinalMessage(ctx);
            }

            ctx.save();
            ctx.fillStyle='white';
            ctx.font = '35px Helvetica';
            ctx.textAlign = 'left';
            ctx.lineWidth = 5;
            ctx.strokeStyle='black';

            ctx.strokeText('HEALTH: ' + this.player.health, 180, 70);
            ctx.fillText('HEALTH: ' + this.player.health, 180, 70);

            ctx.strokeText('SCORE: ' + this.score, 180, 120);
            ctx.fillText('SCORE: ' + this.score, 180, 120);
            ctx.restore();            

        }

        init(){
            for(let i=0; i<this.numberOfPlants; i++){
                const num = Math.random();
                if(num < 0.333)
                    this.plants.push(new Bush(this));
                else if(num < 0.666)
                    this.plants.push(new Plant(this));
                else this.plants.push(new Grass(this));
            }
            
            // Add hill billies
            for (let i=0; i<3; i++){
                this.enemies.push(new Billy(this));
                this.enemies.push(new BillyBoy(this));
                this.enemies.push(new BabyBillyBoy(this));                
                if(i<2){
                    this.enemies.push(new BillyGirl(this));
                    this.enemies.push(new BillyGoat(this));
                }
                if(i<1){
                    this.enemies.push(new BillyBeth(this));
                    this.enemies.push(new BillyBob(this));
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