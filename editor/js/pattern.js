
'use strict';

let Pattern = {
    init(atlas, data) {
        this.atlas      = atlas;
        this.data       = data;
        this.dataReduced= data.reduce((a, b) => a.concat(b), []);
        this.scaleValue = 3;

        this.TILES_WIDE = data[0].length;
        this.TILES_HIGH = data.length;

        this.WIDTH      = this.TILES_WIDE * 8;
        this.HEIGHT     = this.TILES_HIGH * 8;

        this.canvas     = document.createElement('canvas');
        this.context    = this.canvas.getContext('2d');

        this.canvas.width   = this.WIDTH;
        this.canvas.height  = this.HEIGHT;

        this.scale(3);
    },

    scale(scale) {
        this.scaleValue = scale;

        this.SCALED_WIDTH  = this.WIDTH * scale;
        this.SCALED_HEIGHT = this.HEIGHT * scale;

        this.canvas.style['width']  = this.SCALED_WIDTH + 'px';
        this.canvas.style['height'] = this.SCALED_HEIGHT + 'px';
    },

    render() {

        let sprite  = Global.tilesetsArray[(this.atlas - 1)];
        let img     = Global.bitmapArray[(this.atlas - 1)];

        if( sprite == null ) {
            return;
        }

        let coords          = {};
        let spriteCoords    = {};

        for (let row = 0; row < this.TILES_HIGH; row++) {
            for (let col = 0; col < this.TILES_WIDE; col++) {

                let cell        = (row * this.TILES_WIDE) + col;
                let tile        = this.dataReduced[cell];
                spriteCoords    = sprite.cellToPx(tile);

                this.context.drawImage(img, spriteCoords.x, spriteCoords.y, 8, 8, (col * 8), (row * 8), 8, 8);
            }
        }
    }
}
