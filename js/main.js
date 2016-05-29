
// get that canvas!
var canvas  = document.getElementById('super-js-adventure');
var ctx     = canvas.getContext('2d');

var width   = 256;
var height  = 224;

var ROOM_HEIGHT = 176;

var TILE_WIDTH = 8;

var NUM_TILES_WIDE = width / TILE_WIDTH;
var NUM_TILES_HIGH = ROOM_HEIGHT / TILE_WIDTH; // we want the HUD space at the top

var HUD_HEIGHT = 6 * TILE_WIDTH;

var link        = null; // our intrepid hero
var key         = [0,0,0,0,0,0,0,0]; // left, right, up, down, attack, use item, start, select

var lastTime    = 0;
var animationUpdateTime = 0;
var timeSinceLastFrameSwap = 0;
var elapsed = 0;

var gameLoaded = false;
var tileset;

var animationTiles  = [];
var tileSequences   = {};

var tileFPS         = 7;
var tileUpdateTime  = 1000 / tileFPS;
var timeSinceLastTileFrameSwap = 0;
var tileSequenceIdx = 0;

var screenAnimating;


function Link(x, y) {

    this.img        = new Image();
    this.img.src    = 'images/link.png';

    this.x = x;
    this.y = y;

    this.width  = 17;
    this.height = 25;

    this.speed  = 1;

    this.fps                    = 30;
    this.animationUpdateTime    = (1000 / this.fps);
    this.timeSinceLastFrameSwap = 0;

    this.sequences = {
        'stand-down':   [3],
        'stand-up':     [10],
        'stand-right':  [17],
        'stand-left':   [24],

        'walk-down':    [3,4,5,6,5,4,3,2,1,0,1,2],
        'walk-up':      [10,11,12,13,12,11,10,9,8,7,8,9],
        'walk-right':   [17,18,19,20,19,18,17,16,15,14,15,16],
        // 'walk-right':   [17,18,19,20,16,17,18,19],
        'walk-left':    [24,25,26,27,26,25,24,23,22,21,22,23]
    }
    this.sequenceIdx = 0;
    this.moving = false;
    this.facing = 'down';

    this.update = function(elapsed) {
        this.timeSinceLastFrameSwap += elapsed;

        if( this.timeSinceLastFrameSwap > this.animationUpdateTime ) {

            var seq = (this.moving ? 'walk-' : 'stand-') + this.facing;

            var currentSequence = this.sequences[seq];

            if( this.sequenceIdx < currentSequence.length - 1 )
                this.sequenceIdx += 1;
            else
                this.sequenceIdx = 0;

            var col = currentSequence[this.sequenceIdx] % 7;
            var row = Math.floor( currentSequence[this.sequenceIdx] / 7 );

            this.offsetX = col * this.width;
            this.offsetY = row * this.height;

            this.timeSinceLastFrameSwap = 0;
        }
    }

    this.draw = function() {
        ctx.drawImage(this.img, this.offsetX, this.offsetY, this.width, this.height, this.x, this.y, this.width, this.height);
    }
}

