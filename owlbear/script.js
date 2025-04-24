const TOP_MARGIN = window.innerHeight *0.2;

const ENEMY_SPEED = 3;


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
    context.stroke()
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

            // Set size, location and speed
            this.width = this.spriteWidth;
            this.height = this.spriteHeight
            this.x = this.game.width * 0.5;
            this.y = this.game.height * 0.5;
            this.speedX = 0;
            this.speedY = 0;
            this.maxSpeed = 7;
            
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
            this.delay = Math.random() * this.game.width * 0.5; // How far from screen the will enemy spawn
            
            this.image;
        
            this.stop;
        }

        // Draws the enemy on the canvas
        draw(context) {

            context.drawImage(
                this.image,
                this.frameX*this.width, 0,
                this.width, this.height,
                this.spriteX, this.spriteY,
                this.width, this.height
            );


        }

        // Updates enemy position
        update() {
            // Set sprite location
            this.spriteX = this.x - this.width * 0.5;
            this.spriteY = this.y - this.height;


            // Go left / right
            if(this.side == 'right' && !this.stop)
                this.x -= this.speedX;
            if(this.side == 'left' && !this.stop)
                this.x += this.speedX;

            // If reached shooting position - stop
            if (this.side == 'right' && this.spriteX + this.width*0.8 < this.game.width ) {
                this.stop = true;
            }
            if (this.side == 'left' && this.spriteX + this.width >  this.width*0.8) {
                this.stop = true;
            }

        }
    }

    class Billy extends Enemy {
        constructor(game) {
            super(game);
            // this.game = game;
            this.image = document.getElementById('billy1');

            // Set sprite dimensions    
            this.spriteWidth = 251;
            this.spirteHeight = 193;
            this.width = this.spriteWidth;
            this.height = this.spirteHeight;

            this.frameX = 0;
            this.frameY = 0;

            // Sprite position 
            this.spriteX;
            this.spriteY;    

            this.side = Math.random() < 0.5 ? 'left' : 'right';


            if (this.side == 'left') {
                this.x = - this.delay;
                this.frameX = 0;        
            }
            if (this.side == 'right') {
                this.x = this.game.width + this.width + this.delay;
                this.frameX = 1;        
            }
            this.y = TOP_MARGIN + Math.random() * (this.game.height - TOP_MARGIN);
        }

        draw(context){
            super.draw(context);
            if (this.side=='left')
                drawCircle(context, this.x+120, this.y+30, 20, 'red', 0.3);
            else    
                drawCircle(context, this.x-120, this.y+30, 20, 'red', 0.3);
        }

        update(){
            super.update();
            this.spriteX = this.x - this.width * 0.5;
            this.spriteY = this.y - this.height/2;
            
        }
    }
    class BabyBilly extends Enemy {
        constructor(game) {
            super(game);
            // this.game = game;
            this.image = document.getElementById('billy5');

            // Set sprite dimensions    
            this.spriteWidth = 497*0.5;
            this.spirteHeight = 143;
            this.width = this.spriteWidth;
            this.height = this.spirteHeight;

            this.frameX = 0;
            this.frameY = 0;

            // Sprite position 
            this.spriteX;
            this.spriteY;    

            this.side = Math.random() < 0.5 ? 'left' : 'right';


            if (this.side == 'left') {
                this.x = - this.delay;
                this.frameX = 0;        
            }
            if (this.side == 'right') {
                this.x = this.game.width + this.width + this.delay;
                this.frameX = 1;        
            }
            this.y = TOP_MARGIN + Math.random() * (this.game.height - TOP_MARGIN);
        }
        
        draw(context){
            super.draw(context);
            if (this.side=='left')
                drawCircle(context, this.x+120, this.y+20, 15, 'red', 0.3);
            else    
                drawCircle(context, this.x-120, this.y+20, 15, 'red', 0.3);
        }

        update(){
            super.update();
            this.spriteX = this.x - this.width * 0.5;
            this.spriteY = this.y - this.height/2;
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
        }  
        
        render(context, deltaTime) {
            this.player.draw(context);
            this.player.update(deltaTime);
            this.plants.forEach(plant => plant.draw(context));
            this.enemies.forEach(enemy => enemy.draw(context));
            this.enemies.forEach(enemy => enemy.update(context));
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
                    if (num<0.5)
                        this.enemies.push(new Billy(this));
                    else
                        this.enemies.push(new BabyBilly(this));

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