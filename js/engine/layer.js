
'use strict';

const Layer = {

    init() {
        this.width          = ROOM_WIDTH;
        this.height         = ROOM_HEIGHT;

        this.canvas         = document.createElement('canvas');
        this.context        = this.canvas.getContext('2d');

        this.canvas.width   = ROOM_WIDTH;
        this.canvas.height  = ROOM_HEIGHT;

        return this;
    },

    render(context) {
        context.drawImage(this.canvas, 0, 0, this.width, this.height);
    }

};
