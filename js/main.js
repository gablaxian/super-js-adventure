
// get that canvas!
var canvas  = document.getElementById('super-js-adventure'),
    ctx     = canvas.getContext('2d'),
    width   = 256,
    height  = 224,
    link    = new Image();


function init() {
    // Initialise the game!
    link.src = 'images/link.png';
}

function main() {
    // Here's where we handle all the input, logic and drawing to the screen per frame.
    ctx.clearRect(0, 0, 256, 224);

    ctx.drawImage(link, 20, 20);

    // call itself by requesting the next animation frame, and so begin the endless loop
    requestAnimationFrame(main);
}


// Initialise
init();

// Start the loop!
requestAnimationFrame(main);