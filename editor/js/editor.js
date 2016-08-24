
'use strict';

/**

    Editor();

    This is the main object which glues all the components together.
    Upon initialisation, we:
    - Load the listed assets.
    - Create bitmaps from the assets (not really required, but it's nice to test out new JS things)
    - Calculate Atlas GIDs. Atlus is just another name for tileset.
    - Initialise the database.
    - Load data. If there was local data, then add any new objects from the config. If not, use the config data.
    - Setup the UI.
    - Setup the Viewport, Map and layers.
    - Render the map.
    - Setup events.

 **/

let Editor = {

    init(config) {

        // set up a global object for use throughout the app.
        window.Global = {};

        // Set Globals
        Global.TILE_SIZE        = config.tile_size  || 8;
        Global.scale            = config.scale      || 3;

        Global.world            = {};
        Global.tilesetsArray    = [];
        Global.bitmapArray      = [];

        // some initialisation stuff
        this.maps               = config.maps;
        this.layers             = config.layers;
        this.tilesets           = config.tilesets;
        this.saveTimeoutID      = null;

        // add the two required layers.
        this.layers.push({ "name": "entities" });
        this.layers.push({ "name": "collision" });

        // Promises all the way down.
        // The functions toward the end do not need to return Promises (they do not have any async operations), but it makes it look quite neat. Also... Promises!
        this.loadAssets()
        .then( () => this.createBitmaps() )
        .then( () => this.calculateAtlusGIDs() )
        .then( () => DB.init() )
        .then( () => this.loadData() )
        .then( () => this.mergeData() )
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

            promises.push( sprite.init( tileset ) );
        }

        // use the array of promises to create another promise which is fulfilled when all of them are fulfilled.
        return Promise.all(promises);
    },

    /**
     * Creates bitmaps from the image assets and stores them in memory.
     * Returns a promise.
     */
    createBitmaps() {
        const promises = [];

        for (var sprite of Global.tilesetsArray) {
            promises.push( createImageBitmap(sprite.img) );
        }

        // returned variable is an array of bitmaps (oddly)
        return Promise.all(promises).then( bitmaps => Global.bitmapArray = bitmaps );
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
     * - 187 is less than 206 but larger than 127, so it is from the second atlus.
     *
     * Generally speaking, each GID is either the number of the previous atlus (plus 1) or the next chosen interval up (multiples of 128 or something)
     */
    calculateAtlusGIDs() {
        let previousCount = 0;

        for (var tileset of Global.tilesetsArray) {
            tileset.GID = previousCount;

            previousCount += tileset.TILES_WIDE * tileset.TILES_HIGH;
        }

        return Promise.resolve();
    },

    /**
     * Listen for certain events set certain functions to trigger.
     */
    setupEvents() {
        Eventer.on('addTile',       () => this.save() );
        Eventer.on('addPattern',    () => this.save() );
        Eventer.on('addCollision',  () => this.save() );
        Eventer.on('addEntity',     () => this.save() );
        Eventer.on('selectMap',     (idx) => {
            console.log('saving map...', idx);
            localStorage.setItem('selectedMap', idx);
        });
        Eventer.on('export',        () => this.exportData() );

        return Promise.resolve();
    },

    /**
     * Save all map data.
     */
    save() {
        clearTimeout(this.saveTimeoutID);

        this.saveTimeoutID = setTimeout(function () {
            console.log('saving...');

            let world   = {};

            world.version   = config.version;
            world.tile_size = Global.TILE_SIZE;
            world.maps      = [];

            for (var map of Global.world.maps) {
                world.maps.push({
                    "name": map.name,
                    "width": map.TILES_WIDE,
                    "height": map.TILES_HIGH,
                    "layers": map.layers.map(layer => { return { "name": layer.name, "data": layer.data }; })
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
                        map.init(cfg, config.layers);

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
     * TODO: Check the config data against the database for differences and merge/overwrite where necessary.
     */
    mergeData() {

        // external config object takes precedence over stored.
        // loop through the loaded data, then apply the config data.

        return Promise.resolve();
    },

    /**
     * Export the database to a JSON string.
     */
    exportData() {

        // convert the internal data to a game's level structure.
        let world   = {};

        world.tile_size = Global.TILE_SIZE;
        world.maps      = {};

        for (var map of Global.world.maps) {
            // let map = mapArray[mapNum];
            world.maps[map.name]            = {};
            world.maps[map.name]['layers']  = [];

            for (var layer of map.layers) {
                world.maps[map.name]['layers'].push({ name: layer.name, data: layer.data });
            }
        }

        // I now know that JSON.stringify does have a way to prettify code (third param), but in this case it's too eager.
        // It also splits the arrays by their commas which makes for large numbers of lines; precisely what I'm trying to avoid.
        let worldStr = prettify( JSON.stringify(world) );

        UI.Modal.show(worldStr);
    }

}
