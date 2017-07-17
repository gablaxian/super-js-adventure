
'use strict';

const Stats = {

    elm:                document.querySelector('#stats'),
    currentFrameTime:   0,
    minFrameTime:       3,
    maxFrameTime:       0,

    begin() {
        this.startTime = window.performance.now();
    },

    end() {
        this.endTime = window.performance.now();
        this.draw();
    },

    draw() {
        if( !DEBUG ) return;
        
        this.currentFrameTime = (this.endTime - this.startTime);

        this.minFrameTime = Math.min(this.currentFrameTime, this.minFrameTime);
        this.maxFrameTime = Math.max(this.currentFrameTime, this.maxFrameTime);

        this.elm.innerHTML = 'Frame time: ' + parseFloat(this.currentFrameTime).toFixed(2) + ' ms (' + parseFloat(this.minFrameTime).toFixed(2) + '-' + parseFloat(this.maxFrameTime).toFixed(2) + ')';
    }
}
