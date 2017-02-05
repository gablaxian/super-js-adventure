/**
    Layer
 */
'use strict';

let Layer = {

    // These are the basics which constitute a layer, conceptually.
    init(name, tiles_wide, tiles_high, data) {
        this.name       = name;
        this.data       = data || new Array();
        this.hidden     = false;

        this.TILES_WIDE = tiles_wide;
        this.TILES_HIGH = tiles_high;
    },

    // Handles the visual aspect of the layer. Canvas, etc...
    setup() {
        /**
            I'm not totally sold on having one object handle both the data and the rendering. But I can't think of a better way to separate data and presentation right now.
            Possible have Layer() be the data and LayerImage()? or LayerCanvas()? Not sure.
        **/

        this._scale         = Global.scale;

        // store the map pixel dimensions
        this.WIDTH          = this.TILES_WIDE * Global.TILE_SIZE;
        this.HEIGHT         = this.TILES_HIGH * Global.TILE_SIZE;

        // create a canvas per layer.
        // check for one we can already use (created on first page load)
        // this super ties the object to the HTML which is generally bad. But don't care right now.
        this.canvas         = document.getElementById(this.name) || document.createElement('canvas');
        this.context        = this.canvas.getContext('2d');


        this.canvas.width   = this.WIDTH;
        this.canvas.height  = this.HEIGHT;
        this.canvas.setAttribute('id', this.name);

        // always initially hide the collision layer
        if( this.name == 'collision' ) {
            this.hide();
        }

        // console.log('layer setup');
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

    cellToPx(cell) {
        return {
            x: (cell % this.TILES_WIDE) * Global.TILE_SIZE,
            y: Math.floor(cell / this.TILES_WIDE) * Global.TILE_SIZE
        }
    },

    addTile(cell, tile) {
        this.data[cell] = tile;
    },

    addEntity(entity) {
        this.data.push(entity);
    },

    renderEntity(entity) {
        console.log(entity.x, entity.y);
        // this.context.drawImage(entity.canvas, entity.x, entity.y);
        entity.render(this.context);
    },

    // collision tiles are handled slightly differently. They do not correspond to an image. Instead they are drawn directly with canvas.
    renderTile(cell) {

        let tile            = this.data[cell];
        let coords          = {};
        let spriteCoords    = {};

        coords = this.cellToPx(cell);

        // clear the cell first.
        this.context.clearRect(coords.x, coords.y, Global.TILE_SIZE, Global.TILE_SIZE);

        // if there is no tile (or it was just deleted) then do nothing.
        if( tile == null ) {
            return;
        }

        let idx;
        for (idx = Global.tilesetsArray.length - 1; idx > 0; idx--) {
            if (Global.tilesetsArray[idx].GID <= tile) {
                break;
            }
        }

        const sprite    = Global.tilesetsArray[idx];
        const img       = Global.bitmapArray[idx];

        // console.log('rendering tile...', sprite, img, cell, tile);

        tile = tile - sprite.GID;


        if( this.name != 'collision' ) {
            spriteCoords    = sprite.cellToPx(tile);

            this.context.drawImage(img, spriteCoords.x, spriteCoords.y, Global.TILE_SIZE, Global.TILE_SIZE, coords.x, coords.y, Global.TILE_SIZE, Global.TILE_SIZE);
        }
        else {
            this.context.clearRect(coords.x, coords.y, Global.TILE_SIZE, Global.TILE_SIZE);

            this.context.fillStyle      = 'rgba(255, 0, 0, 0.3)';
            this.context.strokeStyle    = 'rgba(255, 0, 0, 0.9)';

            switch (tile) {
                case 1: // full tile collision
                    this.context.fillRect(coords.x, coords.y, Global.TILE_SIZE, Global.TILE_SIZE);
                    this.context.strokeRect(coords.x+0.5, coords.y+0.5, Global.TILE_SIZE-1, Global.TILE_SIZE-1);
                    break;
                case 2: // top left to bottom right
                    this.context.beginPath();
                    this.context.moveTo(coords.x, coords.y);
                    this.context.lineTo(coords.x + Global.TILE_SIZE, coords.y + Global.TILE_SIZE)
                    this.context.stroke();
                    break;

                case 3: // top right to bottom left
                    this.context.beginPath();
                    this.context.moveTo(coords.x + Global.TILE_SIZE, coords.y)
                    this.context.lineTo(coords.x, coords.y + Global.TILE_SIZE);
                    this.context.stroke();
                    break;
                default:

            }

        }

    },

    render() {
        this.context.clearRect(0, 0, this.WIDTH, this.HEIGHT);

        // use first img as a test
        let idx;
        let sprite;
        let img;

        let tile            = null;
        let coords          = {};
        let spriteCoords    = {};

        // if( this.name == 'entities' ) {
        //     for (var entity of this.data) {
        //         entity.render();
        //         this.renderEntity(entity);
        //     }
        //
        //     return;
        // }

        for(var cell = 0; cell < this.data.length; cell++) {

            // we'll come back to this
            // renderTile(cell);

            tile = this.data[cell];

            if( tile !== null && tile !== undefined ) {

                // get the atlas
                let idx = 0;
                for (idx = Global.tilesetsArray.length - 1; idx > 0; idx--) {
                    if (Global.tilesetsArray[idx].GID <= tile) {
                        break;
                    }
                }

                // console.log(Global.tilesetsArray.length, tile);

                sprite  = Global.tilesetsArray[idx];
                img     = Global.bitmapArray[idx];

                tile = tile - sprite.GID;

                if( this.name != 'collision' && this.name != 'entities' ) {
                    coords          = this.cellToPx(cell);
                    spriteCoords    = sprite.cellToPx(tile);

                    this.context.drawImage(img, spriteCoords.x, spriteCoords.y, Global.TILE_SIZE, Global.TILE_SIZE, coords.x, coords.y, Global.TILE_SIZE, Global.TILE_SIZE);
                }
                else if( this.name == 'collision' ) {
                    coords = this.cellToPx(cell);

                    this.context.fillStyle      = 'rgba(255, 0, 0, 0.3)';
                    this.context.strokeStyle    = 'rgba(255, 0, 0, 0.9)';

                    switch (tile) {
                        case 1: // full tile collision
                            this.context.fillRect(coords.x, coords.y, Global.TILE_SIZE, Global.TILE_SIZE);
                            this.context.strokeRect(coords.x+0.5, coords.y+0.5, Global.TILE_SIZE-1, Global.TILE_SIZE-1);
                            break;
                        case 2: // top left to bottom right
                            this.context.beginPath();
                            this.context.moveTo(coords.x, coords.y);
                            this.context.lineTo(coords.x + Global.TILE_SIZE, coords.y + Global.TILE_SIZE)
                            this.context.stroke();
                            break;

                        case 3: // top right to bottom left
                            this.context.beginPath();
                            this.context.moveTo(coords.x + Global.TILE_SIZE, coords.y)
                            this.context.lineTo(coords.x, coords.y + Global.TILE_SIZE);
                            this.context.stroke();
                            break;
                        default:

                    }
                }

            }
        }

    }
}
