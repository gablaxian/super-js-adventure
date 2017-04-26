
'use strict';

const tileFPS                   = 7;
const tileUpdateTime            = 1000 / tileFPS;

let timeSinceLastTileFrameSwap  = 0;
let tileSequenceIdx             = 0;

let Map = {

    // called on game load to set initial values
    init(mapID='', coords=[0,0]) {
        this.currentMapID           = mapID;
        this.currentScreenCoords    = coords;

        this.nextScreenCoords       = [0,0];
        this.nextRoomDir            = null;

        // need to get these dimensions into the Editor's exported map data
        // use overworld size for now.
        this.TILES_WIDE         = (32 * 16);
        this.TILES_HIGH         = (22 * 8);

        this.width              = this.TILES_WIDE * TILE_SIZE;
        this.height             = this.TILES_HIGH * TILE_SIZE;

        //
        this.distanceToScroll   = 0;
        this.speed              = 2;
        this.count              = 0;

        //
        this.layers             = world.maps[this.currentMapID].layers;
        this.collisions         = [];

        for( var layer of this.layers ) {
            if( layer.name == 'collision' ) {
                this.collisions = layer.data;
                break;
            }
        }
    },

    //
    pxToCell(x, y) {
        // offset x and y to be map-relative instead of screen relative.
        x += this.currentScreenCoords[0] * SCREEN_WIDTH;
        y += this.currentScreenCoords[1] * ROOM_HEIGHT;

        let row = Math.floor( (y / this.height) * this.TILES_HIGH );
        let col = Math.floor( (x / this.width) * this.TILES_WIDE );

        return (row * this.TILES_WIDE) + col;
    },

    //
    cellToPx(cell) {
        return {
            x: (cell % this.TILES_WIDE) * TILE_SIZE,
            y: Math.floor(cell / this.TILES_WIDE) * TILE_SIZE
        }
    },

    // handles all single room drawing logic
    drawRoom(coords=[0,0], posX=0, posY=0) {

        let tile            = 0;
        let cell            = 0;
        let tileset         = null;
        let tilesetCoords   = {};

        for( var layer of this.layers ) {

            if( layer.name == 'collision' || layer.name == 'entities' ) {
                continue;
            }

            for (let row = 0; row < NUM_TILES_HIGH; row++) {
                for (let col = 0; col < NUM_TILES_WIDE; col++) {

                    let colOffset   = coords[0] * NUM_TILES_WIDE;
                    let rowOffset   = coords[1] * NUM_TILES_HIGH;

                    cell    = ((row + rowOffset) * this.TILES_WIDE) + (col + colOffset);
                    tile    = layer.data[cell];

                    if( tile !== null && tile !== undefined ) {

                        if( Game.animationTiles.indexOf(tile) != -1 ) {
                            tile = Game.tileSequences[tile][tileSequenceIdx];
                        }

                        // get the cell's tileset.
                        var l = Game.spritesheets.length;
                        while(l--) {
                            if( tile > Game.spritesheets[l].gid ) {
                                tileset = Game.spritesheets[l];
                                break;
                            }
                        }

                        tilesetCoords = this.cellToPx.call(tileset, (tile - tileset.gid));

                        Game.context.drawImage(tileset.img, tilesetCoords.x, tilesetCoords.y, TILE_SIZE, TILE_SIZE, (col * 8)+posX, (row * 8)+posY, TILE_SIZE, TILE_SIZE);

                    }
                
                }
            }
        }

    },

    //
    loadNextRoom: function(dir) {

        // Cutting corners by assuming the player is confined to the maps’s grid structure.
        if( dir == 'left' ) {
            this.nextScreenCoords[0]    = this.currentScreenCoords[0] - 1;
            this.nextScreenCoords[1]    = this.currentScreenCoords[1];
            this.distanceToScroll       = ROOM_WIDTH;
        }
        else if( dir == 'right' ) {
            this.nextScreenCoords[0]    = this.currentScreenCoords[0] + 1;
            this.nextScreenCoords[1]    = this.currentScreenCoords[1];
            this.distanceToScroll       = ROOM_WIDTH;
        }
        else if( dir == 'up' ) {
            this.nextScreenCoords[0]    = this.currentScreenCoords[0];
            this.nextScreenCoords[1]    = this.currentScreenCoords[1] - 1;
            this.distanceToScroll       = ROOM_HEIGHT;
        }
        else if( dir == 'down' ) {
            this.nextScreenCoords[0]    = this.currentScreenCoords[0];
            this.nextScreenCoords[1]    = this.currentScreenCoords[1] + 1;
            this.distanceToScroll       = ROOM_HEIGHT;
        }

        this.nextRoomDir        = dir;
        this.count              = 0;
        Game.screenAnimating    = true;
    },

    // Main workhorse function. Called in the main loop.
    // Handles tile animation logic, room transitions and the drawing of a room.
    drawBackground(elapsed) {

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
        Game.context.save();

        // are we in a room transitioning state?
        if( Game.screenAnimating ) {
            this.count += this.speed;

            // if we've scrolled enough then end this transitioning madness and set the current
            // room values to the where we've just scrolled to
            if( this.count >= this.distanceToScroll ) {
                this.count                  = this.distanceToScroll;
                this.currentScreenCoords[0] = this.nextScreenCoords[0];
                this.currentScreenCoords[1] = this.nextScreenCoords[1];
                Game.screenAnimating        = false;
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
                nextRoomX = this.nextRoomDir == 'left' ? -ROOM_WIDTH: ROOM_WIDTH;
                scrollX = nextRoomX > 0 ? -this.count : this.count;
            }

            // now with two screens stacked next to each other incrementally translate the whole canvas
            // in the direction of the new room.
            Game.context.translate(scrollX, scrollY);

            this.drawRoom(this.nextScreenCoords, nextRoomX, nextRoomY);
        }

        this.drawRoom(this.currentScreenCoords, 0, 0);

        Game.context.restore();

    }
}
