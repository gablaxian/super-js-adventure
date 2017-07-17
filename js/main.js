
'use strict';

const Game = {

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
        this.tilesets       = [];
        this.spritesheets   = {};
        this.audio          = {};

        //
        this.player         = null;
        this.enemies        = [];

        //
        this.animationTiles = [];
        this.tileSequences  = {};

        this.tweens         = [];

        //
        this.state          = GAME_STATE.START;

        // Initialise!
        this.loadAssets()
        .then( () => this.setupGame() )
        .then( () => {

            this.state      = GAME_STATE.PLAYING
            this.lastTime   = window.performance.now();

            requestAnimationFrame(this.render.bind(this));
        });
    },

    loadAssets() {

        const promises = [];

        // Tilesets
        for( var tileset of world.tilesets ) {
            let obj = {
                "id":           tileset.id,
                "filename":     tileset.name,
                "img":          new Image(),
                "width":        tileset.width,
                "height":       tileset.height,
                "gid":          tileset.gid,
                "TILES_WIDE":   tileset.width / TILE_SIZE
            }
            obj.img.src = 'editor/images/tilesets/'+tileset.name;

            this.tilesets.push(obj);

            let p = new Promise( (resolve, reject) => {
                obj.img.onload = function() {
                    resolve(this);
                }
            });

            promises.push(p);
        }

        // Spritesheets
        for( var spritesheet of ASSETS.images ) {
            let obj = {
                "id":           spritesheet.id,
                "filename":     spritesheet.name,
                "img":          new Image()
            }
            obj.img.src = spritesheet.url;

            this.spritesheets[spritesheet.id] = obj;

            let p = new Promise( (resolve, reject) => {
                obj.img.onload = function() {
                    obj.width   = this.width;
                    obj.height  = this.height;

                    resolve(this);
                }
            });

            promises.push(p);
        }

        // Audio
        for( var audio of ASSETS.audio ) {
            //
        }

        return Promise.all(promises);

    },

    setupGame() {

        // load data
        // Store the animation tiles
        for (var i = 0; i < world.animations.length; i++) {
            this.animationTiles.push(world.animations[i][0]);
            this.tileSequences[world.animations[i][0]] = world.animations[i];
        }

        // Setup the world, entities, etc...

        // Set the starting grid area
        Map.init('overworld', [7,7]);

        // Setup the Input
        Input.init(KEYS);

        //
        HUD.init();

        // player
        this.player = Link.init(100, 100);

        // set the game’s resolution
        this.scale(this.SCALE_VALUE);

        return Promise.resolve();
    },

    scale(scaleValue=1) {
        this.canvas.style.width             = this.width  * scaleValue + 'px';
        this.canvas.style.height            = this.height * scaleValue + 'px';

        this.canvas.parentNode.style.width  = this.width  * scaleValue + 'px';
        this.canvas.parentNode.style.height = this.height * scaleValue + 'px';
    },

    /*****************************************
     * Handlers
     ****************************************/

    handleCollisions() {

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
        if( Input.isPressed('up') ) {
            var row     = Math.floor((this.player.y+9) / TILE_SIZE); // same for topleft and topright
            var tlCell  = Room.pxToCell( this.player.x, this.player.y+9 );
            var trCell  = Room.pxToCell( (this.player.x + collisionWidth), this.player.y+9 );

            // now get the cells for each corner and check 'em!
            if( Room.collisions[tlCell] >= 1 || Room.collisions[trCell] >= 1 ) {
                this.player.y = (row * TILE_SIZE)-1;
            }
        }
        if( Input.isPressed('down') ) {
            var row     = Math.floor((this.player.y+this.player.height) / 8);
            var blCell  = Room.pxToCell( this.player.x, (this.player.y+this.player.height) );
            var brCell  = Room.pxToCell( (this.player.x + collisionWidth), (this.player.y+this.player.height) );

            if( Room.collisions[blCell] >= 1 || Room.collisions[brCell] >= 1 ) {
                this.player.y = (row * 8) - this.player.height;
            }
        }
        if( Input.isPressed('left') ) {
            var col     = Math.floor(this.player.x / 8);
            var tlCell  = Room.pxToCell( this.player.x, this.player.y+9 );
            var blCell  = Room.pxToCell( this.player.x, (this.player.y+this.player.height-1) );

            if( Room.collisions[tlCell] >= 1 || Room.collisions[blCell] >= 1 ) {
                this.player.x = (col * 8) + 8;
            }
        }
        if( Input.isPressed('right') ) {
            var col     = Math.floor((this.player.x+this.player.width) / 8);
            var trCell  = Room.pxToCell( (this.player.x + collisionWidth), this.player.y+9 );
            var brCell  = Room.pxToCell( (this.player.x + collisionWidth), (this.player.y+this.player.height-1) );

            if( Room.collisions[trCell] >= 1 || Room.collisions[brCell] >= 1 ) {
                this.player.x = (col * 8) - this.player.width+1;
            }
        }

        // entity collisions
        for (var i = 0; i < Room.entities.length; i++) {
            let rect = Room.entities[i].getCollisionRect();
            if( (this.player.x + this.player.width) >= rect.x1 &&
                this.player.x < rect.x2 &&
                (this.player.y + this.player.height) >= rect.y1 &&
                this.player.y < rect.y2
            ) {
                // collision!
                // TODO: Entity collision. Will handle in part2 of collisions.
                switch (Room.entities[i].id) {
                    case 'entrance1':
                        Map.init('cave1', [0,0]);
                        this.player.x = parseInt((ROOM_WIDTH / 2) - (this.player.width / 2)) + 1;
                        this.player.y = ROOM_HEIGHT - this.player.height - 10;
                        break;
                    case 'entrance2':
                        Map.init('overworld', [7,7]);
                        this.player.x = 80;
                        this.player.y = 26;
                        break;
                }
            }
        }

    },

    cleanUp() {

    },

    /*****************************************
     * Render loop
     ****************************************/

    render() {

        Stats.begin();

        var now         = window.performance.now();
        this.elapsed    = (now - this.lastTime);


        // Clear the screen
        this.context.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        // shift all draw functions down by HUD_HEIGHT amount
        this.context.save();
        this.context.translate(0, HUD_HEIGHT);

        /*
         * Updates
         */

        // player
        this.player.update(this.elapsed);

        // enemies

        // tweens
        for (var i = 0; i < this.tweens.length; i++) {
            if( this.tweens[i].isAnimating() ) {
                this.tweens[i].update(this.elapsed);
            }
            else {
                this.tweens.splice(i, 1);
                i--;
            }

        }

        // Collisions
        if( this.state !== GAME_STATE.LOADING ) {
            this.handleCollisions();
        }

        /*
         * Draw
         */

        // map
        Map.render(this.elapsed);

        // player
        this.player.draw();

        // enemies

        //
        this.context.restore();

        // draw the HUD area last so it sits on top of all else.
        HUD.render(this.context);

        //
        this.lastTime = now;

        Stats.end();

        // repeat!
        requestAnimationFrame(this.render.bind(this));
    }
}
