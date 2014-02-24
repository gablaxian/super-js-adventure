
// get that canvas!
var canvas  = document.getElementById('super-js-adventure'),
    ctx     = canvas.getContext('2d'),
    width   = 256,
    height  = 224,
    mainLoop = null,
    key     = [0,0,0,0,0,0,0,0], // left, right, up, down, attack, use item, start, select
    link    = new Image(),
    gutter  = 2,
    lastTime = 0,
    animationUpdateTime = 0,
    timeSinceLastFrameSwap = 0,
    elapsed = 0,
    player  = {
        x : 0,
        y : 0
    };

function init() {
    // Initialise the game!
    link.src = 'images/link.png';

    // Place Link a little more central
    player.x = 100;
    player.y = 100;

    // Link's downward walking sequence as grid positions starting with the standing image in the middle
    player.sequence     = [3,4,5,6,5,4,3,2,1,0,1,2];
    player.sequenceIdx  = 0;

    player.fps = 16;
    player.animationUpdateTime = 1000 / player.fps;

    // Setup the Input
    Input.init();

    lastTime = window.performance.now();

    // scale_canvas(3);
}

function scale_canvas(s) {
    var css = '';
        var prefixes = ['webkit','moz','o','ms'];
        for (var i=0; i<prefixes.length; i++)
        {
            var prefix = prefixes[i];
            css += '-'+prefix+'-transform: scale('+s+','+s+');';
            css += '-'+prefix+'-transform-origin: 0 0;'
        };
        canvas.style.cssText = css;
        canvas.parentNode.style.cssText = 'width:'+width*s+'px;height:'+height*s+'px;';
}

var frame_count = 0;

function main() {
    /** Here's where we handle all the input, logic and drawing to the screen per frame. **/
    var now     = window.performance.now(),
        elapsed = (now - lastTime);

    lastTime = now;

    // Clear the screen
    ctx.clearRect(0, 0, 256, 224);

    var speed = 2;

    // Handle the Input
    if (key[2])
        player.y -= speed;
    if( key[3])
        player.y += speed;
    if( key[0])
        player.x -= speed;
    if( key[1])
        player.x += speed;

    // loop through the walking sequence
    var spritePos = ( player.sequence[player.sequenceIdx] * gutter ) + ( player.sequence[player.sequenceIdx] * 16 );

    timeSinceLastFrameSwap += elapsed;

    // half the animation speed
    if( timeSinceLastFrameSwap > player.animationUpdateTime ) {
        if( player.sequenceIdx < player.sequence.length - 1 )
            player.sequenceIdx += 1;
        else
            player.sequenceIdx = 0;

        timeSinceLastFrameSwap = 0;
    }

    ctx.drawImage(link, spritePos, 0, 16, 25, player.x, player.y, 16, 25);

    frame_count++;

    // call itself by requesting the next animation frame, and so begin the endless loop
    mainLoop = requestAnimationFrame(main);
}


// Initialise
init();

// Start the loop!
requestAnimationFrame(main);