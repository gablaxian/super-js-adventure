
'use strict';

const Link = {

    init(x, y) {
        this.img            = Game.spritesheets['link'].img;

        this.x              = x;
        this.y              = y;

        this.width          = 17;
        this.height         = 25;

        this.speed          = 1.5;
        this.diagonalSpeed  = (2*this.speed/3); // two thirds of normal speed.

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
        this.dir            = DIR.DOWN;

        return this;
    },

    /***********************************
     *
     **********************************/

    getCenterPoint() {
        return {
            x: this.posX + (this.width/2),
            y: this.posY + (this.depth/2)
        }
    },

    setX(x) {
        this.posX = x;
    },

    setY(y) {
        this.posY = y;
    },

    getCollisionRect() {
        return {
            x1: this.x,
            x2: this.x + this.width - 1,
            y1: this.y + 9,
            y2: this.y + (this.height - 1),
        }
    },

    attack() {},

    update(elapsed) {
        this.timeSinceLastFrameSwap += elapsed;
        this.moving = false;

        if( Game.state === GAME_STATE.PLAYING ) {
            if( Input.isPressed('up') || Input.isPressed('down') || Input.isPressed('left') || Input.isPressed('right') ) {
                this.moving = true;
            }

            if( Input.isPressed('up') && Input.isPressed('left') ) {
                this.facing = 'up';
                this.dir    = DIR.UPLEFT;
                this.y      -= this.diagonalSpeed;
                this.x      -= this.diagonalSpeed;
            }
            else if( Input.isPressed('up') && Input.isPressed('right') ) {
                this.facing = 'up';
                this.dir    = DIR.UPRIGHT;
                this.y      -= this.diagonalSpeed;
                this.x      += this.diagonalSpeed;
            }
            else if( Input.isPressed('down') && Input.isPressed('left') ) {
                this.facing = 'down';
                this.dir    = DIR.DOWNLEFT;
                this.y      += this.diagonalSpeed;
                this.x      -= this.diagonalSpeed;
            }
            else if( Input.isPressed('down') && Input.isPressed('right') ) {
                this.facing = 'down';
                this.dir    = DIR.DOWNRIGHT;
                this.y      += this.diagonalSpeed;
                this.x      += this.diagonalSpeed;
            }
            else if( Input.isPressed('up') ) {
                this.facing = 'up';
                this.dir    = DIR.UP;
                this.y      -= this.speed;
            }
            else if( Input.isPressed('down') ) {
                this.facing = 'down';
                this.dir    = DIR.DOWN;
                this.y      += this.speed;
            }
            else if( Input.isPressed('left') ) {
                this.facing = 'left';
                this.dir    = DIR.LEFT;
                this.x      -= this.speed;
            }
            else if( Input.isPressed('right') ) {
                this.facing = 'right';
                this.dir    = DIR.RIGHT;
                this.x      += this.speed;
            }
            else {
                // correct the positions to the nearest round number
                this.x = this.x|0;
                this.y = this.y|0;
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
    draw(context) {
        context.drawImage(this.img, this.offsetX, this.offsetY, this.width, this.height, this.x|0, this.y|0, this.width, this.height);

        if( DEBUG ) {
            let rect = this.getCollisionRect();

            context.fillStyle   = 'rgba(255,0,0,0.5)';
            context.strokeStyle = 'rgba(255,0,0,0.9)';
            context.fillRect( rect.x1, rect.y1, rect.x2 - rect.x1, rect.y2 - rect.y1 );
            context.strokeRect( rect.x1 + 0.5 , rect.y1 + 0.5, rect.x2 - rect.x1 - 1, rect.y2 - rect.y1 - 1 );
        }
    }
}
