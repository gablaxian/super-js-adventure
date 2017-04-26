
'use strict';

// a few globals for now.
const SCREEN_WIDTH      = 256;
const SCREEN_HEIGHT     = 224;

const ROOM_WIDTH        = 256;
const ROOM_HEIGHT       = 176;

const TILE_SIZE         = 8;

const NUM_TILES_WIDE    = ROOM_WIDTH / TILE_SIZE;
const NUM_TILES_HIGH    = ROOM_HEIGHT / TILE_SIZE; // we want the HUD space at the top
const HUD_HEIGHT        = 6 * TILE_SIZE;

const DEBUG = 0;

//
let Game = {

    SCALE_VALUE: 2,

    init() {

        //
        this.canvas         = document.querySelector('canvas');
        this.context        = this.canvas.getContext('2d');

        //
        this.width          = 256;
        this.height         = 224;

        //
        this.lastTime       = 0;
        this.elapsed        = 0;

        //
        this.screenAnimating = false;

        //
        this.spritesheets   = [];
        this.audio          = {};
        this.fonts          = [];

        //
        this.player         = null;
        this.entities       = [];

        //
        this.animationTiles = [];
        this.tileSequences  = {};

        //
        this.state          = 'start';

        // Initialise!
        this.loadAssets()
        .then( () => this.setupGame() )
        .then( () => {
            console.log('Game started');
            this.lastTime = window.performance.now();
            requestAnimationFrame(this.render.bind(this));
        });
    },

    loadAssets() {

        const promises = [];

        // Images
        for (let tileset of world.tilesets) {
            let id = tileset.id;
            let obj = {
                "filename": tileset.name,
                "img": new Image(),
                "width": tileset.width,
                "height": tileset.height,
                "gid": tileset.gid,
                "TILES_WIDE": tileset.width / TILE_SIZE
            }
            obj.img.src = 'editor/images/tilesets/'+tileset.name;

            this.spritesheets.push(obj);

            let p = new Promise( (resolve, reject) => {
                obj.img.onload = function() {
                    resolve(this);
                }
            });

            promises.push(p);
        }

        return Promise.all(promises);

    },

    setupGame() {

        this.player = new Link(100, 100);

        // Set the starting grid area
        Map.init('overworld', [7,7]);

        // Setup the Input
        Input.init();

        // set the game’s resolution
        this.scale(this.SCALE_VALUE);

        // Store the animation tiles
        for (var i = 0; i < world.animations.length; i++) {
            this.animationTiles.push(world.animations[i][0]);
            this.tileSequences[world.animations[i][0]] = world.animations[i];
        }

        return Promise.resolve();
    },

    scale(scaleValue=1) {
        this.canvas.style.width     = this.width  * scaleValue + 'px';
        this.canvas.style.height    = this.height * scaleValue + 'px';

        this.canvas.parentNode.style.width  = this.width * scaleValue + 'px';
        this.canvas.parentNode.style.height = this.height * scaleValue + 'px';
    },

    /*****************************************
     * Handlers
     ****************************************/

    handleInput() {
        if( Key.LEFT ) {
            this.player.moveLeft();
        }
        if( Key.RIGHT ) {
            this.player.moveRight();
        }
        if( Key.UP ) {
            this.player.moveUp();
        }
        if( Key.DOWN ) {
            this.player.moveDown();
        }
        if( Key.X ) {
            this.player.attack();
        }
    },

    handleCollisions() {

        var collisionArray = Map.collisions;

        // due to his sprite _apparently_ being 17px wide, this causes problems with entrances which are two tiles, or 16px wide.
        // So let’s ignore a whole pixel when calculating tile-based collisions.
        var collisionWidth = this.player.width - 2;

        // check the edge of the screen
        if( this.player.x <= (TILE_SIZE / 2) ) { // left
            Map.loadNextRoom('left');
            this.player.x = TILE_SIZE;
        }
        if( this.player.y <= (TILE_SIZE / 2) ) { // up
            Map.loadNextRoom('up');
            this.player.y = TILE_SIZE;
        }
        if( (this.player.x + this.player.width) >= (this.width - (TILE_SIZE / 2)) ) { // right
            Map.loadNextRoom('right');
            this.player.x = (this.width - this.player.width - TILE_SIZE);
        }
        if( (this.player.y + this.player.height) >= (this.height - HUD_HEIGHT - (TILE_SIZE / 2)) ) { // down
            Map.loadNextRoom('down');
            this.player.y = (this.height - this.player.height - HUD_HEIGHT - TILE_SIZE);
        }

        // tile collisions
        if( Key.UP ) { // up
            var row         = Math.floor((this.player.y+9) / TILE_SIZE); // same for topleft and topright
            var tlCell      = Map.pxToCell( this.player.x, this.player.y+9 );
            var trCell      = Map.pxToCell( (this.player.x + collisionWidth), this.player.y+9 );

            // now get the cells for each corner and check 'em!
            if( collisionArray[tlCell] === 0 || collisionArray[trCell] === 0 ) {
                this.player.y = (row * TILE_SIZE);
            }
        }
        if( Key.DOWN ) { // down
            var row         = Math.floor((this.player.y+this.player.height) / 8);
            var blCell      = Map.pxToCell( this.player.x, (this.player.y+this.player.height) );
            var brCell      = Map.pxToCell( (this.player.x + collisionWidth), (this.player.y+this.player.height) );

            if( collisionArray[blCell] === 0 || collisionArray[brCell] === 0 ) {
                this.player.y = (row * 8) - this.player.height;
            }
        }
        if( Key.LEFT ) { // left
            var col             = Math.floor(this.player.x / 8);
            var tlCell      = Map.pxToCell( this.player.x, this.player.y+9 );
            var blCell      = Map.pxToCell( this.player.x, (this.player.y+this.player.height) );

            if( collisionArray[tlCell] === 0 || collisionArray[blCell] === 0 ) {
                this.player.x = (col * 8) + 8;
            }
        }
        if( Key.RIGHT ) { //right
            var col             = Math.floor((this.player.x+this.player.width) / 8);
            var trCell      = Map.pxToCell( (this.player.x + collisionWidth), this.player.y+9 );
            var brCell      = Map.pxToCell( (this.player.x + collisionWidth), (this.player.y+this.player.height) );

            if( collisionArray[trCell] === 0 || collisionArray[brCell] === 0 ) {
                this.player.x = (col * 8) - this.player.width;
            }
        }

    },

    cleanUp() {

    },

    /*****************************************
     * Render loop
     ****************************************/

    render() {

        var now = window.performance.now();
        this.elapsed = (now - this.lastTime);

        // Clear the screen
        this.context.clearRect(0, 0, 256, 224);

        // shift all draw functions down by HUD_HEIGHT amount
        this.context.save();
        this.context.translate(0, HUD_HEIGHT);

        // Draw map
        Map.drawBackground(this.elapsed);

        this.player.moving = false;

        //
        this.handleInput();

        this.player.update(this.elapsed);

        if( !this.screenAnimating ) {
            this.handleCollisions();
        }

        this.player.draw();

        //
        this.context.restore();

        // draw the HUD area last so it sits on top of all else.
        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, this.width, HUD_HEIGHT);

        //
        this.lastTime = now;

        // repeat!
        requestAnimationFrame(this.render.bind(this));
    }
}
