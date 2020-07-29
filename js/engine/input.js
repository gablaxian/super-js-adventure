
'use strict';

const Input = {

    // maps keycodes to human readable names.
    KEYCODE_MAP: {
        ENTER:  13,
        SHIFT:  16,
        CTRL:   17,
        ALT:    18,
        SPACE:  32,
        LEFT:   37,
        UP:     38,
        RIGHT:  39,
        DOWN:   40,
        A:      65,
        S:      83
    },
    // used to store custom key mapping names to their keycodes
    KEY_MAP: {},
    // stores the state of a given keycode
    KEY_STATES: {},

    //
    init(keys={}) {
        this.gamepad    = null;
        this.ticking    = false;

        // Previous timestamps for gamepad state; used in Chrome to not bother with analyzing the polled data if nothing changed (timestamp is the same as last time).
        this.prevTimestamp = null;

        // configure keys
        this.configureKeys(keys);

        // Set up the keyboard events
        document.addEventListener('keydown', e => { this.changeKey(e.keyCode, 1) });
        document.addEventListener('keyup',   e => { this.changeKey(e.keyCode, 0) });

        // Checks Chrome to see if the GamePad API is supported.
        let gamepadSupportAvailable = !!navigator.getGamepads;

        if(gamepadSupportAvailable) {
            console.log('gamepad support');

            // Since Chrome only supports polling, we initiate polling loop straight away. For Firefox, we will only do it if we get a connect event.
            if (!!navigator.getGamepads) {
                this.gamepad = navigator.getGamepads && navigator.getGamepads()[0];
                setTimeout( e => { console.log(this.gamepad); }, 500 );
                this.startPolling();
            }
        }
    },

    /*
     * Allows for custom key configurations.
     */
    configureKeys(keys={}) {

        let count = 0;

        for (let key in keys) {
            if( keys.hasOwnProperty(key) ) {
                this.KEY_MAP[key]                   = this.KEYCODE_MAP[keys[key]];
                this.KEY_STATES[this.KEY_MAP[key]]  = 0;
                count++;
            }
        }

        // no keys provided (how else do you figure out the length of an object?)
        // if no custom keys are provided, use the default set.
        if( count == 0 ) {
            for (let key in this.KEYCODE_MAP) {
                if (this.KEYCODE_MAP.hasOwnProperty(key)) {
                    this.KEY_STATES[key] = 0;
                }
            }
        }
    },

    // called on key up and key down events
    changeKey(key, value) {
        this.KEY_STATES[key] = value;
    },

    isPressed(key='') {
        key = key.toUpperCase();
        if( this.KEY_STATES[ this.KEY_MAP[key] ] !== undefined ) {
            return this.KEY_STATES[ this.KEY_MAP[key] ];
        }

        // console.log(key, this.KEY_STATES);
    },

    /**
     * Starts a polling loop to check for gamepad state.
     */
    startPolling() {
        // Don’t accidentally start a second loop, man.
        if (!this.ticking) {
            this.ticking = true;
            this.tick();
        }
    },

    /**
     * Stops a polling loop by setting a flag which will prevent the next
     * requestAnimationFrame() from being scheduled.
     */
    stopPolling() {
        this.ticking = false;
    },

    /**
     * A function called with each requestAnimationFrame(). Polls the gamepad
     * status and schedules another poll.
     */
    tick() {
        this.pollStatus();
        this.scheduleNextTick();
    },

    scheduleNextTick() {
        // Only schedule the next frame if we haven’t decided to stop via
        // stopPolling() before.
        if (this.ticking) {
            requestAnimationFrame(this.tick.bind(this));
        }
    },

    /**
     * Checks for the gamepad status. Monitors the necessary data and notices
     * the differences from previous state (buttons and connects/disconnects for Chrome). If differences are noticed, asks
     * to update the display accordingly. Should run as close to 60 frames per second as possible.
     */
    pollStatus() {
        // We're only interested in one gamepad, which is the first.
        this.gamepad = navigator.getGamepads && navigator.getGamepads()[0];

        if(!this.gamepad)
            return;


        // Don’t do anything if the current timestamp is the same as previous
        // one, which means that the state of the gamepad hasn’t changed.
        // The first check makes sure we’re not doing anything if the timestamps are empty or undefined.
        if (this.gamepad.timestamp && (this.gamepad.timestamp == Input.prevTimestamp)) {
            return
        }

        this.prevTimestamp = this.gamepad.timestamp;

        this.updateKeys();
    },

    updateKeys() {

        if( true ) {
            for (var i = 0; i < this.gamepad.buttons.length; i++) {
                if( this.gamepad.buttons[i].pressed ) {
                    console.log(i);
                }
            }
        }

        // Map the analogue joystick & d-pad
        this.KEY_STATES[this.KEYCODE_MAP.UP]    = this.gamepad.axes[1] <= -0.5  || this.gamepad.buttons[12].value // up
        this.KEY_STATES[this.KEYCODE_MAP.DOWN]  = this.gamepad.axes[1] >= 0.5   || this.gamepad.buttons[13].value // down
        this.KEY_STATES[this.KEYCODE_MAP.LEFT]  = this.gamepad.axes[0] <= -0.5  || this.gamepad.buttons[14].value // left
        this.KEY_STATES[this.KEYCODE_MAP.RIGHT] = this.gamepad.axes[0] >= 0.5   || this.gamepad.buttons[15].value // right

        // Map the Buttons
        this.KEY_STATES[this.KEYCODE_MAP.A]     = this.gamepad.buttons[0];  // attack (A)
        this.KEY_STATES[this.KEYCODE_MAP.B]     = this.gamepad.buttons[1];  // use item (B)
        this.KEY_STATES[this.KEYCODE_MAP.ENTER] = this.gamepad.buttons[10]; // start
        this.KEY_STATES[this.KEYCODE_MAP.SHIFT] = this.gamepad.buttons[9];  // select
    }

};