var Map = {

    currentMapID:       null,
    currentGridCell:    0,
    currentRoomID:      null,
    nextGridCell:       0,
    nextRoomID:         null,
    nextRoomDir:        null,
    screenAnimating:    false,
    distanceToScroll:   0,
    speed:              2,
    count:              0,

    // called on game load to set initial values
    init: function(mapID, gridCell) {
        this.currentMapID       = mapID;
        this.currentGridCell    = gridCell;
        this.currentRoomID      = world.maps[this.currentMapID].structure.data[this.currentGridCell];
    },

    // Main workhorse function. Called in the main loop.
    // Handles tile animation logic, room transitions and the drawing of a room.
    drawBackground: function(elapsed) {

        // store and increment the tile sequence array based on the tile FPS.
        timeSinceLastTileFrameSwap += elapsed;

        if( timeSinceLastTileFrameSwap > tileUpdateTime ) {
            if( tileSequenceIdx < 2 ) {
                tileSequenceIdx++;
            }
            else {
                tileSequenceIdx = 0;
            }

            timeSinceLastTileFrameSwap = 0;
        }

        // save the stack so any following operations do not affect the rest of the game’s drawing operations
        ctx.save();

        // are we in a room transitioning state?
        if( screenAnimating ) {
            this.count += this.speed;

            // if we've scrolled enough then end this transitioning madness and set the current
            // room values to the where we've just scrolled to
            if( this.count >= this.distanceToScroll ) {
                this.count              = this.distanceToScroll;
                this.currentGridCell    = this.nextGridCell;
                this.currentRoomID      = this.nextRoomID;
                screenAnimating         = false;
            }

            // where to draw the next room
            var nextRoomX = 0;
            var nextRoomY = 0;

            // where to scroll to
            var scrollX = 0;
            var scrollY = 0;

            // Depending which direction we exited a room, we need to draw the next room.
            // e.g. If we moved up, the current screen is already at 0,0 so the next screen would be
            // at 0, -ROOM_HEIGHT.
            if( this.nextRoomDir == 'up' || this.nextRoomDir == 'down' ) {
                nextRoomY = this.nextRoomDir == 'up' ? -ROOM_HEIGHT : ROOM_HEIGHT;
                scrollY = nextRoomY > 0 ?  -this.count : this.count;
            }
            else {
                nextRoomX = this.nextRoomDir == 'left' ? -width: width;
                scrollX = nextRoomX > 0 ? -this.count : this.count;
            }

            // now with two screens stacked next to each other incrementally translate the whole canvas
            // in the direction of the new room.
            ctx.translate(scrollX, scrollY);

            this.drawRoom(this.nextRoomID, nextRoomX, nextRoomY);
        }

        this.drawRoom(this.currentRoomID, 0, 0);
        
        ctx.restore();

    },

    // handles all single room drawing logic
    drawRoom: function(id, posX, posY) {
        var room = world.maps[this.currentMapID].rooms[id];

        var x = 0;
        var y = 0;

        var layer1 = room.layers[0].data;
        var layer2 = room.layers[1].data;

        var spriteCols  = world.tilesets[0].width / TILE_WIDTH;

        // set a fillStyle of (off)black for background cells set to 0 (cave entrances, etc...)
        ctx.fillStyle = 'rgb(34,39,34)';

        for (var row = 0; row < NUM_TILES_HIGH; row++) {
            for (var col = 0; col < NUM_TILES_WIDE; col++) {

                var tile1   = layer1[( (row * NUM_TILES_WIDE) + col)];
                var tile2   = layer2[( (row * NUM_TILES_WIDE) + col)];
                x           = posX + (col * 8);
                y           = posY + (row * 8);

                // calculate position and draw ground tile
                if( tile1 > 0 ) {
                    var spriteCol1   = tile1 % spriteCols;
                    var spriteRow1   = Math.floor(tile1 / spriteCols);

                    ctx.drawImage(tileset, (spriteCol1 * TILE_WIDTH), (spriteRow1 * TILE_WIDTH), TILE_WIDTH, TILE_WIDTH, x, y, TILE_WIDTH, TILE_WIDTH);
                }
                // draw black/empty tile
                else {
                    ctx.fillRect(x, y, TILE_WIDTH, TILE_WIDTH);
                }

                // calculate position and draw world tile if one exists
                if( tile2 > 0 ) {

                    // if the world tile matches an ID of an animation tile, set the tile ID to the next in the sequence
                    if( animationTiles.indexOf(tile2) != -1 ) {
                        tile2 = tileSequences[tile2][tileSequenceIdx];
                    }

                    var spriteCol2   = tile2 % spriteCols;
                    var spriteRow2   = Math.floor(tile2 / spriteCols);

                    ctx.drawImage(tileset, (spriteCol2 * TILE_WIDTH), (spriteRow2 * TILE_WIDTH), TILE_WIDTH, TILE_WIDTH, x, y, TILE_WIDTH, TILE_WIDTH);
                }
            }
        }
    },

    loadNextRoom: function(dir) {
        // Cutting corners by assuming the player is confined to the maps’s grid structure.
        if( dir == 'left' ) {
            this.nextGridCell   = this.currentGridCell - 1;
            this.distanceToScroll = width;
        }
        else if( dir == 'right' ) {
            this.nextGridCell = this.currentGridCell + 1;
            this.distanceToScroll = width;
        }
        else if( dir == 'up' ) {
            this.nextGridCell = this.currentGridCell - world.maps[this.currentMapID].structure.width;
            this.distanceToScroll = ROOM_HEIGHT;
        }
        else if( dir == 'down' ) {
            this.nextGridCell = this.currentGridCell + world.maps[this.currentMapID].structure.width;
            this.distanceToScroll = ROOM_HEIGHT;
        }

        this.nextRoomDir    = dir;
        this.nextRoomID     = world.maps[this.currentMapID].structure.data[this.nextGridCell];
        this.count          = 0;
        screenAnimating     = true;
    }
}

function init() {

    // Initialise the player!
    link = new Link(100, 100);

    // Set the starting grid area
    Map.init('overworld', 7);

    // Setup the Input
    Input.init();

    // set the game’s resolution
    zoom(2);

    // Store the animation tiles
    for (var i = 0; i < world.animations.length; i++) {
        animationTiles.push(world.animations[i].tileID);
        tileSequences[world.animations[i].tileID] = world.animations[i].tiles;
    }

    // load in the main spritesheet/tileset
    tileset = new Image();
    tileset.src = 'images/' + world.tilesets[0].source;
    tileset.onload = function() {
        gameLoaded  = true;
        lastTime    = window.performance.now();
    }
}

function zoom(s) {
    canvas.style.cssText = 'width:'+width*s+'px;height:'+height*s+'px;';
    canvas.parentNode.style.cssText = 'width:'+width*s+'px;height:'+height*s+'px;';
}



function drawEntities(elapsed) {
    var entities    = world.entities;
    var spriteCols  = world.tilesets[0].width / TILE_WIDTH;
    var spriteRows  = world.tilesets[0].height / TILE_WIDTH;

    for (var i = 0; i < entities.length; i++) {
        var col = entities[i].tileID % spriteCols;
        var row = Math.floor(entities[i].tileID / spriteCols);

        ctx.drawImage(tileset, col * TILE_WIDTH, row * TILE_WIDTH, entities[i].width, entities[i].height, entities[i].x, entities[i].y, entities[i].width, entities[i].height );
    }
}

