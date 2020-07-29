
'use strict';

const HUD = {

    init() {

        this.minimap    = null;
        this.item1      = null;
        this.item2      = null;
        this.rupees     = 0;
        this.keys       = 0;
        this.bombs      = 0;
        this.life       = 0;

        this.width      = ROOM_WIDTH;
        this.height     = HUD_HEIGHT;
    },

    update() {

    },

    render(context) {
        context.fillStyle = '#000';
        context.fillRect(0, 0, this.width, this.height);
    }
}
