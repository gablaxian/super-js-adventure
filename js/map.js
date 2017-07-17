
'use strict';

const Map = {

    // called on game load to set initial values
    init(mapID='', coords=[0,0]) {
        this.currentMapID           = mapID;
        this.currentScreenCoords    = coords;

        this.nextScreenCoords       = [0,0];
        this.nextRoomDir            = null;

        //
        this.old_room               = document.createElement('canvas');
        this.old_room.width         = ROOM_WIDTH;
        this.old_room.height        = ROOM_HEIGHT;

        this.new_room               = document.createElement('canvas');
        this.new_room.width         = ROOM_WIDTH;
        this.new_room.height        = ROOM_HEIGHT;

        // need to get these dimensions into the Editor's exported map data
        // use overworld size for now.
        this.TILES_WIDE             = world.maps[this.currentMapID].tiles_wide;
        this.TILES_HIGH             = world.maps[this.currentMapID].tiles_high;

        this.width                  = this.TILES_WIDE * TILE_SIZE;
        this.height                 = this.TILES_HIGH * TILE_SIZE;

        //
        this.distanceToScroll       = 0;
        this.speed                  = 4;
        this.count                  = 0;

        //
        this.layers                 = world.maps[this.currentMapID].layers;
        this.layerObjArr            = [];

        this.setupRoom(this.currentScreenCoords, 0, 0);
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

    setupRoom(coords=[0,0]) {
        Room.init(coords);
    },

    //
    loadNextRoom: function(dir) {

        // snapshot old room.
        let context = this.old_room.getContext('2d');
        let tween   = null;

        Room.render(context, 0);

        // Cutting corners by assuming the player is confined to the maps’s grid structure.
        if( dir == 'left' ) {
            this.nextScreenCoords[0]    = this.currentScreenCoords[0] - 1;
            this.nextScreenCoords[1]    = this.currentScreenCoords[1];
            this.distanceToScroll       = ROOM_WIDTH;

            tween = Object.create(Tween).init(Game.player, {x: Game.player.x}, {x: ROOM_WIDTH - 32}, 1000);
        }
        else if( dir == 'right' ) {
            this.nextScreenCoords[0]    = this.currentScreenCoords[0] + 1;
            this.nextScreenCoords[1]    = this.currentScreenCoords[1];
            this.distanceToScroll       = ROOM_WIDTH;

            tween = Object.create(Tween).init(Game.player, {x: Game.player.x}, {x: 16}, 1000);
        }
        else if( dir == 'up' ) {
            this.nextScreenCoords[0]    = this.currentScreenCoords[0];
            this.nextScreenCoords[1]    = this.currentScreenCoords[1] - 1;
            this.distanceToScroll       = ROOM_HEIGHT;

            tween = Object.create(Tween).init(Game.player, {y: Game.player.y}, {y: ROOM_HEIGHT - 32}, 700);
        }
        else if( dir == 'down' ) {
            this.nextScreenCoords[0]    = this.currentScreenCoords[0];
            this.nextScreenCoords[1]    = this.currentScreenCoords[1] + 1;
            this.distanceToScroll       = ROOM_HEIGHT;

            tween = Object.create(Tween).init(Game.player, {y: Game.player.y}, {y: 10}, 700);
        }

        this.nextRoomDir        = dir;
        this.count              = 0;
        Game.state              = GAME_STATE.LOADING;

        Room.init(this.nextScreenCoords);
        context = this.new_room.getContext('2d');
        Room.render(context, 0);

        // set a tween going for the player to move them to the entrance of the next room.
        Game.tweens.push(tween);
    },

    // Main workhorse function. Called in the main loop.
    // Handles tile animation logic, room transitions and the drawing of a room.
    render(elapsed) {

        // are we in a room transitioning state?
        if( Game.state === GAME_STATE.LOADING ) {
            this.count += this.speed;

            // if we've scrolled enough then end this transitioning madness and set the current
            // room values to the where we've just scrolled to
            if( this.count >= this.distanceToScroll ) {
                this.count                  = this.distanceToScroll;
                this.currentScreenCoords[0] = this.nextScreenCoords[0];
                this.currentScreenCoords[1] = this.nextScreenCoords[1];
                Game.state                  = GAME_STATE.PLAYING;
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
                nextRoomY   = this.nextRoomDir == 'up' ? -ROOM_HEIGHT : ROOM_HEIGHT;
                scrollY     = nextRoomY > 0 ?  -this.count : this.count;
            }
            else {
                nextRoomX   = this.nextRoomDir == 'left' ? -ROOM_WIDTH: ROOM_WIDTH;
                scrollX     = nextRoomX > 0 ? -this.count : this.count;
            }


            Game.context.save();

            // now with two screens stacked next to each other incrementally translate the whole canvas
            // in the direction of the new room.
            Game.context.translate(scrollX, scrollY);

            // this.drawRoom(this.nextScreenCoords, nextRoomX, nextRoomY);
            Game.context.drawImage(this.old_room, 0, 0);
            Game.context.drawImage(this.new_room, nextRoomX, nextRoomY);

            Game.context.restore();
        }
        else {
            Room.render(Game.context, elapsed);
        }

    }
}
