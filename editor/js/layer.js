/**
    Layer

    A layer is both the conceptual database of a game’s maps (data arrays), and also the visual representation of that data (canvas object).
    It handles the storing and fetching of the tile indexes at given cell coordinates along with the tileset it belongs to.
    And it also handles the rendering of that tile to its canvas.

    Storing both the tileset and the index in parallel arrays is the best way I can think of to handle tileset changes during the
    editing process. It is resilient to re-ordering, enlarging and adding more tilesets.

    Note:
        I’m not totally sold on having one Layer object handling all layer-related duties, but I can’t think of a better way to separate data and presentation right now.
        I imagine there should be some kind of Renderer object. Possibly also some LayerManager object.
**/

let Layer = {

    init(name, tilesWide, tilesHigh, tilesetNames, data) {
        this.name           = name;                             // name of the layer
        this.tilesetNames   = tilesetNames  || new Array();     // array of the tileset names per cell
        this.data           = data          || new Array();     // The layer's data. Could be the tileset indexes, the collision type indexes, or entity objects, or whatever!
        this.hidden         = false;                            // flag for showing/hiding the layer in the viewport

        this.TILES_WIDE     = tilesWide;
        this.TILES_HIGH     = tilesHigh;

        return this;
    },

    // Handles the visual aspect of the layer. Canvas, etc...
    setup() {
        this._scale         = Global.scale;

        // store the map pixel dimensions
        this.WIDTH          = this.TILES_WIDE * Global.TILE_SIZE;
        this.HEIGHT         = this.TILES_HIGH * Global.TILE_SIZE;

        // create a canvas per layer.
        // check for one we can already use (created on first page load)
        // this ties the object to the HTML which is generally bad. But don't care right now.
        this.canvas         = document.getElementById(this.name) || document.createElement('canvas');
        this.context        = this.canvas.getContext('2d');

        this.canvas.width   = this.WIDTH;
        this.canvas.height  = this.HEIGHT;
        this.canvas.setAttribute('id', this.name);

        // always initially hide the collision layer
        if( this.name == 'collision' ) {
            this.hide();
        }
    },

    scale(scale) {
        this._scale = scale;
        this.canvas.style['width']  = (this.WIDTH * scale) +'px';
        this.canvas.style['height'] = (this.HEIGHT * scale) +'px';
    },

    hide() {
        this.canvas.style['display'] = 'none';
        this.hidden = true;
    },

    show() {
        this.canvas.style['display'] = 'block';
        this.hidden = false;
    },

    export() {
        return {
            name:           this.name,
            tilesetNames:   this.tilesetNames,
            data:           this.data,
        }
    },

    //--------------------------------------------------------------------

    cellToPx(cell) {
        return {
            x: (cell % this.TILES_WIDE) * Global.TILE_SIZE,
            y: Math.floor(cell / this.TILES_WIDE) * Global.TILE_SIZE
        }
    },

    //--------------------------------------------------------------------

    addTile(cell, tileIndex, tilesetName) {
        this.tilesetNames[cell] = tilesetName;
        this.data[cell]         = tileIndex;
    },

    addEntity(id, x, y) {
        this.data.push( {id, x, y} );

        return this.data.length - 1; // return the index of the newly added entity.
    },

    //--------------------------------------------------------------------

    deleteEntity(idx) {
        this.data.splice(idx,1);
    },

    deleteEntityByPosition(x,y) {
        // go backwards to delete from the top down, so to speak, in case of overlap.
        for(var i = this.data.length-1; i>=0; i--) {
            let obj             = this.data[i];
            let currentEntity   = null;

            if( !obj ) {
                continue;
            }

            for( let entity of Global.entityArray ) {
                if( obj.id == entity.id ) {
                    currentEntity = entity;
                }
            }

            if( currentEntity ) {
                if(
                    x >= obj.x && x < (obj.x + currentEntity.WIDTH) &&
                    y >= obj.y && y < (obj.y + currentEntity.HEIGHT)
                ) {
                    this.deleteEntity(i);
                    return;
                }
            }
        }
    },

    //--------------------------------------------------------------------

    // collision tiles are handled slightly differently. They do not correspond to an image. Instead they are drawn directly with canvas.
    renderTile(cell, clear=true) {

        // get the tile index and its tileset.
        let tile    = this.data[cell];
        let tileset = this.tilesetNames[cell];

        // get the tile’s pixel coords.
        let coords  = this.cellToPx(cell);

        // clear the cell first. Under a flag, so that we can use this function in `render()` and do one clear first.
        if( clear ) {
            this.context.clearRect(coords.x, coords.y, Global.TILE_SIZE, Global.TILE_SIZE);
        }

        // if there is no tile (or it was just deleted) then do nothing.
        if( tile == null ) {
            return;
        }

        let sprite = Utils.getTilesetByName(tileset);

        // There are two tile types, normal and collision. Collision is currently not an image, so is drawn differently.
        if( this.name != 'collision' ) {
            let spriteCoords = sprite.cellToPx(tile);

            this.context.drawImage(sprite.img, spriteCoords.x, spriteCoords.y, Global.TILE_SIZE, Global.TILE_SIZE, coords.x, coords.y, Global.TILE_SIZE, Global.TILE_SIZE);
        }
        else {
            this.context.drawImage(Global.collisionTiles[tile], coords.x, coords.y);
        }

    },

    renderEntity(idx) {
        if( this.data[idx] ) {

            // find the entity this object belongs to and render its canvas.
            let currentEntity;
            let obj = this.data[idx];

            for( let entity of Global.entityArray ) {
                if( obj.id == entity.id ) {
                    currentEntity = entity;
                }
            }

            this.context.drawImage(currentEntity.canvas, obj.x, obj.y);
        }
    },

    render() {
        // clear the whole layer
        this.context.clearRect(0, 0, this.WIDTH, this.HEIGHT);

        // get the tile index and its tileset.
        let tile            = 0;
        let tileset         = '';

        let coords          = {};
        let sprite          = {};
        let spriteCoords    = {};

        for(var cell = 0; cell < this.data.length; cell++) {

            if( this.name == 'entities' ) {
                this.renderEntity(cell);
            }
            else {
                // get the tile index and its tileset.
                tile    = this.data[cell];
                tileset = this.tilesetNames[cell];

                if( tile !== null && tile !== undefined ) {

                    sprite = Utils.getTilesetByName(tileset);
                    coords = this.cellToPx(cell);

                    if( this.name != 'collision' ) {
                        spriteCoords = sprite.cellToPx(tile);

                        this.context.drawImage(sprite.img, spriteCoords.x, spriteCoords.y, Global.TILE_SIZE, Global.TILE_SIZE, coords.x, coords.y, Global.TILE_SIZE, Global.TILE_SIZE);
                    }
                    else if( this.name == 'collision' ) {
                        this.context.drawImage(Global.collisionTiles[tile], coords.x, coords.y);
                    }

                }
            }

        }

    }
}
