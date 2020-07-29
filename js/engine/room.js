
'use strict';

const Room = {

    init(coords=[0,0]) {
        this.coords     = coords;
        this.width      = ROOM_WIDTH;
        this.height     = ROOM_HEIGHT;

        this.TILES_WIDE = NUM_TILES_WIDE;
        this.TILES_HIGH = NUM_TILES_HIGH;

        this.collisions = new Uint8Array(NUM_TILES_WIDE * NUM_TILES_HIGH);
        this.layers     = [];
        this.animLayers = [];   // 3 layers which store the animated tile frames.
        this.enemies    = [];
        this.entities   = [];


        this.timeSinceLastTileFrameSwap  = 0;
        this.tileSequenceIdx             = 0;

        this.setupLocalData();
        this.createLayers();

        return this;
    },

    /***********************
        Helpers
    */

    pxToCell(x, y) {
        let row = Math.floor( (y / this.height) * this.TILES_HIGH );
        let col = Math.floor( (x / this.width) * this.TILES_WIDE );

        return (row * this.TILES_WIDE) + col;
    },

    getLayer(layerName) {
        for( var layer of world.maps[Map.currentMapID].layers ) {
            if( layer.name == layerName ) {
                return layer;
            }
        }

        return false;
    },

    /***********************

    */

    setupLocalData() {

        let collisionsLayer = this.getLayer('collision');
        let entitiesLayer   = this.getLayer('entities');

        let data = collisionsLayer.data;

        // collisions
        let tile    = 0;
        let cell    = 0;
        let n       = 0;

        for (var row = 0; row < NUM_TILES_HIGH; row++) {
            for (var col = 0; col < NUM_TILES_WIDE; col++) {

                let colOffset   = this.coords[0] * NUM_TILES_WIDE;
                let rowOffset   = this.coords[1] * NUM_TILES_HIGH;

                cell    = ((row + rowOffset) * Map.TILES_WIDE) + (col + colOffset);
                tile    = data[cell];

                // convert the data array which contain nulls/empty for no collision or a 0 indexed
                // number for collision to a pure number based array so we can use a fast UInt array.
                // 0 = no collision
                // 1+ = collision type
                this.collisions[n++] = (tile == undefined || tile == null) ? 0 : tile + 1;
            }
        }

        // entities
        let roomX = this.coords[0] * ROOM_WIDTH;
        let roomY = this.coords[1] * ROOM_HEIGHT;

        for (var i = 0; i < entitiesLayer.data.length; i++) {
            if( entitiesLayer.data[i].x >= roomX &&
                entitiesLayer.data[i].x < (roomX + ROOM_WIDTH) &&
                entitiesLayer.data[i].y >= roomY &&
                entitiesLayer.data[i].y < (roomY + ROOM_HEIGHT)
            ) {
                this.entities.push( Object.create(Entity).init(
                        entitiesLayer.data[i].id.toLowerCase(),
                        entitiesLayer.data[i].x - roomX,
                        entitiesLayer.data[i].y - roomY
                    )
                );
            }
        }

        // bespoke entities
        for(var obj of ENTITIES) {
            if(
                this.coords[0] == obj.roomID[0] &&
                this.coords[1] == obj.roomID[1]
            ) {
                let entity = Object.create(Entity).init(
                    obj.type,
                    obj.x,
                    obj.y
                );

                entity.id           = obj.id;
                entity.isVisible    = obj.visible ? true : false;

                this.entities.push(entity);
            }
        }
    },

    spawnEnemies() {
        // coming soon...
    },

    createLayers() {

        // create the 3 animation layers ahead of time.
        for (var i = 0; i < 3; i++) {
            let layerObj = Object.create(Layer).init();
            this.animLayers.push(layerObj);
        }

        for( var layer of world.maps[Map.currentMapID].layers ) {
            if( layer.name == 'collision' || layer.name == 'entities' ) {
                continue;
            }

            this.createLayer(layer.data);
        }

        if (DEBUG) {
            this.createCollisionLayer();
        }
    },

    createLayer(data) {

        let tile            = 0;
        let cell            = 0;
        let tileset         = null;
        let tilesetCoords   = {};

        //
        let layerObj = Object.create(Layer).init();
        this.layers.push(layerObj);

        //
        for (var row = 0; row < NUM_TILES_HIGH; row++) {
            for (var col = 0; col < NUM_TILES_WIDE; col++) {

                let colOffset   = this.coords[0] * NUM_TILES_WIDE;
                let rowOffset   = this.coords[1] * NUM_TILES_HIGH;

                cell    = ((row + rowOffset) * Map.TILES_WIDE) + (col + colOffset);
                tile    = data[cell];

                if( tile !== null && tile !== undefined ) {

                    // get the cell's tileset.
                    var l = Game.tilesets.length;
                    while(l--) {
                        if( tile >= Game.tilesets[l].gid ) {
                            tileset = Game.tilesets[l];
                            break;
                        }
                    }

                    tilesetCoords = Map.cellToPx.call(tileset, (tile - tileset.gid));

                    // draw to layer's canvas.
                    layerObj.context.drawImage(tileset.bitmap, tilesetCoords.x, tilesetCoords.y, TILE_SIZE, TILE_SIZE, (col * 8), (row * 8), TILE_SIZE, TILE_SIZE);

                    // now check if that tile was an animated tile.
                    // if so, loop through the tilesequence and add each frame to the consecutive animLayers.
                    if( Game.animationTiles.indexOf(tile) != -1 ) {
                        for (var i = 0; i < 3; i++) { // there are always always 3.
                            tilesetCoords = Map.cellToPx.call(tileset, (Game.tileSequences[tile][i] - tileset.gid));
                            this.animLayers[i].context.drawImage(tileset.bitmap, tilesetCoords.x, tilesetCoords.y, TILE_SIZE, TILE_SIZE, (col * 8), (row * 8), TILE_SIZE, TILE_SIZE);
                        }
                    }

                }

            }
        }

    },

    createCollisionLayer() {
        let cell = 0;
        let tile = 0;

        //
        this.collisionLayer = Object.create(Layer).init();
        let context = this.collisionLayer.context;

        context.fillStyle   = 'rgba(255, 0, 0, 0.3)';
        context.strokeStyle = 'rgba(255, 0, 0, 0.9)';

        for (var row = 0; row < this.TILES_HIGH; row++) {
            for (var col = 0; col < this.TILES_WIDE; col++) {

                cell = (row * this.TILES_WIDE) + col;
                tile = this.collisions[cell];

                switch (tile) {
                    case 1: // full tile collision
                        context.fillRect((col * 8), (row * 8), TILE_SIZE, TILE_SIZE);
                        context.strokeRect((col * 8)+0.5, (row * 8)+0.5, TILE_SIZE - 1, TILE_SIZE - 1);
                        break;
                    case 2: // top left corner
                        context.beginPath();
                        context.moveTo((col * 8), (row * 8));
                        context.lineTo((col * 8) + TILE_SIZE, (row * 8));
                        context.lineTo((col * 8), (row * 8) + TILE_SIZE);
                        context.closePath();
                        context.fill();
                        context.stroke();
                        break;
                    case 3: // top right corner
                        context.beginPath();
                        context.moveTo((col * 8), (row * 8));
                        context.lineTo((col * 8) + TILE_SIZE, (row * 8) + TILE_SIZE);
                        context.lineTo((col * 8) + TILE_SIZE, (row * 8));
                        context.closePath();
                        context.fill();
                        context.stroke();
                        break;
                    case 4: // bottom right corner
                        context.beginPath();
                        context.moveTo((col * 8) + TILE_SIZE, (row * 8)); // top right
                        context.lineTo((col * 8), (row * 8) + TILE_SIZE); // bottom left
                        context.lineTo((col * 8) + TILE_SIZE, (row * 8) + TILE_SIZE); // bottom right
                        context.closePath();
                        context.fill();
                        context.stroke();
                        break;
                    case 5: // bottom left corner
                        context.beginPath();
                        context.moveTo((col * 8), (row * 8));
                        context.lineTo((col * 8), (row * 8) + TILE_SIZE);
                        context.lineTo((col * 8) + TILE_SIZE, (row * 8) + TILE_SIZE);
                        context.closePath();
                        context.fill();
                        context.stroke();
                        break;
                }
            }
        }
    },

    render(context, elapsed) {
        this.timeSinceLastTileFrameSwap += elapsed;

        if( this.timeSinceLastTileFrameSwap > TILE_UPDATE_TIME ) {
            this.tileSequenceIdx            = this.tileSequenceIdx < 2 ? this.tileSequenceIdx + 1 : 0;
            this.timeSinceLastTileFrameSwap = 0;
        }

        // TODO: The following should be better managed. Probably through some sort of global render order.

        // render bg layer first
        this.layers[0].render(context);

        // then render the animation layer
        this.animLayers[this.tileSequenceIdx].render(context);

        // render the rest of the layers.
        for( var i = 1; i < this.layers.length; i++ ) {
            this.layers[i].render(context);
        }

        if (DEBUG) {
            this.collisionLayer.render(context);
        }

        // render the entities
        for( var entity of this.entities ) {
            entity.render(context);
        }
    },

};
