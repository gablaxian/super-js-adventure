
'use strict';

const Game = {

    SCALE_VALUE: 3,

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
        this.grid           = null;

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
                "bitmap":       null,
                "width":        tileset.width,
                "height":       tileset.height,
                "gid":          tileset.gid,
                "TILES_WIDE":   tileset.width / TILE_SIZE
            }
            obj.img.src = 'images/tilesets/'+tileset.name;

            this.tilesets.push(obj);

            let p = new Promise( (resolve, reject) => {
                obj.img.onload = function() {
                    createImageBitmap(this).then(sprite => { obj.bitmap = sprite; resolve(this); } );
                }
            });

            promises.push(p);
        }

        // Spritesheets
        for( var spritesheet of ASSETS.images ) {
            let obj = {
                "id":           spritesheet.id,
                "filename":     spritesheet.name,
                "img":          new Image(),
                "bitmap":       null
            }
            obj.img.src = spritesheet.url;

            this.spritesheets[spritesheet.id] = obj;

            let p = new Promise( (resolve, reject) => {
                obj.img.onload = function() {
                    obj.width   = this.width;
                    obj.height  = this.height;

                    createImageBitmap(this).then(sprite => { obj.bitmap = sprite; resolve(this); } );
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

        if( DEBUG ) {
            window.Global = {};
            Global.scale = this.SCALE_VALUE;
            this.grid = Object.create(Grid);
            this.grid.init(0, 0, 8, 8);
            this.grid.resize(ROOM_WIDTH, ROOM_HEIGHT);
            this.grid.scale(1);
            this.grid.render();
        }

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
        // this.canvas.style.width             = this.width  * scaleValue + 'px';
        // this.canvas.style.height            = this.height * scaleValue + 'px';
        this.canvas.style.transformOrigin   = '0 0'; //scale from top left
        this.canvas.style.transform         = 'scale('+ scaleValue +')';

        this.canvas.parentNode.style.width  = this.width  * scaleValue + 'px';
        this.canvas.parentNode.style.height = this.height * scaleValue + 'px';
    },

    /*****************************************
     * Handlers
     ****************************************/

    handleCollisions() {        

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

        var tlCell  = Room.pxToCell( this.player.getCollisionRect().x1, this.player.getCollisionRect().y1 );
        var trCell  = Room.pxToCell( this.player.getCollisionRect().x2, this.player.getCollisionRect().y1 );
        var blCell  = Room.pxToCell( this.player.getCollisionRect().x1, this.player.getCollisionRect().y2 );
        var brCell  = Room.pxToCell( this.player.getCollisionRect().x2, this.player.getCollisionRect().y2 );        

        /*
            Collisions:
            top left corner     - 2
            top right corner    - 3
            bottom right corner - 4
            bottom left corner  - 5
        */

        // tile collisions
        if (Input.isPressed('up') && Input.isPressed('right')) {
            // If both top cells collide, then we know to push the player down and not check for a corner collision.
            if (Room.collisions[tlCell] >= 1 && Room.collisions[trCell] >= 1) {
                var topY = Math.floor(this.player.getCollisionRect().y1 / TILE_SIZE) * TILE_SIZE;
                var distanceIntoTile = Math.abs(this.player.getCollisionRect().y1 - (topY + TILE_SIZE));
                this.player.y += distanceIntoTile;
            }
            // If both side cells collide, then we know to push the player to the side.
            if (Room.collisions[trCell] >= 1 && Room.collisions[brCell] >= 1) {
                var rightX = Math.floor(this.player.getCollisionRect().x2 / TILE_SIZE) * TILE_SIZE;
                var distanceIntoTile = Math.abs(this.player.getCollisionRect().x2 - rightX);
                this.player.x -= (distanceIntoTile + 1);
            }
            if (Room.collisions[trCell] === 3 || Room.collisions[trCell] === 3) {
                // keep player still
                this.player.x -= this.player.diagonalSpeed;
                this.player.y += this.player.diagonalSpeed;
            }
        }

        else if (Input.isPressed('down') && Input.isPressed('right')) {
            if (Room.collisions[blCell] >= 1 && Room.collisions[brCell] >= 1) {
                var bottomY = Math.floor(this.player.getCollisionRect().y2 / TILE_SIZE) * TILE_SIZE;
                var distanceIntoTile = Math.abs(this.player.getCollisionRect().y2 - bottomY);
                this.player.y -= (distanceIntoTile + 1);
            }
            if (Room.collisions[trCell] >= 1 && Room.collisions[brCell] >= 1) {
                var rightX = Math.floor(this.player.getCollisionRect().x2 / TILE_SIZE) * TILE_SIZE;
                var distanceIntoTile = Math.abs(this.player.getCollisionRect().x2 - rightX);
                this.player.x -= (distanceIntoTile + 1);
            }
            if (Room.collisions[brCell] === 4 || Room.collisions[brCell] === 4) {
                // keep player still
                this.player.x -= this.player.diagonalSpeed;
                this.player.y -= this.player.diagonalSpeed;
            }
        }

        else if (Input.isPressed('down') && Input.isPressed('left')) {
            if (Room.collisions[blCell] >= 1 && Room.collisions[brCell] >= 1) {
                var bottomY = Math.floor(this.player.getCollisionRect().y2 / TILE_SIZE) * TILE_SIZE;
                var distanceIntoTile = Math.abs(this.player.getCollisionRect().y2 - bottomY);
                this.player.y -= (distanceIntoTile + 1);
            }
            if (Room.collisions[tlCell] >= 1 && Room.collisions[blCell] >= 1) {
                var leftX = Math.floor(this.player.getCollisionRect().x1 / TILE_SIZE) * TILE_SIZE;
                var distanceIntoTile = Math.abs(this.player.getCollisionRect().x1 - (leftX + TILE_SIZE));
                this.player.x += distanceIntoTile;
            }
            if (Room.collisions[blCell] === 5 || Room.collisions[blCell] === 5) {
                // keep player still
                this.player.x += this.player.diagonalSpeed;
                this.player.y -= this.player.diagonalSpeed;
            }
        }

        else if (Input.isPressed('up') && Input.isPressed('left')) {
            // If both top cells collide, then we know to push the player down and not check for a corner collision.
            if (Room.collisions[tlCell] >= 1 && Room.collisions[trCell] >= 1) {
                var topY = Math.floor(this.player.getCollisionRect().y1 / TILE_SIZE) * TILE_SIZE;
                var distanceIntoTile = Math.abs(this.player.getCollisionRect().y1 - (topY + TILE_SIZE));
                this.player.y += distanceIntoTile;
            }
            if (Room.collisions[tlCell] >= 1 && Room.collisions[blCell] >= 1) {
                var leftX = Math.floor(this.player.getCollisionRect().x1 / TILE_SIZE) * TILE_SIZE;
                var distanceIntoTile = Math.abs(this.player.getCollisionRect().x1 - (leftX + TILE_SIZE));
                this.player.x += distanceIntoTile;
            }

            if (Room.collisions[tlCell] === 2 || Room.collisions[tlCell] === 2) {
                // keep player still
                this.player.x += this.player.diagonalSpeed;
                this.player.y += this.player.diagonalSpeed;
            }
        }

        else if (Input.isPressed('up')) {
            if( Room.collisions[tlCell] === 1 || Room.collisions[trCell] === 1 ) {
                // check how far into the row we moved and displace the player back that distance.
                var topY                = Math.floor(this.player.getCollisionRect().y1 / TILE_SIZE) * TILE_SIZE;
                var distanceIntoTile    = Math.abs(this.player.getCollisionRect().y1 - (topY + TILE_SIZE));
                this.player.y += distanceIntoTile;
            }
            else if( Room.collisions[tlCell] === 2 ) { // top left corner collision - 
                // move player UPRIGHT
                this.player.y += this.player.speed;
                this.player.y -= this.player.diagonalSpeed;
                this.player.x += this.player.diagonalSpeed;
            }
            // top left to bottom right collision - \
            else if (Room.collisions[trCell] === 3 || Room.collisions[trCell-1] === 3 ) {
                // move player UPLEFT
                this.player.y += this.player.speed;
                this.player.y -= 0.9;
                this.player.x -= 0.9;
            }
        }

        else if (Input.isPressed('right')) {
            // Normal tile collision
            if( Room.collisions[trCell] === 1 || Room.collisions[brCell] === 1 ) {
                var rightX              = Math.floor(this.player.getCollisionRect().x2 / TILE_SIZE) * TILE_SIZE;
                var distanceIntoTile    = Math.abs(this.player.getCollisionRect().x2 - rightX);
                this.player.x -= (distanceIntoTile + 1);
            }
            // top right corner collision - \
            else if( Room.collisions[trCell] === 3 ) {
                // move player DOWNRIGHT
                this.player.x -= this.player.speed;
                this.player.x += this.player.diagonalSpeed;
                this.player.y += this.player.diagonalSpeed;
            }
            // bottom right corner collision - /
            else if (Room.collisions[brCell] === 4 || Room.collisions[brCell] === 4 ) {
                // move player UPRIGHT
                this.player.x -= this.player.speed;
                this.player.x += this.player.diagonalSpeed;
                this.player.y -= this.player.diagonalSpeed;
            }
        }

        else if (Input.isPressed('down')) {
            if( Room.collisions[blCell] == 1 || Room.collisions[brCell] == 1 ) {
                var bottomY             = Math.floor(this.player.getCollisionRect().y2 / TILE_SIZE) * TILE_SIZE;
                var distanceIntoTile    = Math.abs(this.player.getCollisionRect().y2 - bottomY);
                this.player.y -= (distanceIntoTile + 1);
            }
            else if( Room.collisions[brCell] === 4 ) { // bottom right corner collision
                // move player DOWNLEFT
                this.player.y -= this.player.speed;
                this.player.x -= this.player.diagonalSpeed;
                this.player.y += this.player.diagonalSpeed;
            }
            else if( Room.collisions[blCell] === 5 ) { // bottom left corner collision
                // move player DOWNRIGHT
                this.player.y -= this.player.speed;
                this.player.x += this.player.diagonalSpeed;
                this.player.y += this.player.diagonalSpeed;
            }
        }

        else if (Input.isPressed('left')) {
            if( Room.collisions[tlCell] === 1 || Room.collisions[blCell] === 1 ) {
                var leftX               = Math.floor(this.player.getCollisionRect().x1 / TILE_SIZE) * TILE_SIZE;
                var distanceIntoTile    = Math.abs(this.player.getCollisionRect().x1 - (leftX + TILE_SIZE));
                this.player.x += distanceIntoTile;
            }
            // top left corner collision
            else if( Room.collisions[tlCell] === 2 ) {
                // move player DOWNLEFT
                this.player.x += this.player.speed;
                this.player.x -= this.player.diagonalSpeed;
                this.player.y += this.player.diagonalSpeed;
            }
            // bottom left corner collision
            else if( Room.collisions[blCell] === 5 ) {
                // move player UPLEFT
                this.player.x += this.player.speed;
                this.player.x -= this.player.diagonalSpeed;
                this.player.y -= this.player.diagonalSpeed;
            }
        }

        // entity collisions
        for (var i = 0; i < Room.entities.length; i++) {
            let entity      = Room.entities[i];
            let entityRect  = entity.getCollisionRect();
            let playerRect  = this.player.getCollisionRect();

            if( playerRect.x2 > entityRect.x1 &&
                playerRect.x1 < entityRect.x2 &&
                playerRect.y2 > entityRect.y1 &&
                playerRect.y1 < entityRect.y2
            ) {
                // collision!
                switch ( entity.type ) {
                    case 'tree':
                    case 'bush1':
                        // invert the collision checks to find which side the collision took place.
                        // i.e. if Px2 > Ex1 && Px1 < Ex2 then left. Or if Px1 < Ex2 && Px2 >Ex2 then right.
                        if( playerRect.x2 > entityRect.x1 && playerRect.x1 < entityRect.x1 ) { // left side
                            this.player.x = entityRect.x1 - this.player.width;
                        }
                        else if( playerRect.x1 < entityRect.x2 && playerRect.x2 > entityRect.x2 ) { // right side
                            this.player.x = entityRect.x2;
                        }
                        else if( playerRect.y2 > entityRect.y1 && playerRect.y1 < entityRect.y1 ) { // top side
                            this.player.y = entityRect.y1 - this.player.height;
                        }
                        else if( playerRect.y1 < entityRect.y2 && playerRect.y2 > entityRect.y2 ) { // bottom side
                            this.player.y = entityRect.y2 - 8;
                        }
                        // let pCentrePoint = this.player.getCenter

                        break;
                }

                switch (entity.id) {
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
        // for(var enemy of this.enemies) {
        //     enemy.render(this.context);
        // }

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

        if( DEBUG ) {
            // grids
            let gW = this.grid.canvas.width;
            let gH = this.grid.canvas.height;
            this.context.drawImage(this.grid.canvas, 0, 0, gW, gH);

            // show tiles player corners exist in
            this.context.strokeStyle = 'rgba(255, 255, 0, 1)';
            const rect = this.player.getCollisionRect();
            const tl = {
                x: rect.x1 - rect.x1 % TILE_SIZE,
                y: rect.y1 - rect.y1 % TILE_SIZE,
            };
            const tr = {
                x: rect.x2 - rect.x2 % TILE_SIZE,
                y: rect.y1 - rect.y1 % TILE_SIZE,
            };
            const bl = {
                x: rect.x1 - rect.x1 % TILE_SIZE,
                y: rect.y2 - rect.y2 % TILE_SIZE,
            };
            const br = {
                x: rect.x2 - rect.x2 % TILE_SIZE,
                y: rect.y2 - rect.y2 % TILE_SIZE,
            };
            
            this.context.strokeRect(tl.x + 0.5, tl.y + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
            this.context.strokeRect(tr.x + 0.5, tr.y + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
            this.context.strokeRect(bl.x + 0.5, bl.y + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
            this.context.strokeRect(br.x + 0.5, br.y + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
        }

        // player
        this.player.draw(this.context);

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
