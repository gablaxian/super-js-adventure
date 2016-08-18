
'use strict';

let Eventer = {
    init() {
        this.events = this.events || {}; // use previously created object or create a new one.
    },

    on(event, cb) {
        this.init();

        this.events[event] = this.events[event] || [];
        this.events[event].push(cb);
    },

    dispatch(event, ...args) {
        this.init();

        if( this.events[event] !== undefined  ) {
            for (var i = 0; i < this.events[event].length; i++) {
                this.events[event][i].apply(this, args);
            }
        }
    }
}
