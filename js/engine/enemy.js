
'use strict';

const Enemy = {

    init(type='', x, y) {
        this.type           = type;
        this.img            = Game.spritesheets['enemies'].img;

        //
        this.posX           = x;
        this.posY           = y;
        this.width          = 8;
        this.height         = 8;

        // these will be set once we start drawing the sprites
        this.spriteX        = 0;
        this.spriteY        = 0;
        this.spriteWidth    = 0;
        this.spriteHeight   = 0;

        //
        this.speed          = 0;
        this.health         = 0;
        this.damage         = 0;

        this.state          = ENEMY_STATE.TRAVELLING;
        this.visible        = true;

        return this;
    },

    spawn(type='', x=0, y=0) {

        if( x == 0 ) {
            x = Math.round( Math.random() * ROOM_WIDTH );
            y = Math.round( Math.random() * ROOM_HEIGHT );

            // check that the cell/s can be occupied
        }

        this.init(type, x, y);
    },

    /***********************************
     *
     **********************************/

    think() {
        this.state = ENEMY_STATE.THINKING;
    },

    decide() {
        //
    },

    attack() {
        if( this.state == ENEMY_STATE.ATTACKING )
            return; // have to wait until an attack plays out.

        this.state = ENEMY_STATE.ATTACKING;
    },

    hurt() {
        if( (this.health -= Game.player.damage) <= 0 ) {
            this.kill();
            return;
        }

        this.state = ENEMY_STATE.HURT;
    },

    kill() {
        this.state = ENEMY_STATE.DYING;
    },

    die() {
        this.state = ENEMY_STATE.DEAD;
    },

    update(elapsed) {
        //
    },

    render(context) {

        if( DEBUG ) {
            // draw floorspace rectangle
            context.fillStyle = 'rgba(128,0,0,0.5)';
            context.fillRect( this.posX, this.posY, this.width, this.height );
        }

        // use the spriteX/Y values as relative values.
        let x = (this.getCenterPoint().x - (this.spriteWidth/2)) + this.spriteX;
        let y = (this.getCenterPoint().y - this.spriteHeight) + this.spriteY;

        context.drawImage(this.img, this.offsetX, this.offsetY, this.spriteWidth, this.spriteHeight, x, y, this.spriteWidth, this.spriteHeight);
    }

};
