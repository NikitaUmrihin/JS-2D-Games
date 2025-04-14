// Constants for game settings
const MAX_ATTEMPTS = 500;       // Max number of attempts to place obstacles
const MAX_OBSTACLES = 5;        // Max number of obstacles in the game
const MAX_EGGS = 10;
const MAX_ENEMIES = 8;

const OBSTACLE_RADIUS = 45;
const PLAYER_RADIUS = 30;
const EGG_RADIUS = 45;
const HATCHLING_RADIUS = 27;
const ENEMY_RADIUS = 30;

const TOP_MARGIN = window.innerHeight *0.333;
const SECONDS_TO_HATCH = 5;
const ENEMY_SPEED = 2;
const GOAL = 20;

const PLAYER_COLORS = ['yellow', 'blue']

// ==================== Utility Functions ====================

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

// showFinalMessage tells the user if he won or lost
function showFinalMessage(game, context, canvas, deadHatchlings, score){
    context.save();
    context.fillStyle = 'rgba(0,0,0,0.75)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    let msg1;
    let msg2;
    
    if (deadHatchlings <= 0) {
        context.fillStyle = 'lightgreen';
        context.fillStroke = 'darkgreen';
        msg1 = "WINNER";
        msg2 = "YOU SAVED YOUR SPECIES FROM";
    } else {
        context.fillStyle = '#CD9A99';
        context.fillStroke = 'red';
        msg1 = "LOSER";
        msg2 = "YOUR SPECIES IS DOOMED FOR ";
    }
    
    context.lineWidth = 1;
    context.textAlign = 'left';
    context.fillText('SCORE: ' + score, 25, 50);
    context.fillText("EGGSTINCT: " + deadHatchlings, canvas.width-320, 50)
    context.textAlign = 'center';

    context.font = '130px David';
    context.fillText(msg1, game.width*0.5, game.height*0.25)
    context.strokeText(msg1, game.width*0.5, game.height*0.25);
    
    context.font = '42px Tahoma';
    context.fillText(msg2, game.width*0.5, game.height*0.25 + 50)
    context.strokeText(msg2, game.width*0.5, game.height*0.25 + 50);

    context.font = '69px Georgia';
    context.fillText("EGGSTINCTION", game.width*0.5, game.height*0.25 + 120)
    context.strokeText("EGGSTINCTION", game.width*0.5, game.height*0.25 + 120);

    context.restore();            
}

