
'use strict';

let Projectile = {

    init(x=0, y=0, dir='left') {
        this.img        = '';
        this.x          = x;
        this.y          = y;
        this.width      = 0;
        this.height     = 0;

        //
        this.state      = 1;
        this.speed      = 1;
        this.dir        = dir;

        //
        this.offsetX    = 0;
        this.offsetY    = 0;
    },

    getX() {
        return this.x;
    },

    getY() {
        return this.y;
    },

    destroy() {
        this.state = 0;
    },

    isDead() {
        return this.state == 0;
    },

    update(elapsed) {
        if( this.dir == 'left' )  {
            this.x -= this.speed;
        }
        else {
            this.x += this.speed;
        }
    },

    draw(context) {
        context.drawImage(this.img, this.offsetX, this.offsetY, this.width, this.height, this.x, this.y, this.width, this.height);
    }
}
