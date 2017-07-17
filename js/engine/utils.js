
'use strict';

const Easing = {
    linear(time, begin, change, duration) {
        return change*(time/=duration) + begin;
    },
    easeInQuad(time, begin, change, duration) {
        return change*(time/=duration)*time + begin;
    },
    easeOutQuad(time, begin, change, duration) {
        return -change *(time/=duration)*(time-2) + begin;
    },
    easeInOutQuad(time, begin, change, duration) {
        if( (time /= duration/2) < 1 ) {
            return change/2*time*time + begin;
        }
        return -change/2 * ( (--time)*(time-2) - 1 ) + begin;
    },
    easeOutBounce(t, b, c, d) {
        if ((t/=d) < (1/2.75)) {
            return c*(7.5625*t*t) + b;
        } else if (t < (2/2.75)) {
            return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
        } else if (t < (2.5/2.75)) {
            return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
        } else {
            return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
        }
    }
}

const Utils = {

    getTileset(id) {

        for (var tileset of Game.tilesets) {
            if( tileset.id == id ) {
                return tileset;
            }
        }

        return false;
    }

}