// ============================================================
// ===================>>> {    MAIN    } <<<===================
// ============================================================

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
    overlay.width = window.innerWidth * 0.95;
    overlay.height = window.innerHeight * 0.95;

    // Set drawing styles
    ctx.fillStyle='white';
    ctx.lineWidth=3;
    ctx.strokeStyle='black';
    ctx.font = '35px Helvetica';
    ctx.textAlign = 'center';
    ctx.textColor = 'black';

    // ==================== Player Class ====================
    class Player {
        constructor(game) {
    
            // game is passed in so the player can access shared stuff like the mouse position
            this.game = game;
    
            // Initial player position (center of the canvas)
            this.collisionX = this.game.width * 0.5;
            this.collisionY = this.game.height * 0.5;
    
            // Radius of the player's collision area
            this.collisionRadius = PLAYER_RADIUS;
    
            // Player speed is initialized 
            this.speedX = 0;
            this.speedY = 0;
    
            // Modifier to control how fast the player moves towards the mouse
            this.speedModifier = 10;
    
            // Differences between player and mouse
            this.dx = 0;
            this.dy = 0;
    
            // Set color and image for the player 
            this.color = "yellow";
            this.image = document.getElementById("player-" + this.color);
    
            // Define player sprite dimensions  
            this.spriteWidth = 255;
            this.spriteHeight = 256;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
    
            // Sprite location
            this.spriteX;
            this.spriteY;
    
            // Frames for player animation
            this.frameX = 0;
            this.frameY = 5;
            this.maxFrames = 58;
        }
        
        restart(){
            this.collisionX = this.game.width * 0.5;
            this.collisionY = this.game.height * 0.5;
            this.spriteX = this.collisionX - this.width * 0.5 - 100;
            this.spriteY = this.collisionY - this.height * 0.5;
        }
            
        // Draws the player on the canvas
        draw(context) {
    
            context.drawImage(
                this.image, 
                // Cropping area
                this.frameX * this.spriteWidth, this.frameY * this.spriteHeight,
                this.spriteWidth, this.spriteHeight,
                // Image location
                this.spriteX, this.spriteY - 100,
                this.width, this.height
            );
    
            if (this.game.debug) {
                drawCircle(context, this.collisionX, this.collisionY, this.collisionRadius, 'white', 0.1);
                
                if(!this.game.keyboardMode){
                    // Draw line
                    context.beginPath();
                    context.moveTo(this.collisionX, this.collisionY);
                    context.lineTo(this.game.mouse.x, this.game.mouse.y);
                    context.stroke();
                }
            }
        }
    
        // Updates player position based on mouse movement
        update() {
            if (!this.game.keyboardMode){
                this.dx = this.game.mouse.x - this.collisionX;
                this.dy = this.game.mouse.y - this.collisionY;
            } else{
                this.dx = 0;
                this.dy = 0;
                if (this.game.keys.ArrowUp) this.dy = -0.75*this.collisionRadius;
                if (this.game.keys.ArrowDown) this.dy = 0.75*this.collisionRadius;
                if (this.game.keys.ArrowLeft) this.dx =  -0.75*this.collisionRadius;
                if (this.game.keys.ArrowRight) this.dx = 0.75*this.collisionRadius;
            }
            
            // Calculate distance from mouse to player
            const distance = Math.sqrt(this.dx**2 + this.dy**2);
    
            // Calculate angle (in radians) between player and the mouse location
            const angle = Math.atan2(this.dy, this.dx);
    
            // Choose sprite frame based on angle
            if (angle < -2.74 || angle > 2.74) this.frameY = 6;
            else if (angle < -1.96) this.frameY = 7;
            else if (angle < -1.17) this.frameY = 0;
            else if (angle < -0.39) this.frameY = 1;
            else if (angle < 0.39) this.frameY = 2;
            else if (angle < 1.17) this.frameY = 3;
            else if (angle < 1.96) this.frameY = 4;
            else if (angle < 2.74) this.frameY = 5;
            else if (angle < 2.74) this.frameY = 5;
            
            // Sprite animation
            if (this.frameX < this.maxFrames)
                this.frameX ++;
            else this.frameX = 0;

            if (distance > this.speedModifier) {
                // Calculate speed (zero incase distance is undefined)
                this.speedX = (this.dx) / distance || 0;
                this.speedY = (this.dy) / distance || 0;
            } else {    // Stop moving if player is close to the mouse
                this.speedX = 0;
                this.speedY = 0;
            }
    
            // Move the player
            this.collisionX += this.speedX * this.speedModifier;
            this.collisionY += this.speedY * this.speedModifier;
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5;
    
            //  Horizontal boundaries - Left edge
            if (this.collisionX < this.collisionRadius)
                this.collisionX = this.collisionRadius;
            //  Horizontal boundaries - Right edge
            else if (this.collisionX > this.game.width - this.collisionRadius)
                this.collisionX = this.game.width - this.collisionRadius;
    
            //  Vertical boundaries - Top edge
            if (this.collisionY < TOP_MARGIN + this.collisionRadius)
                this.collisionY = TOP_MARGIN + this.collisionRadius;
            //  Vertical boundaries - Bottom edge
            if (this.collisionY > this.game.height - this.collisionRadius)
                this.collisionY = this.game.height - this.collisionRadius;
    
    
            // Adjust player position after checking for collisions with obstacles
            this.game.obstacles.forEach(obstacle => {
                let [collision, distance, radiusSum, dx, dy] = this.game.checkCollision(this, obstacle);
                if (collision) {
                    // Calculate unit vector for direction
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;
                    // Position the player 1 pixels away
                    this.collisionX = obstacle.collisionX + (radiusSum + 1) * unit_x;
                    this.collisionY = obstacle.collisionY + (radiusSum + 1) * unit_y;
    
                }
            });
    
        }
    }

    // ==================== Obstacle Class ====================
    class Obstacle {
        constructor(game) {
            this.game = game;
            
            // Randomly place the obstacle in game 
            this.collisionX = Math.random() * this.game.width;
            this.collisionY = Math.random() * this.game.height;
            this.collisionRadius = OBSTACLE_RADIUS;
            this.image = document.getElementById('obstacles');
            
            // Set sprite dimensions
            this.spriteWidth = 250;
            this.spriteHeight = 250;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
    
            // Set sprite position 
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5;
    
            // Randomize the sprite frame for variety 
            this.frameX = Math.floor(Math.random() * 4);
            this.frameY = Math.floor(Math.random() * 3);
    
        }
    
        // Draw obstacle on the canvas 
        draw(context) {
            
            context.drawImage(this.image,
                this.frameX * this.spriteWidth, this.frameY * this.spriteHeight,
                this.spriteWidth, this.spriteHeight,
                this.spriteX, this.spriteY - 80,
                this.width, this.height);
    
            if (this.game.debug) {
                drawCircle(context, this.collisionX, this.collisionY, this.collisionRadius, 'blue', 0.1);
            }
        }
    
        update() {
        }
    }

    // ==================== Egg Class ====================
    class Egg {
        constructor(game) {
            this.game = game;
    
            // Set egg radius and image
            this.collisionRadius = EGG_RADIUS;
            this.image = document.getElementById("egg");
            
            // Randomize location, keeping a margin from the borders
            this.margin = this.collisionRadius * 2;
            this.collisionX = this.margin + Math.random()*(this.game.width - 2*this.margin);
            this.collisionY = TOP_MARGIN + Math.random()*(this.game.height - TOP_MARGIN - this.margin);
    
            // Set sprite dimensions
            this.spriteWidth = 110;
            this.spriteHeight = 135;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
    
            // Sprite position 
            this.spriteX;
            this.spriteY;
    
            // Initialize hatch timer
            this.hatchTimer = 0;
            this.hatchInterval = SECONDS_TO_HATCH * 1000;
    
            // Initialize deletion flag
            this.needToDelete = false;
        }
    
        // Draws the eggs on the canvas
        draw(context) {
            context.drawImage(this.image, this.spriteX, this.spriteY);
    
            if (this.game.debug) {
                drawCircle(context, this.collisionX, this.collisionY, this.collisionRadius, 'orange', 0.1);
                const timerDisplay = (this.hatchTimer * 0.001).toFixed(0) ;
                context.fillText(timerDisplay, this.collisionX, this.collisionY - this.collisionRadius*2.4);
            }
        }
    
        // Updates egg position
        update(deltaTime) {
    
            // Update sprite location
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 30;
    
            //  Horizontal boundaries - Left edge
            if (this.collisionX < this.collisionRadius)
                this.collisionX = this.collisionRadius;
            //  Horizontal boundaries - Right edge
            else if (this.collisionX > this.game.width - this.collisionRadius)
                this.collisionX = this.game.width - this.collisionRadius;
    
            //  Vertical boundaries - Top edge
            if (this.collisionY < TOP_MARGIN + this.collisionRadius)
                this.collisionY = TOP_MARGIN + this.collisionRadius;
            //  Vertical boundaries - Bottom edge
            if (this.collisionY > this.game.height - this.collisionRadius)
                this.collisionY = this.game.height - this.collisionRadius;
    
            // Combine player, obstacles and enemies into a list of colliders for the egg
            // The spread operator (...) unpacks the elements of an array or object into individual elements
            let Colliders = [this.game.player, ...this.game.obstacles, ...this.game.enemies];
    
            // Check if eggs collide with other objects
            Colliders.forEach(obj => {
                let [collision, distance, radiusSum, dx, dy] = this.game.checkCollision(this, obj);
                if (collision) {
                    // Calculate unit vector for direction
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;
                    // Position egg 1 pixels away from object
                    this.collisionX = obj.collisionX + unit_x * (radiusSum + 1);
                    this.collisionY = obj.collisionY + unit_y * (radiusSum + 1);
                }
            })
    
            // When hatchTimer goes off or arrived to safety - the egg is hatched !
            if (this.hatchTimer > this.hatchInterval || this.collisionY < TOP_MARGIN + 0.5*this.collisionRadius) {
                // Create hatchling and delete egg
                this.game.hatchlings.push(new Hatchling(this.game, this.collisionX, this.collisionY));
                this.needToDelete = true;
                this.game.eggs = this.game.removeGameObjects(this.game.eggs);
            } else {
                this.hatchTimer += deltaTime;
            }
        }
    }

    // ==================== Hatchling Class ====================
    class Hatchling {
        constructor(game, x, y){
            this.game = game;
            // Initialize location, radius and speed
            this.collisionX = x;
            this.collisionY = y;
            this.collisionRadius = HATCHLING_RADIUS;
            this.speedY = 1 + Math.random();
    
            // Set image and sprite dimensions
            this.image = document.getElementById('hatchling');
            this.spriteWidth = 150;
            this.spriteHeight = 150;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
    
            // Sprite location
            this.spriteX;
            this.spriteY;
            
            // Frames for hatchling animation
            this.frameX = 0;
            this.frameY = Math.floor( Math.random() * 2 );
            this.maxFrames = 38;

            // Initialize deletion flag
            this.needToDelete = false;
        }
    
        // Draws the hatchling on the canvas
        draw(context){
            context.drawImage(
                this.image,
                this.frameX * this.spriteWidth, this.frameY * this.spriteHeight,
                this.spriteWidth, this.spriteHeight,            
                this.spriteX, this.spriteY,
                this.width, this.height
            );
            
            if(this.game.debug){
                drawCircle(context, this.collisionX, this.collisionY, this.collisionRadius, 'orange', 0.1);
            }
        }
    
        // Updates hatchling position
        update(){
            // Go up
            this.collisionY -= this.speedY;
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 50;
    
            // Check if hatchling arrived to safety
            if(this.collisionY < TOP_MARGIN - this.collisionRadius) {
                // Delete hatchling, increase score and create butterfly particles
                this.needToDelete = true;
                this.game.hatchlings = this.game.removeGameObjects(this.game.hatchlings);
                if (!this.game.gameOver) this.game.score++;
                for (let i=0; i<3; i++){
                    this.game.particles.push(new Firefly(this.game, this.collisionX, this.collisionY, "yellow"));
                }   
            }
    
            // Sprite animation
            if (this.frameX < this.maxFrames)
                this.frameX ++;
            else this.frameX = 0;

            // Combine player, eggs and obstacles into a list of colliders for the hatchling
            let Colliders = [this.game.player, ...this.game.obstacles, ...this.game.eggs];
    
            // Check if hatchling collides with other objects
            Colliders.forEach(obj => {
                let [collision, distance, radiusSum, dx, dy] = this.game.checkCollision(this, obj);
                if (collision) {
                    // Calculate unit vector for direction
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;
                    // Position egg 1 pixels away from object
                    this.collisionX = obj.collisionX + unit_x * (radiusSum + 1);
                    this.collisionY = obj.collisionY + unit_y * (radiusSum + 1);
                }
            })
    
            // Check if hatchling collides with enemies 
            this.game.enemies.forEach(enemy => {
                if (this.game.checkCollision(this, enemy)[0]){
                    // Delete hatcling, keep count of dead and create spark particles
                    this.needToDelete = true;
                    this.game.hatchlings = this.game.removeGameObjects(this.game.hatchlings);

                    if (!this.game.gameOver) this.game.deadHatchlings++;
                    
                    for (let i=0; i<5; i++){
                        this.game.particles.push(new Spark(this.game, this.collisionX, this.collisionY, "red"));
                    }   
                }
            })
        }
    
    }
    
    // ==================== Particle Classes ====================
    class Particle {
        constructor(game, x, y, color) {
            this.game = game;
            this.collisionX = x;
            this.collisionY = y;
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
    
        // Draws the particle on the canvas
        draw(context){
            context.save();
            context.fillStyle = this.color;
            drawCircle(context, this.collisionX, this.collisionY, this.radius, this.color, 0.75);
            context.restore();
        }
    
    }
    
    // Firefly class - used when a hatchling gets to safety
    class Firefly extends Particle {
        update(){
            // Give the particle wobbly motion
            this.angle += this.va;
            this.collisionX += Math.cos(this.angle) * this.speedX; 
            this.collisionY -= this.speedY;
    
            // Remove particle when it goes off screen
            if (this.collisionY < 0 - this.radius){
                this.needToDelete = true;
                this.game.particles = this.game.removeGameObjects(this.game.particles);
            }
        }
    }

    // Spark class - used when a hatchling dies
    class Spark extends Particle {
        update(){
            // Give the particle upward circular motion
            this.angle += this.va * 0.5;
            this.collisionX -= Math.sin(this.angle) * this.speedX;
            this.collisionY -= Math.cos(this.angle) * this.speedY + this.speedY * 0.2;
    
            // Make the particles smaller
            if (this.radius > 0.1) 
                this.radius -= 0.05;
            
            // Make particles dissapear when they are small enough
            if (this.radius < 0.2){
                this.needToDelete = true;
                this.game.particles = this.game.removeGameObjects(this.game.particles);
            }
        }
    }

    // ==================== Enemy Classes ====================
    class Enemy {
        constructor(game){
            this.game = game;
    
            // Set enemy radius, speed and delay
            this.collisionRadius = ENEMY_RADIUS;
            this.speedX = Math.random() * 3 + ENEMY_SPEED;
            this.delay = Math.random() * this.game.width * 0.5; // How far from screen the will enemy spawn

            this.xFrames;
            this.yFrames;
        }
    
        // Draws the enemy on the canvas
        draw(context) {
            context.drawImage(
                this.image,
                this.frameX*this.spriteWidth, this.frameY*this.spriteHeight,
                this.spriteWidth, this.spriteHeight,
                this.spriteX, this.spriteY,
                this.width, this.height
            );
    
            if (this.game.debug) {
                drawCircle(context, this.collisionX, this.collisionY, this.collisionRadius, 'red', 0.1);
            }
        }
    
        // Updates enemy position
        update(){
            // Set sprite location
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height + 40;
    
            // Go left
            this.collisionX -= this.speedX;
            // If reached end of the screen, spawn again
            if (this.spriteX + this.width < 0 && !this.game.gameOver) {
                this.collisionX = this.game.width + this.width + this.delay;
                this.collisionY = TOP_MARGIN + Math.random() * (this.game.height - TOP_MARGIN);
                this.frameX = Math.floor(Math.random()* this.xFrames)
                this.frameY = Math.floor(Math.random()* this.yFrames);
                // console.log(this)
            }
            
            // Combine player and obstacles into a list of colliders for the enemy
            let Colliders = [this.game.player, ...this.game.obstacles];
    
            // Check if enemy collide with other objects
            Colliders.forEach(obj => {
                let [collision, distance, radiusSum, dx, dy] = this.game.checkCollision(this, obj);
                if (collision) {
                    // Calculate unit vector for direction
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;
                    // Position egg 1 pixels away from object
                    this.collisionX = obj.collisionX + unit_x * (radiusSum + 1);
                    this.collisionY = obj.collisionY + unit_y * (radiusSum + 1);
                }
            });
        }
    
    }
    

    // ==================== Green Enemy Class ==================== 
    class Greenemy extends Enemy {
        constructor(game) {
            super(game);

            // Set image and sprite frames
            this.image = document.getElementById('greenemies');
            this.xFrames = 2; 
            this.yFrames = 4;
            this.frameX = Math.floor(Math.random() * this.xFrames);
            this.frameY = Math.floor(Math.random() * this.yFrames);


            // Set sprite dimensions
            this.spriteWidth = 140;
            this.spriteHeight = 260;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            
            // Sprite position 
            this.spriteX;
            this.spriteY;       

            // Set enemy location
            this.collisionX = this.game.width + this.width + this.delay;
            this.collisionY = TOP_MARGIN + Math.random() * (this.game.height - TOP_MARGIN);
            
        }
    }
    
    // ==================== Brown Enemy Class ==================== 
    class Brownemy extends Enemy {
        constructor(game) {
            super(game);
            // Set image and sprite frames
            this.image = document.getElementById('brownemies');
            this.xFrames = 2; 
            this.yFrames = 4;
            this.frameX = Math.floor(Math.random() * this.xFrames);
            this.frameY = Math.floor(Math.random() * this.yFrames);

            // Set sprite dimensions
            this.spriteWidth = 183;
            this.spriteHeight = 280;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;

            // Sprite position 
            this.spriteX;
            this.spriteY;    

            // Set enemy location
            this.collisionX = this.game.width + this.width + this.delay;
            this.collisionY = TOP_MARGIN + Math.random() * (this.game.height - TOP_MARGIN);
        }
        
    }

    // ==================== Mutant Enemy Class (Green + Brown) ==================== 
    class Menemy extends Enemy {
        constructor(game) {
            super(game);
            // Set image and sprite frames
            this.image = document.getElementById('menemies');
            this.xFrames = 3; 
            this.yFrames = 3;
            this.frameX = Math.floor(Math.random() * this.xFrames);
            this.frameY = Math.floor(Math.random() * this.yFrames);

            console.log(this.frameX, this.frameY)

            // Set sprite dimensions
            this.spriteWidth = 222;
            this.spriteHeight = 222;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;

            // Sprite position 
            this.spriteX;
            this.spriteY;    

            // Set enemy location
            this.collisionX = this.game.width + this.width + this.delay;
            this.collisionY = TOP_MARGIN + Math.random() * (this.game.height - TOP_MARGIN);
        }
        
    }

    // ==================== Game Class ====================
    class Game {
        constructor(canvas) {
            this.canvas = canvas;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            
            // Create a player instance
            this.player = new Player(this);
            
            // Initialize obstacles array
            this.numOfObstacles = MAX_OBSTACLES;
            this.obstacles = [];
    
            // Initialize eggs array and eggs spawn timer
            this.eggs = [];
            this.eggSpawnTimer = 0;
            this.eggSpawnInterval = 1000;
            
            // Initialize enemies, hatchlings and particles array
            this.enemies = [];
            this.hatchlings = [];
            this.particles = [];
            
            // Array to hold all game objects
            this.allObjects = []; 
    
            // Initialize score and deadHatchlings to zero
            this.score = 0;
            this.deadHatchlings = 0;
            
            
            // Mouse properties (start at canvas center)
            this.mouse = {
                x: this.width * 0.5,
                y: this.height * 0.5,
                pressed: false
            };

            // Pressed arrow keys
            this.keys = {
                ArrowUp: false,
                ArrowDown: false,
                ArrowLeft: false,
                ArrowRight: false,
            };
            // Flags for debug mode, keyboard mode and game over
            this.debug = false;
            this.keyboardMode = true;
            this.gameOver = false;
            
            /// Game timer and FPS settings 
            this.fps = 69;
            this.timer = 0;
            this.interval = 1000 / this.fps;
    
    
            // _____ 👂 Keyboard Listeners 👂_____
            // Event listener for pressed keys
            window.addEventListener('keydown', (e) => {
                // If button 'd' pressed -> toggle debug mode
                if (e.key === 'd')  this.debug = !this.debug;
                // If button 'c' pressed and in debug mode -> console.log all game objects
                if (e.key === 'c' && this.debug) console.log(this.enemies);
                if (e.key === 'f') this.toggleFullscreen();
                // If button 'r' pressed -> restart game
                if (e.key === 'r') {
                    this.restart();
                this.obstacles = [];
                this.enemies = [];
                this.eggs = [];
                this.hatchlings = [];
                this.particles = [];
                this.mouse = {
                    x: this.width * 0.5,
                    y: this.height * 0.5,
                    pressed: false
                }

                this.score = 0;
                this.deadHatchlings = 0;
                this.gameOver = false;
                this.init();
                }

                if (e.key === 'k') {
                    console.log(this.keyboardMode)
                    this.keyboardMode = !this.keyboardMode;
                }

                if (this.keyboardMode && this.keys.hasOwnProperty(e.key)) {
                    this.keys[e.key] = true;
                }
            });

            
            window.addEventListener('keyup', (e) => {
                if (this.keyboardMode && this.keys.hasOwnProperty(e.key)) {
                    this.keys[e.key] = false;
                }
            });
            
            // _____ 👂 __________________ 👂_____
    
    
            // ______ 🐭 Mouse Listeners 🐭______
            // Event listener for mouse press
            if(this.keyboardMode === false){
                window.addEventListener('mousedown', (e) => {
                    // console.log("down:", e.offsetX, e.offsetY);
                    this.mouse.x = e.offsetX;
                    this.mouse.y = e.offsetY;
                    this.mouse.pressed = true;
                });
        
                // Event listener for mouse release
                window.addEventListener('mouseup', (e) => {
                    // console.log("up:", e.offsetX, e.offsetY);
                    this.mouse.x = e.offsetX;
                    this.mouse.y = e.offsetY;
                    this.mouse.pressed = false;
                });
        
                // Event listener for mouse movement
                window.addEventListener('mousemove', (e) => {
                    // console.log("moving:", e.offsetX, e.offsetY);
                    if (this.mouse.pressed) {
                        this.mouse.x = e.offsetX;
                        this.mouse.y = e.offsetY;
                    }
                });
            }
            // ______ 🐭 _______________ 🐭______
        }
    
        // Render method to update and draw game elements
        render(context, deltaTime) {
            
            // Rerender when timer reaches interval
            if (this.timer > this.interval) {
                // Clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
    
                // Put all game objects into one array
                this.allObjects = [
                    this.player,
                    ...this.eggs,
                    ...this.obstacles, 
                    ...this.enemies, 
                    ...this.hatchlings, 
                    ...this.particles
                ];
    
                // Initialize timer
                this.timer = 0;
    
                // Sort objects by their Y coordinate :
                //      Allows us to control drawing order and create a 3D experience
                this.allObjects.sort((a,b) => {
                    return a.collisionY - b.collisionY;
                });
    
                // Draw and update all objects
                this.allObjects.forEach(obj => {
                    obj.draw(context);
                    obj.update(deltaTime);
                });
    
            }
            this.timer += deltaTime;
    
            // Spawn a new egg every 'eggSpawnInterval' ms, up to MAX_EGGS
            if (!this.gameOver && this.eggSpawnTimer > this.eggSpawnInterval && this.eggs.length < MAX_EGGS) {
                this.addEgg();
                this.eggSpawnTimer = 0;
            } else {
                this.eggSpawnTimer += deltaTime;
            }

            //  Show score on screen
            context.save();
            context.textAlign = 'left';
            context.fillText('SCORE: ' + this.score, 25, 50);
            if (this.debug){
                context.fillText("EGGSTINCT: " + this.deadHatchlings, this.canvas.width-320, 50)
            }
            context.restore();

            // If you saved enough hatchlings - GAME OVER !
            if (this.score >= GOAL) {
                this.gameOver = true;
                showFinalMessage(this, ctx, canvas, this.deadHatchlings, this.score)
            }
        }
    
        // Check for collisions between two objects
        checkCollision(a, b) {
            const dx = a.collisionX - b.collisionX;
            const dy = a.collisionY - b.collisionY;
            const distance = Math.sqrt(dx ** 2 + dy ** 2);
            const radiusSum = a.collisionRadius + b.collisionRadius;
            return [(distance < radiusSum), distance, radiusSum, dx, dy];
        }
    
        addEgg() {
            this.eggs.push(new Egg(this));
        }
        
        // Add random enemies
        addEnemy(){
            let choose = Math.random()
            if (choose <= 0.333333333)
                this.enemies.push(new Greenemy(this));
            else if (choose >= 0.666666666)
                this.enemies.push(new Brownemy(this));
            else
                this.enemies.push(new Menemy(this));
        }
        
        toggleFullscreen(){
            if (!document.fullscreenElement){
                document.documentElement.requestFullscreen();
            }
            else {
                document.exitFullscreen();
            }

        }

        removeGameObjects(objects){
            // Filter only object that we don't need to delete
            objects = objects.filter(obj => !obj.needToDelete);
            return objects
        }
        
        restart() {
            this.player.restart();
        }

        // Initialize obstacles in the game 
        init() {
    
            for (let i=0; i<MAX_ENEMIES; i++){
                this.addEnemy();
            }
    
            let attempts = 0;
    
            // While we haven't reached the max number of obstacles and attempts limit
            while (this.obstacles.length < this.numOfObstacles && attempts < MAX_ATTEMPTS) {
                let overlap = false;
                let testObstacle = new Obstacle(this);
    
                // Check all existing obstacles to see if the new obstacle overlaps with them
                this.obstacles.forEach(obstacle => {
    
                    // Calculate the distance between the new obstacle and the current obstacle
                    const dx = testObstacle.collisionX - obstacle.collisionX;
                    const dy = testObstacle.collisionY - obstacle.collisionY;
                    const distance = Math.sqrt(dx**2 + dy**2);  // distance between two centers
                    
                    // Define a buffer space between obstacles so player could move between
                    const space = 150;
    
                    // In case of overlap - raise flag
                    if(distance < testObstacle.collisionRadius + obstacle.collisionRadius + space) {
                        overlap = true;
                    }
                });
    
                const margin = 2.25 * testObstacle.collisionRadius
                
                // Check if the obstacle is within the bounds of the canvas (with margin)
                let insideGame = testObstacle.spriteX > 0 &&
                    testObstacle.spriteX < this.width - testObstacle.width &&
                    testObstacle.collisionY > TOP_MARGIN + margin &&
                    testObstacle.collisionY < this.height - margin;
    
                if (!overlap && insideGame) {
                    this.obstacles.push(testObstacle);
                }
    
                attempts++;
            }
        }
    }

    // Create a new game
    const game = new Game(canvas);
    game.init();

    let lastTime = 0;

    // Animation loop to continuously update and render the game
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        // Render game elements
        game.render(ctx, deltaTime);
        // Call animate recursively
        requestAnimationFrame(animate);
    }

    // Start animation loop
    animate(0);

});