function checkCollisions() {

    var collisionArray = world.maps[Map.currentMapID].rooms[Map.currentRoomID].collisions;
    var entityArray    = world.entities;
    // due to his sprite _apparently_ being 17px wide, this causes problems with entrances which are two tiles, or 16px wide.
    // So let’s ignore a whole pixel when calculating tile-based collisions.
    var collisionWidth = link.width - 2;

    // check the edge of the screen
    if( link.x <= (TILE_WIDTH / 2) ) { // left
        Map.loadNextRoom('left');
        link.x = TILE_WIDTH;
    }
    if( link.y <= (TILE_WIDTH / 2) ) { // up
        Map.loadNextRoom('up');
        link.y = TILE_WIDTH;
    }
    if( (link.x + link.width) >= (width - (TILE_WIDTH / 2)) ) { // right
        Map.loadNextRoom('right');
        link.x = (width - link.width - TILE_WIDTH);
    }
    if( (link.y + link.height) >= (height - HUD_HEIGHT - (TILE_WIDTH / 2)) ) { // down
        Map.loadNextRoom('down');
        link.y = (height - link.height - HUD_HEIGHT - TILE_WIDTH);
    }

    // tile collisions
    if( key[2] ) { // up
        var topLeftCol  = Math.floor(link.x / 8);
        var topRightCol = Math.floor((link.x+collisionWidth) / 8);
        var row         = Math.floor((link.y+9) / 8); // same for topleft and topright
        
        var tlCell      = (row * NUM_TILES_WIDE) + topLeftCol;
        var trCell      = (row * NUM_TILES_WIDE) + topRightCol;

        // now get the cells for each corner and check 'em!
        if( collisionArray[tlCell] == 1 || collisionArray[trCell] == 1 ) {
            link.y = (row * 8);
        }
    }
    if( key[3]) { // down
        var bottomLeftCol   = Math.floor(link.x / 8);
        var bottomRightCol  = Math.floor((link.x+link.width-1) / 8);
        var row             = Math.floor((link.y+link.height) / 8);

        var blCell      = (row * NUM_TILES_WIDE) + bottomLeftCol;
        var brCell      = (row * NUM_TILES_WIDE) + bottomRightCol;

        if( collisionArray[blCell] == 1 || collisionArray[brCell] == 1 ) {
            link.y = (row * 8) - link.height;
        }
    }
    if( key[0]) { // left
        var col             = Math.floor(link.x / 8);
        var topLeftRow      = Math.floor((link.y+9) / 8);
        var bottomLeftRow   = Math.floor((link.y+link.height-1) / 8);

        var tlCell      = (topLeftRow * NUM_TILES_WIDE) + col;
        var blCell      = (bottomLeftRow * NUM_TILES_WIDE) + col;

        if( collisionArray[tlCell] == 1 || collisionArray[blCell] == 1 ) {
            link.x = (col * 8) + 8;
        }
    }
    if( key[1]) { //right
        var col             = Math.floor((link.x+link.width) / 8);
        var topRightRow     = Math.floor((link.y+9) / 8);
        var bottomRightRow  = Math.floor((link.y+link.height-1) / 8);

        var trCell      = (topRightRow * NUM_TILES_WIDE) + col;
        var brCell      = (bottomRightRow * NUM_TILES_WIDE) + col;

        if( collisionArray[trCell] == 1 || collisionArray[brCell] == 1 ) {
            link.x = (col * 8) - link.width;
        }
    }

}

function main() {
    /** Here's where we handle all the input, logic and drawing to the screen per frame. **/
    var now     = window.performance.now();
    var elapsed = (now - lastTime);

    if( !gameLoaded ) {
        requestAnimationFrame(main);
    }

    // Clear the screen
    ctx.clearRect(0, 0, 256, 224);
    
    // shift all draw functions down by HUD_HEIGHT amount
    ctx.save();
    ctx.translate(0, HUD_HEIGHT);

    Map.drawBackground(elapsed);
    // drawEntities(elapsed);

    link.moving = false;

    // Handle the Input
    if (key[2]) {
        link.moving = true;
        link.facing = 'up';
        link.y -= link.speed;
    }
    if( key[3]) {
        link.moving = true;
        link.facing = 'down';
        link.y += link.speed;
    }
    if( key[0]) {
        link.moving = true;
        link.facing = 'left';
        link.x -= link.speed;
    }
    if( key[1]) {
        link.moving = true;
        link.facing = 'right';
        link.x += link.speed;
    }

    link.update(elapsed);

    if( !screenAnimating ) {
        checkCollisions();
    }

    link.draw();

    ctx.restore();

    // draw the HUD area last so it sits on top of all else.
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, HUD_HEIGHT);

    lastTime = now;

    // call itself by requesting the next animation frame, and so begin the endless loop
    requestAnimationFrame(main);
}


// Initialise
init();

// Start the loop!
requestAnimationFrame(main);