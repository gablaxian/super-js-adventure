
'use strict';

let Key = {
    UP:     0,
    DOWN:   0,
    LEFT:   0,
    RIGHT:  0,
    SPACE:  0,
    CMD:    0,
    X:      0,
    Z:      0
}

let Input = {

    gamepad:    null,
    ticking:    false,

    // Previous timestamps for gamepad state; used in Chrome to not bother with
    // analyzing the polled data if nothing changed (timestamp is the same
    // as last time).
    prevTimestamp: null,

    init() {
        // Set up the keyboard events
        document.addEventListener('keydown', e => { this.changeKey(e.keyCode, 1) });
        document.addEventListener('keyup',   e => { this.changeKey(e.keyCode, 0) });

        // Checks Chrome to see if the GamePad API is supported.
        let gamepadSupportAvailable = !!navigator.webkitGetGamepads || !!navigator.webkitGamepads;

        if(gamepadSupportAvailable) {
            // Since Chrome only supports polling, we initiate polling loop straight
            // away. For Firefox, we will only do it if we get a connect event.
            if (!!navigator.webkitGamepads || !!navigator.webkitGetGamepads) {
                Input.startPolling();
            }
        }
    },

    // called on key up and key down events
    changeKey(key, value) {
        switch( key ) {
            case 37: Key.LEFT   = value; break; // left
            case 39: Key.RIGHT  = value; break; // right
            case 38: Key.UP     = value; break; // up
            case 40: Key.DOWN   = value; break; // down
            case 32: Key.SPACE  = value; break; // attack (space bar)
            case 91: Key.CMD    = value; break; // use item (cmd)
            case 88: Key.X      = value; break; // start (x)
            case 90: Key.Z      = value; break; // select (z)
        }
    },


    /**
     * Starts a polling loop to check for gamepad state.
     */
    startPolling() {
        // Don’t accidentally start a second loop, man.
        if (!Input.ticking) {
            Input.ticking = true;
            Input.tick();
        }
    },

    /**
     * Stops a polling loop by setting a flag which will prevent the next
     * requestAnimationFrame() from being scheduled.
     */
    stopPolling() {
        Input.ticking = false;
    },

    /**
     * A function called with each requestAnimationFrame(). Polls the gamepad
     * status and schedules another poll.
     */
    tick() {
        Input.pollStatus();
        Input.scheduleNextTick();
    },

    scheduleNextTick() {
        // Only schedule the next frame if we haven’t decided to stop via
        // stopPolling() before.
        if (Input.ticking) {
            requestAnimationFrame(Input.tick);
        }
    },

    /**
     * Checks for the gamepad status. Monitors the necessary data and notices
     * the differences from previous state (buttons and connects/disconnects for Chrome). If differences are noticed, asks
     * to update the display accordingly. Should run as close to 60 frames per second as possible.
     */
    pollStatus() {
        // We're only interested in one gamepad, which is the first.
        this.gamepad = navigator.webkitGetGamepads && navigator.webkitGetGamepads()[0];

        if(!this.gamepad)
            return;

        // Don’t do anything if the current timestamp is the same as previous
        // one, which means that the state of the gamepad hasn’t changed.
        // The first check makes sure we’re not doing anything if the timestamps are empty or undefined.
        if (this.gamepad.timestamp && (this.gamepad.timestamp == Input.prevTimestamp)) {
            return
        }

        Input.prevTimestamp = this.gamepad.timestamp;

        Input.updateKeys();
    },

    updateKeys() {

        // console.log(gamepad.buttons)

        // Map the d-pad
        this.key[0] = this.gamepad.axes[0] <= -0.5  // left
        this.key[1] = this.gamepad.axes[0] >= 0.5   // right
        this.key[2] = this.gamepad.axes[1] <= -0.5  // up
        this.key[3] = this.gamepad.axes[1] >= 0.5   // down

        // Map the Buttons
        this.key[4] = this.gamepad.buttons[0];  // attack (A)
        this.key[5] = this.gamepad.buttons[1];  // use item (B)
        this.key[6] = this.gamepad.buttons[10]; // start
        this.key[7] = this.gamepad.buttons[9];  // select
    }

}
