
'use strict';

let Marker = {

    init(elm=null, scaleValue=Global.scale) {
        this.elm        = elm   || document.createElement('div');
        this.scaleValue = scaleValue;

        this.elm.classList.add('Marker');

        this.elm.style.top      = 0;
        this.elm.style.left     = 0;
        this.elm.style.width    = Global.TILE_SIZE * this.scaleValue;
        this.elm.style.height   = Global.TILE_SIZE * this.scaleValue;

        this.hide();

        return this;
    },

    show() {
        this.elm.style.display  = 'block';
    },

    hide() {
        this.elm.style.display  = 'none';
    },

    render(top, left, width, height) {
        this.elm.style.top      = top   + 'px';
        this.elm.style.left     = left  + 'px';
        this.elm.style.width    = (width * this.scaleValue)     + 'px';
        this.elm.style.height   = (height * this.scaleValue)    + 'px';

        this.show();
    }
}
