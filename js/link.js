
'use strict';

const Link = {

    init(x, y) {
        this.img        = Game.spritesheets['link'].img;

        this.x          = x;
        this.y          = y;

        this.width      = 17;
        this.height     = 25;

        this.speed      = 1;

        this.fps                    = 30;
        this.animationUpdateTime    = (1000 / this.fps);
        this.timeSinceLastFrameSwap = 0;

        this.sequences = {
            'stand-down':   [3],
            'stand-up':     [10],
            'stand-right':  [17],
            'stand-left':   [24],

            'walk-down':    [3,4,5,6,5,4,3,2,1,0,1,2],
            'walk-up':      [10,11,12,13,12,11,10,9,8,7,8,9],
            'walk-right':   [17,18,19,20,19,18,17,16,15,14,15,16],
            'walk-left':    [24,25,26,27,26,25,24,23,22,21,22,23]
        }

        this.sequenceIdx    = 0;
        this.moving         = false;
        this.facing         = 'down';

        return this;
    },

    moveUp() {
        this.moving = true;
        this.facing = 'up';
        this.y      -= this.speed;
    },

    moveDown() {
        this.moving = true;
        this.facing = 'down';
        this.y      += this.speed;
    },

    moveLeft() {
        this.moving = true;
        this.facing = 'left';
        this.x      -= this.speed;
    },

    moveRight() {
        this.moving = true;
        this.facing = 'right';
        this.x      += this.speed;
    },

    attack() {},

    update(elapsed) {
        this.timeSinceLastFrameSwap += elapsed;
        this.moving = false;

        if( Game.state !== GAME_STATE.LOADING ) {
            if( Input.isPressed('left') ) {
                this.moveLeft();
            }
            if( Input.isPressed('right') ) {
                this.moveRight();
            }
            if( Input.isPressed('up') ) {
                this.moveUp();
            }
            if( Input.isPressed('down') ) {
                this.moveDown();
            }
            if( Input.isPressed('attack') ) {
                this.attack();
            }
        }

        //
        if( this.timeSinceLastFrameSwap > this.animationUpdateTime ) {

            var seq = (this.moving ? 'walk-' : 'stand-') + this.facing;

            var currentSequence = this.sequences[seq];

            if( this.sequenceIdx < currentSequence.length - 1 )
                this.sequenceIdx += 1;
            else
                this.sequenceIdx = 0;

            var col = currentSequence[this.sequenceIdx] % 7;
            var row = Math.floor( currentSequence[this.sequenceIdx] / 7 );

            this.offsetX = col * this.width;
            this.offsetY = row * this.height;

            this.timeSinceLastFrameSwap = 0;
        }
    },

    //
    draw() {
        Game.context.drawImage(this.img, this.offsetX, this.offsetY, this.width, this.height, this.x, this.y, this.width, this.height);
    }
}
