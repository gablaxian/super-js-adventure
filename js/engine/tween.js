
'use strict';

/*
    At its core, a tween, or, interpolation, simply calculates frames between two states. The value you pass in for interpolation can be from anywhere.
    A tween from 0 to 1 can occur over 500ms, 300px, or 100 percent. The entire point of the easing function applied to the tween
    is to take the start state, total duration, amount to change and what the current duration is. Whether that's in ms, px or percent is generally up to you.

    ** Making an assumption that a Tween begins on creation. **
*/

const Tween = {

    init(obj, from={}, to={}, duration=600, options={}) {
        // the object we're working on.
        this.obj                = obj;

        this._animationState    = 1; // 0 = stopped, 1 = playing
        this._counter           = 0;

        this.from               = from;
        this.to                 = to;
        this.duration           = duration; // if time-based, use ms.

        // options
        this.delay              = options.delay         || 0;
        this.easing             = options.easing        || Easing.linear;
        this.onComplete         = options.onComplete    || null;

        //
        this.keys               = Object.keys(from);

        return this;
    },

    isAnimating() {
        return this._animationState;
    },

    update(elapsed) {
        this._counter += elapsed;

        // the easing functions don't spit out the final value unless the total time is exactly the duration. Need to check for final value.
        if( this._counter >= (this.duration + this.delay) ) {   // forwards
            this._animationState    = 0;
            this._counter           = (this.duration + this.delay);

            if( this.onComplete ) { this.onComplete() };
        }
        else if( this._counter <= 0 ) {                         // backwards
            this._animationState    = 0;
            this._counter           = 0;

            if( this.onComplete ) { this.onComplete() };
        }

        // do not update tween styles until we've passed any delay which has been set
        if( this.delay && this._totalTime < this.delay ) {
            return;
        }

        for (var i = 0; i < this.keys.length; i++) {
            var key = this.keys[i];
            this.obj[key] = this.easing((this._counter-this.delay), this.from[key], (this.to[key] - this.from[key]), this.duration);
        }
        // for (var prop in this.from) {
        //     this.obj[prop] = this.easing((this._counter-this.delay), this.from[prop], (this.to[prop] - this.from[prop]), this.duration);
        // }
    }

}
