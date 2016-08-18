
'use strict';

let Entity = {
    init(id, atlus, data) {
        this.atlus          = atlus;
        this.data           = data.reduce((a, b) => a.concat(b), []);
        this.scaleValue     = 3;

        this.x              = 0;
        this.y              = 0;

        this.TILES_WIDE     = data[0].length;
        this.TILES_HIGH     = data.length;

        this.WIDTH          = this.TILES_WIDE * 8;
        this.HEIGHT         = this.TILES_HIGH * 8;
    },

    render(context) {

        let sprite  = Global.tilesetsArray[(this.atlus - 1)];
        let img     = Global.bitmapArray[(this.atlus - 1)];

        let coords          = {};
        let spriteCoords    = {};

        for (let row = 0; row < this.TILES_HIGH; row++) {
            for (let col = 0; col < this.TILES_WIDE; col++) {

                let cell        = (row * this.TILES_WIDE) + col;
                let tile        = this.data[cell];
                spriteCoords    = sprite.cellToPx(tile);

                context.drawImage(img, this.x + spriteCoords.x, this.y + spriteCoords.y, 8, 8, (col * 8), (row * 8), 8, 8);
            }
        }
    }
}
