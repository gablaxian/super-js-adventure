
// get that canvas!
var canvas  = document.getElementById('super-js-adventure');
var ctx     = canvas.getContext('2d');
var width   = 256;
var height  = 224;
var mainLoop = null;
var key     = [0,0,0,0,0,0,0,0]; // left, right, up, down, attack, use item, start, select
var link    = null; // our intrepid hero
var gutter  = 2;
var lastTime = 0;
var animationUpdateTime = 0;
var timeSinceLastFrameSwap = 0;
var elapsed = 0;
var level;

function Link(x, y) {

    this.img        = new Image();
    this.img.src    = 'images/link.png';

    this.x = x;
    this.y = y;

    this.width = 16;
    this.height = 25;

    this.fps = 60;
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

            this.sliceX = ( col * 16 ) + ( col * gutter );
            this.sliceY = row * 25;

            this.timeSinceLastFrameSwap = 0;
        }
    }

    this.draw = function() {

        var scaleX = this.facing == 'left' ? -1 : 1;

        ctx.save();

        ctx.translate(this.x, this.y);
        ctx.translate(8, 0);
        ctx.scale(scaleX, 1);
        ctx.drawImage(this.img, this.sliceX, this.sliceY, 16, 25, -8, 0, 16, 25);

        ctx.restore();

    }
}

function init() {
    // Initialise the player!
    link = new Link(100, 100);

    // Setup the Input
    Input.init();

    lastTime = window.performance.now();

    zoom(2);

    level = world.level;
}

function zoom(s) {
    canvas.style.cssText = 'width:'+width*s+'px;height:'+height*s+'px;';
    canvas.parentNode.style.cssText = 'width:'+width*s+'px;height:'+height*s+'px;';
}

function drawBackground() {

    // check that the world exists.
    if( world ) {

        for (var row = 0; row < (height/8); row++) {
            for (var col = 0; col < (width/8); col++) {
                var tile = level[row][col];
                var x = (col * 8);
                var y = (row * 8);

                if( tile == 0 ) {
                    ctx.fillStyle = '#000';
                    ctx.strokeStyle = '#000';
                }
                else if( tile == 1 ) {
                    ctx.fillStyle = '#85724E';
                    ctx.strokeStyle = '#68583A';
                }
                else if( tile == 2 ) {
                    ctx.fillStyle = '#f88';
                    ctx.strokeStyle = '#f00';
                }

                ctx.fillRect(x, y, 8, 8);
                ctx.strokeRect(x+0.5, y+0.5, 8, 8);
            }
        }

    }

}

function checkCollisions() {
    if( link.x < 0 ) {
        link.x = 0;
    }
    if( link.y < 0 ) {
        link.y = 0;
    }
    if( (link.x + link.width) > width ) {
        link.x = (width - link.width);
    }
    if( (link.y + link.height) > height ) {
        link.y = (height - link.height);
    }

    if( key[2] ) { // up
        var topLeftCol = Math.floor(link.x / 8);
        var topRightCol = Math.floor((link.x+link.width-1) / 8);
        var row = Math.floor((link.y+9) / 8); // same for topleft and topright

        // now get the cells for each corner and check 'em!
        if( level[row][topLeftCol] == 2 || level[row][topRightCol] == 2 ) {
            link.y = (row * 8);
        }
    }
    if( key[3]) { // down
        var bottomLeftCol = Math.floor(link.x / 8);
        var bottomRightCol = Math.floor((link.x+link.width-1) / 8);
        var row = Math.floor((link.y+link.height) / 8);

        if( level[row][bottomLeftCol] == 2 || level[row][bottomRightCol] == 2 ) {
            link.y = (row * 8) - link.height;
        }
    }
    if( key[0]) { // left
        var col = Math.floor(link.x / 8);
        var topLeftRow = Math.floor((link.y+9) / 8);
        var bottomLeftRow = Math.floor((link.y+link.height-1) / 8);

        if( level[topLeftRow][col] == 2 || level[bottomLeftRow][col] == 2 ) {
            link.x = (col * 8) + 8;
        }
    }
    if( key[1]) { //right
        var col = Math.floor((link.x+link.width) / 8);
        var topRightRow = Math.floor((link.y+9) / 8);
        var bottomRightRow = Math.floor((link.y+link.height-1) / 8);

        if( level[topRightRow][col] == 2 || level[bottomRightRow][col] == 2 ) {
            link.x = (col * 8) - link.width;
        }
    }
}

function main() {
    /** Here's where we handle all the input, logic and drawing to the screen per frame. **/
    var now     = window.performance.now(),
        elapsed = (now - lastTime);

    lastTime = now;

    // Clear the screen
    ctx.clearRect(0, 0, 256, 224);

    drawBackground();

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

    checkCollisions();

    link.draw();

    // call itself by requesting the next animation frame, and so begin the endless loop
    requestAnimationFrame(main);
}


// Initialise
init();

// Start the loop!
requestAnimationFrame(main);