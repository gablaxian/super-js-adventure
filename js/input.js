
var Input = {

    gamepad: null,

    ticking: false,

    // Previous timestamps for gamepad state; used in Chrome to not bother with
    // analyzing the polled data if nothing changed (timestamp is the same
    // as last time).
    prevTimestamp: null,

    init: function() {
        // Set up the keyboard events
        document.addEventListener('keydown', function(e) { Input.changeKey(e.keyCode, 1) });
        document.addEventListener('keyup',    function(e) { Input.changeKey(e.keyCode, 0) });

        // Checks Chrome to see if the GamePad API is supported.
        var gamepadSupportAvailable = !!navigator.webkitGetGamepads || !!navigator.webkitGamepads;

        if(gamepadSupportAvailable) {
            // Since Chrome only supports polling, we initiate polling loop straight
            // away. For Firefox, we will only do it if we get a connect event.
            if (!!navigator.webkitGamepads || !!navigator.webkitGetGamepads) {
                Input.startPolling();
            }
        }
    },

    // called on key up and key down events
    changeKey: function(which, to) {
        switch (which){
            case 65: case 37: key[0]=to; break; // left
            case 87: case 38: key[2]=to; break; // up
            case 68: case 39: key[1]=to; break; // right
            case 83: case 40: key[3]=to; break;// down
            case 32: key[4]=to; break; // attack (space bar)
            case 91: key[5]=to; break; // use item (cmd)
            case 88: key[6]=to; break; // start (x)
            case 90: key[7]=to; break; // select (z)
        }
    },


    /**
     * Starts a polling loop to check for gamepad state.
     */
    startPolling: function() {
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
    stopPolling: function() {
        Input.ticking = false;
    },

    /**
     * A function called with each requestAnimationFrame(). Polls the gamepad
     * status and schedules another poll.
     */
    tick: function() {
        Input.pollStatus();
        Input.scheduleNextTick();
    },

    scheduleNextTick: function() {
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
    pollStatus: function() {
        // We're only interested in one gamepad, which is the first.
        gamepad = navigator.webkitGetGamepads && navigator.webkitGetGamepads()[0];

        if(!gamepad)
            return;

        // Don’t do anything if the current timestamp is the same as previous
        // one, which means that the state of the gamepad hasn’t changed.
        // The first check makes sure we’re not doing anything if the timestamps are empty or undefined.
        if (gamepad.timestamp && (gamepad.timestamp == Input.prevTimestamp)) {
            return
        }

        Input.prevTimestamp = gamepad.timestamp;

        Input.updateKeys();
    },

    updateKeys: function() {

        // console.log(gamepad.buttons)

        // Map the d-pad
        key[0] = gamepad.axes[0] <= -0.5 // left
        key[1] = gamepad.axes[0] >= 0.5 // right
        key[2] = gamepad.axes[1] <= -0.5  // up
        key[3] = gamepad.axes[1] >= 0.5 // down

        // Map the Buttons
        key[4] = gamepad.buttons[0]; // attack (A)
        key[5] = gamepad.buttons[1]; // use item (B)

        key[6] = gamepad.buttons[10]; // start
        key[7] = gamepad.buttons[9]; // select
    }

}