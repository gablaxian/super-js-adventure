
// get that canvas!
var canvas  = document.getElementById('super-js-adventure'),
    ctx     = canvas.getContext('2d'),
    width   = 256,
    height  = 224,
    key     = [0,0,0,0,0],
    link    = new Image(),
    player  = {
        x : 0,
        y : 0
    };


function changeKey(which, to){
    switch (which){
        case 65: case 37: key[0]=to; break; // left
        case 87: case 38: key[2]=to; break; // up
        case 68: case 39: key[1]=to; break; // right
        case 83: case 40: key[3]=to; break;// down
        case 32: key[4]=to; break; // space bar;
    }
}
document.onkeydown = function(e)  { changeKey((e||window.event).keyCode, 1); }
document.onkeyup = function(e)    { changeKey((e||window.event).keyCode, 0); }

function init() {
    // Initialise the game!
    link.src = 'images/link.png';

    // Place Link a little more central
    player.x = 100;
    player.y = 100;
}

function main() {
    /** Here's where we handle all the input, logic and drawing to the screen per frame. **/

    // Clear the screen
    ctx.clearRect(0, 0, 256, 224);

    // Handle the Input
    if (key[2])
        player.y -= 4;
    if( key[3])
        player.y += 4;
    if( key[0])
        player.x -= 4;
    if( key[1])
        player.x += 4;

    ctx.drawImage(link, player.x, player.y);

    // call itself by requesting the next animation frame, and so begin the endless loop
    requestAnimationFrame(main);
}


// Initialise
init();

// Start the loop!
requestAnimationFrame(main);