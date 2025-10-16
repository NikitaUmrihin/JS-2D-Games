class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

}


window.addEventListener('load', function ()     // Waits for the whole page to load before running the code
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
    

});