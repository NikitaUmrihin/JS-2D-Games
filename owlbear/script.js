const TOP_MARGIN = window.innerHeight *0.33;

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

    // InputHandler updates game.lastKey
    class InputHandler {
        constructor(game){
            this.game = game;
            window.addEventListener('keydown', (e) => {
                this.game.lastKey = e.key + 'Pressed';
            });
            window.addEventListener('keyup', (e) => {
                this.game.lastKey = e.key + 'Released';
                console.log(this.game.lastKey)
            });
        }

    }

    class Player {
        constructor(game){
            this.game = game;
            // Initialize size, location and speed
            this.width = 100;
            this.height = 100;
            this.x = this.game.width * 0.5;
            this.y = this.game.height * 0.5;
            this.speedX = 0;
            this.speedY = 0;
            this.maxSpeed = 7;
        }

        draw(context){
            context.fillRect(this.x, this.y, this.width, this.height)
        }

        setSpeed(speedX, speedY) {
            this.speedX = speedX;
            this.speedY = speedY;
        }

        update(){
            // Set speed according to last key pressed
            if(this.game.lastKey == "ArrowLeftPressed") {
                this.setSpeed(-this.maxSpeed, 0);
            } else if (this.game.lastKey == "ArrowRightPressed") {
                this.setSpeed(this.maxSpeed, 0);
            } else if (this.game.lastKey == "ArrowUpPressed"){
                this.setSpeed(0, -this.maxSpeed);
            } else if (this.game.lastKey == "ArrowDownPressed") {
                this.setSpeed(0, this.maxSpeed);
            } else {
                this.setSpeed(0, 0);
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
        }
    }

    class Game {
        constructor(width, height){
            this.width = width;
            this.height = height;
            this.lastKey = undefined;
            this.input = new InputHandler(this);
            this.player = new Player(this);
        }  
        
        render(context) {
            this.player.draw(context);
            this.player.update();
        }
    }

    const game = new Game(canvas.width, canvas.height);
    
    function animate(){
        ctx.clearRect(0,0, canvas.width, canvas.height);
        game.render(ctx);
        requestAnimationFrame(animate);
    }

    animate();
});