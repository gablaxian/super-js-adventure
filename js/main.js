
// get that canvas!
var canvas  = document.getElementById('super-js-adventure'),
    ctx     = canvas.getContext('2d'),
    width   = 256,
    height  = 224,
    mainLoop = null,
    key     = [0,0,0,0,0,0,0,0], // left, right, up, down, attack, use item, start, select
    link    = null, // our intrepid hero
    gutter  = 2,
    lastTime = 0,
    animationUpdateTime = 0,
    timeSinceLastFrameSwap = 0,
    elapsed = 0,
    player  = {
        x : 0,
        y : 0
    };

function Link(x, y) {

    this.img        = new Image();
    this.img.src    = 'images/link.png';

    this.x = x;
    this.y = y;

    this.fps = 16;
    this.animationUpdateTime = 1000 / this.fps;

    this.timeSinceLastFrameSwap = 0;

    this.sequences = {
        'stand-down':   [3],
        'stand-up':     [10],
        'stand-right':  [17],

        'walk-down':    [3,4,5,6,5,4,3,2,1,0,1,2],
        'walk-up':      [10,11,12,13,12,11,10,9,8,7,8,9],
        'walk-right':   [17,18,19,20,19,18,17,16,15,14,15,16]
    }
    this.sequenceIdx = 0;
    this.moving = false;
    this.facing = 'down';

    this.update = function(elapsed) {
        this.timeSinceLastFrameSwap += elapsed;

        // half the animation speed
        if( this.timeSinceLastFrameSwap > this.animationUpdateTime ) {

            var seq = this.moving ? 'walk-' : 'stand-';
            seq += (this.facing == 'left' ? 'right' : this.facing);

            var currentSequence = this.sequences[seq];

            if( this.sequenceIdx < currentSequence.length - 1 )
                this.sequenceIdx += 1;
            else
                this.sequenceIdx = 0;

            var col = currentSequence[this.sequenceIdx] % 7;
            var row = Math.floor( currentSequence[this.sequenceIdx] / 7 );

            this.offsetX = ( col * 16 ) + ( col * gutter );
            this.offsetY = row * 25;

            this.timeSinceLastFrameSwap = 0;
        }
    }

    this.draw = function() {

        var scaleX = this.facing == 'left' ? -1 : 1;

        ctx.save();

        ctx.translate(this.x, this.y)
        ctx.scale(scaleX, 1);
        ctx.drawImage(this.img, this.offsetX, this.offsetY, 16, 25, -8, 0, 16, 25);

        ctx.restore();
    }
}

function init() {
    // Initialise the player!
    link = new Link(100, 100);

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

function main() {
    /** Here's where we handle all the input, logic and drawing to the screen per frame. **/
    var now     = window.performance.now(),
        elapsed = (now - lastTime);

    lastTime = now;

    // Clear the screen
    ctx.clearRect(0, 0, 256, 224);

    var speed = 2;

    link.moving = false;

    // Handle the Input
    if (key[2]) {
        link.moving = true;
        link.facing = 'up';
        link.y -= speed;
    }
    if( key[3]) {
        link.moving = true;
        link.facing = 'down';
        link.y += speed;
    }
    if( key[0]) {
        link.moving = true;
        link.facing = 'left';
        link.x -= speed;
    }
    if( key[1]) {
        link.moving = true;
        link.facing = 'right';
        link.x += speed;
    }

    link.update(elapsed);

    link.draw();

    // call itself by requesting the next animation frame, and so begin the endless loop
    mainLoop = requestAnimationFrame(main);
}


// Initialise
init();

// Start the loop!
requestAnimationFrame(main);