
'use strict';

/**
    Grids, like layers, have their own canvas. But they do not have any 'data' associated with them, and they use native scaling, intead of CSS scaling
    as we don't want the grid lines to change thickness.
 **/

let Grid = {
    init(width, height, cellWidth=8, cellHeight=8) {
        this.WIDTH          = width;
        this.HEIGHT         = height;

        this.cellWidth      = cellWidth;
        this.cellHeight     = cellHeight;

        this.canvas         = document.createElement('canvas');
        this.context        = this.canvas.getContext('2d');

        this.canvas.setAttribute('id', 'grid');

        this._scale         = Global.scale;
    },

    resize(width, height) {
        this.WIDTH  = width;
        this.HEIGHT = height;
    },

    scale(scale) {
        this._scale         = scale;

        this.SCALED_WIDTH   = this.WIDTH  * scale;
        this.SCALED_HEIGHT  = this.HEIGHT * scale;

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.canvas.width   = this.SCALED_WIDTH;
        this.canvas.height  = this.SCALED_HEIGHT;
    },

    render() {
        let cols = Math.floor(this.WIDTH / this.cellWidth);
        let rows = Math.floor(this.HEIGHT / this.cellHeight);

        // for the 'room size' grid (larger than the 8px cell size), make the lines darker to have them stand out.
        if( this.cellWidth > 8 ) {
            this.context.strokeStyle    = 'rgba(30,30,30,1)';
        }
        else {
            this.context.strokeStyle    = 'rgba(100,100,100,0.8)';
        }
        this.context.lineWidth      = 1;

        // fix the sub-pixel line problem by subtracting 0.5
        for (let col = 1; col < cols; col++) {
            this.context.beginPath();
            this.context.setLineDash([4,1]);

            this.context.moveTo( (col * this.cellWidth * this._scale) - 0.5, 0 );
            this.context.lineTo( (col * this.cellWidth * this._scale) - 0.5, this.SCALED_HEIGHT );

            this.context.stroke();
        }

        for (let row = 1; row < rows; row++) {
            this.context.beginPath();
            this.context.setLineDash([4,1]);

            this.context.moveTo( 0, (row * this.cellHeight * this._scale) - 0.5 );
            this.context.lineTo( this.SCALED_WIDTH, (row * this.cellHeight * this._scale) - 0.5 );

            this.context.stroke();
        }
    }
}
