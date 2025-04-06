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
            this.collisionRadius = 30;

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

    // Game class manages the entire game state
    class Game {
        constructor(canvas) {
            this.canvas = canvas;
            this.width = this.canvas.width;
            this.height = this.canvas.height;

            // Create a player instance
            this.player = new Player(this);

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
        }
    }

    // Create a new game
    const game = new Game(canvas);
    

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