// Constants for game settings

const MAX_ATTEMPTS = 500;       // Max number of attempts to place obstacles
const MAX_OBSTACLES = 5;        // Max number of obstacles in the game

const OBSTACLE_RADIUS = 40;     // Radius of obstacles
const PLAYER_RADIUS = 50;       // Radius of the player

const TOP_MARGIN = window.innerHeight * 0.3333;

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
    ctx.strokeStyle='white';

    // Player class represents the player character
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
            this.speedModifier = 20;

            // Differences between player and mouse
            this.dx = 0;
            this.dy = 0;
        }

        // Draws the player on the canvas
        draw(context) {

            // Draw a circle at the player’s position
            context.beginPath();
            context.arc(this.collisionX, this.collisionY, 50, 0, Math.PI * 2);
            
            // save() & restore() allows us to apply globalAlpha only to fill()
            context.save();
            context.globalAlpha = 0.25;     // Opacity
            context.fill()                  // Fill the circle
            context.restore();
            context.stroke()
            
            // Draw a line from player’s position to mouse position 
            context.beginPath();
            context.moveTo(this.collisionX, this.collisionY);
            context.lineTo(this.game.mouse.x, this.game.mouse.y);
            context.stroke()

        }

        // Updates player position based on mouse movement
        update() {
            this.dx = this.game.mouse.x - this.collisionX;
            this.dy = this.game.mouse.y - this.collisionY;
            
            // Calculate distance from mouse to player
            const distance = Math.sqrt(this.dx**2 + this.dy**2);

            // Calculate speed (zero incase distance is undefined)
            this.speedX = (this.dx)/distance || 0;
            this.speedY = (this.dy)/distance || 0;
            
            // Move the player
            if (distance > this.speedModifier) {
                this.collisionX += this.speedX * this.speedModifier;
                this.collisionY += this.speedY * this.speedModifier;
            }
            // Stop moving if player is close to the mouse 
            else {
                this.speedX = 0;
                this.speedY = 0;
            }

        }
    }


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
            this.spriteX = this.collisionX - this.width * 0.5
            this.spriteY = this.collisionY - this.height * 0.5

            // Randomize the sprite frame for variety 
            this.frameX = Math.floor(Math.random() * 4);
            this.frameY = Math.floor(Math.random() * 3);

        }

        // Draw obstacle on the canvas 
        draw(context) {

            context.drawImage(this.image,
                this.frameX * this.spriteWidth, this.frameY * this.spriteHeight,
                this.spriteWidth, this.spriteHeight,
                this.spriteX, this.spriteY-80,
                this.width, this.height);

            // Draw circle
            context.beginPath();
            context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
            
            // save() & restore() allows us to apply globalAlpha only to fill()
            context.save();
            context.fillStyle='red';
            context.globalAlpha = 0.15;
            context.fill()
            context.restore();
            context.stroke()
        }
    }


    // Game class manages the entire game state
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
            
            // Mouse properties (start at canvas center)
            this.mouse = {
                x:          this.width * 0.5,
                y:          this.height * 0.5,
                pressed:    false
            }
            
            // _____ 🐭 Mouse Listeners 🐭_____
            // Event listener for mouse press
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
                this.mouse.x = e.offsetX;
                this.mouse.y = e.offsetY;
            });
            // _____ 🐭 _______________ 🐭_____
        }

        // Render method to update and draw game elements
        render(context) {
            this.player.draw(context);
            this.player.update();
            this.obstacles.forEach(obstacle => obstacle.draw(context))
        }

        // Initialize obstacles in the game 
        init() {
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
                
                
                const margin = 2* testObstacle.collisionRadius

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
    

    // Animation loop to continuously update and render the game
    function animate() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Render game elements
        game.render(ctx);
        // Call animate recursively
        requestAnimationFrame(animate);
    }

    // Start animation loop
    animate(); 

});