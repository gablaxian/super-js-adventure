
'use strict';

/**

    Editor();

    This is the main object which glues all the components together.
    Upon initialisation, we:
    - Load the listed assets.
    - Initialise the database.
    - Load data. If there was local data, then add any new objects from the config. If not, use the config data.
    - Setup the UI.
    - Setup the Viewport, Map and layers.
    - Render the map.
    - Setup events.

 **/

let Editor = {

    init(config={}) {

        // set up a global object for use throughout the app.
        window.Global = {};

        // Set Globals
        Global.TILE_SIZE        = config.tile_size  || 8;
        Global.scale            = config.scale      || 3;

        Global.world            = {};
        Global.tilesetsArray    = []; // array of Sprite objects
        Global.collisionTiles   = []; // array of canvas elements
        Global.entityArray      = []; // array of Entity objects

        // some initialisation stuff
        this.maps               = config.maps       || [{ "name": "default", "width": 32, "height": 22 }];
        this.layers             = config.layers     || [{ "name": "bg" }];
        this.tilesets           = config.tilesets   || [];
        this.animations         = config.animations || [];
        this.saveTimeoutID      = null;

        // Promises all the way down.
        // The functions toward the end do not need to return Promises (they do not have any async operations), but it makes it look quite neat. Also... Promises!
        this.loadAssets()
        .then( () => this.createWorldObjects() )
        .then( () => DB.init() )
        .then( () => this.loadData() )
        .then( () => UI.init(config) )
        .then( () => Viewport.init(config.maps) )
        .then( () => this.setupEvents() );
    },

    /**
     * Loops through the provided list of assets and loads them into memory.
     * Returns a promise.
     */
    loadAssets() {
        const promises = [];

        // loop through the provided tilesetsand create an array of promises
        for (var tileset of this.tilesets) {
            let sprite = Object.create(Sprite);
            Global.tilesetsArray.push(sprite);

            promises.push( sprite.init( tileset.name, tileset.src ) );
        }

        // use the array of promises to create another promise which is fulfilled when all of them are fulfilled.
        return Promise.all(promises);
    },

    createWorldObjects() {

        // Entities
        for(var item of CONFIG.entities) {
            // create the entity
            let entity = Object.create(Entity).init(item.id, item.tileset, item.data);
            entity.render();

            Global.entityArray.push(entity);
        }

        // Collisions
        for (var tile = 1; tile <= 5; tile++) {
            let canvas  = document.createElement('canvas');
            let context = canvas.getContext('2d');

            canvas.width   = Global.TILE_SIZE;
            canvas.height  = Global.TILE_SIZE;

            context.fillStyle   = 'rgba(255, 0, 0, 0.3)';
            context.strokeStyle = 'rgba(255, 0, 0, 0.9)';

            switch (tile) {
                case 1: // full tile collision
                    context.fillRect(0, 0, Global.TILE_SIZE, Global.TILE_SIZE);
                    context.strokeRect(0.5, 0.5, Global.TILE_SIZE-1, Global.TILE_SIZE-1);
                    break;
                case 2: // top left corner
                    context.beginPath();
                    context.moveTo(0, 0);
                    context.lineTo(Global.TILE_SIZE, 0);
                    context.lineTo(0, Global.TILE_SIZE);
                    context.closePath();
                    context.fill();

                    context.beginPath();
                    context.moveTo(Global.TILE_SIZE, 0)
                    context.lineTo(0, Global.TILE_SIZE);
                    context.stroke();
                    break;
                case 3: // top right corner
                    context.beginPath();
                    context.moveTo(0, 0);
                    context.lineTo(Global.TILE_SIZE, Global.TILE_SIZE);
                    context.lineTo(Global.TILE_SIZE, 0);
                    context.closePath();
                    context.fill();

                    context.beginPath();
                    context.moveTo(0, 0);
                    context.lineTo(Global.TILE_SIZE, Global.TILE_SIZE);
                    context.stroke();
                    break;
                case 4: // bottom right corner
                    context.beginPath();
                    context.moveTo(Global.TILE_SIZE, 0); // top right
                    context.lineTo(0, Global.TILE_SIZE); // bottom left
                    context.lineTo(Global.TILE_SIZE, Global.TILE_SIZE); // bottom right
                    context.closePath();
                    context.fill();

                    context.beginPath();
                    context.moveTo(Global.TILE_SIZE, 0)
                    context.lineTo(0, Global.TILE_SIZE);
                    context.stroke();
                    break;
                case 5: // bottom left corner
                    context.beginPath();
                    context.moveTo(0, 0);
                    context.lineTo(0, Global.TILE_SIZE);
                    context.lineTo(Global.TILE_SIZE, Global.TILE_SIZE);
                    context.closePath();
                    context.fill();

                    context.beginPath();
                    context.moveTo(0, 0);
                    context.lineTo(Global.TILE_SIZE, Global.TILE_SIZE);
                    context.stroke();
                    break;
            }

            // scale
            canvas.style['width']  = Global.TILE_SIZE * Global.scale + 'px';
            canvas.style['height'] = Global.TILE_SIZE * Global.scale + 'px';

            Global.collisionTiles.push(canvas);
        }


        return Promise.resolve();
    },

    /**
     * Listen for certain events set certain functions to trigger.
     */
    setupEvents() {
        Eventer.on('addPattern',    () => this.save() );
        Eventer.on('addCollision',  () => this.save() );
        Eventer.on('addEntity',     () => this.save() );
        Eventer.on('deleteTile',    () => this.save() );
        Eventer.on('selectMap',     (idx) => {
            console.log('saving map...', idx);
            localStorage.setItem('selectedMap', idx);
        });
        Eventer.on('export',        () => this.exportData() );

        _('.Modal .Button').addEventListener('click', e => {
            let code = document.querySelector('.Modal-content code');
            let range;
            let selection;

            if( document.body.createTextRange ) {
                range = document.body.createTextRange();
                range.moveToElementText(code);
                range.select();
            } else if( window.getSelection ) {
                selection = window.getSelection();
                range = document.createRange();
                range.selectNodeContents(code);
                selection.removeAllRanges();
                selection.addRange(range);
            }

            try {
                let successful  = document.execCommand('copy');
                let msg         = successful ? 'successful' : 'unsuccessful';
                console.log('Copying text command was ' + msg);
            } catch (err) {
                console.log('Oops, unable to copy');
            }
        });

        return Promise.resolve();
    },

    /**
     * Save all map data.
     */
    save() {
        clearTimeout(this.saveTimeoutID);

        this.saveTimeoutID = setTimeout(function () {
            console.log('saving...');

            let world = {};

            world.version   = CONFIG.version;
            world.tile_size = Global.TILE_SIZE;
            world.maps      = [];

            for (var map of Global.world.maps) {
                world.maps.push({
                    "name":     map.name,
                    "width":    map.TILES_WIDE,
                    "height":   map.TILES_HIGH,
                    "layers":   map.layers.map( layer => {
                        return layer.export();
                    })
                });
            }

            DB.setItem('world', world);
        }, 500);

    },

    /**
     * Load map data
     */
    loadData() {

        return new Promise( (resolve, reject) => {

            DB.getItem('world', (result) => {

                let world   = {};
                world.maps  = [];

                // level data found. Load it.
                if( result !== undefined ) {
                    console.log('world found');

                    for( var cfg of result.maps ) {
                        let map = Object.create(GameMap);
                        map.init(cfg, cfg.layers);

                        world.maps.push(map);
                    }
                }
                else {
                    console.log('no world found');

                    for( var cfg of this.maps ) {
                        let map = Object.create(GameMap);
                        map.init(cfg, CONFIG.layers);

                        world.maps.push(map);
                    }

                }

                // store the map data globally.
                Global.world = world;

                resolve();
            });
        });

    },

    /**
     * Super destructive. Clears the whole database.
     */
    deleteData() {
        DB.clear();
    },


    /**
     * Each tileset is given a GID (Not actually sure what the G is for, I picked up the idea from Tiled editor) but what it does is give
     * a tileset an ID so we can figure out which atlas a particular tile belongs to.
     *
     * Example:
     * A cell is saved with an ID of 187. By iterating backwards through the atlases, we can compare the ID against the GIDs and determine which range it sits in:
     * GID 1: 0
     * GID 2: 127
     * GID 3: 206
     * - 187 is less than 206 but larger than 127, so it is from the second atlas.
     *
     * Generally speaking, each GID is either the number of the previous atlas (plus 1) or the next chosen interval up (multiples of 128 or something)
     */
    calculateAtlasGIDs() {
        let gids            = {};
        let previousCount   = 0;

        for (var tileset of Global.tilesetsArray) {
            gids[tileset.name]  = previousCount;
            previousCount       += tileset.TILES_WIDE * tileset.TILES_HIGH;
        }

        return gids;
    },

    /**
     * Export the database to a JSON string.
     * Here we optimise the output to be smaller and more efficient.
     */
    exportData() {

        // convert the internal data to a game's level structure.
        let world   = {};

        // add tile size
        world.tile_size = Global.TILE_SIZE;

        // calculate sprite GIDs
        let atlasGIDs = this.calculateAtlasGIDs();

        // add tilesets
        world.tilesets = [];

        for (var tileset of Global.tilesetsArray) {
            let gid = atlasGIDs[ tileset.name ] || 0;

            world.tilesets.push({
                id:     tileset.name,
                name:   tileset.filename,
                width:  tileset.width,
                height: tileset.height,
                gid:    gid
            });
        }

        // add maps
        world.maps = {};

        // loop over the maps
        for (var map of Global.world.maps) {
            world.maps[map.name]                = {};
            world.maps[map.name]['layers']      = [];
            world.maps[map.name]['tiles_wide']  = map.TILES_WIDE;
            world.maps[map.name]['tiles_high']  = map.TILES_HIGH;

            // loop over the layers
            for (var layer of map.layers) {

                // now we need to go one step further and calculate the GIDs for each tile.
                // (for typical layers)
                let newIndexes = [];

                if( layer.name == 'collision' ) {
                    newIndexes = layer.data; // no change
                }
                else if( layer.name == 'entities' ) {
                    newIndexes = layer.data; // no change
                }
                else {
                    for (var i = 0; i < layer.data.length; i++) {
                        let gid = atlasGIDs[ layer.tilesetNames[i] ] || 0;
                        newIndexes.push( layer.data[i] === null ? null : parseInt( layer.data[i] + gid ) );
                    }
                }

                world.maps[map.name]['layers'].push({
                    name: layer.name,
                    data: newIndexes
                });


            }
        }

        // add animations
        world.animations = [];

        for(let obj of this.animations) {
            let gid     = atlasGIDs[ obj.tileset ] || 0;
            let newArr  = [];

            for(let i = 0; i < obj.tiles.length; i++) {
                newArr.push(obj.tiles[i] + gid);
            }

            world.animations.push(newArr);
        }

        // I now know that JSON.stringify does have a way to prettify code (third param), but in this case it’s too eager.
        // It also splits the arrays by their commas which makes for large numbers of lines; precisely what I’m trying to avoid.
        let worldStr = prettify( JSON.stringify(world) );

        UI.Modal.show(worldStr);
    }

}
