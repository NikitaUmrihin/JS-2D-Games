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
        
        window.addEventListener('keydown', e => {
            
            if(this.keys.indexOf(e.key) === -1)
                this.keys.push(e.key);
            console.log(this.keys);
        });
        
        window.addEventListener('keyup', e => {
            if(this.keys.indexOf(e.key) !== -1)
                this.keys.splice(this.keys.indexOf(e.key), 1);
        });
        
    }


    render(context){
        this.player.draw(context);
        this.player.update();
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