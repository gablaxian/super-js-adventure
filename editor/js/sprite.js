
'use strict';

let Sprite = {

    init(src) {
        this.img        = new Image();
        this.img.src    = 'images/tilesets/' + src;

        this.name       = src.replace('.png', '').replace('-', ' ');

        this.width      = 0;
        this.height     = 0;

        this.TILES_WIDE = 0;
        this.TILES_HIGH = 0;

        this._scale     = 1;

        return new Promise( (resolve, reject) => {

            this.img.onload = () => {

                this.width      = this.img.width;
                this.height     = this.img.height;

                this.TILES_WIDE = Math.floor( this.width / Global.TILE_SIZE );
                this.TILES_HIGH = Math.floor( this.height / Global.TILE_SIZE );

                resolve(this);

            };

        });

    },

    cellToPx(cell) {
        return {
            x: ((cell % this.TILES_WIDE) * Global.TILE_SIZE),
            y: (Math.floor(cell / this.TILES_WIDE) * Global.TILE_SIZE)
        }
    },

    // used when clicking on the tileset to select a specific tile
    pxToCell(x,y) {
        let col = Math.floor( x / (Global.TILE_SIZE * this._scale) );
        let row = Math.floor( y / (Global.TILE_SIZE * this._scale) );

        return (row * this.TILES_WIDE + col) + this.GID;
    },

    scale(scale) {
        this._scale             = scale;
        this.img.style.width    = (this.width * scale) + 'px';
    }

}
