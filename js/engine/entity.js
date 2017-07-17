
'use strict';

const Entity = {

    init(type='', x=0, y=0) {
        this.id             = null;
        this.type           = type;

        this.posX           = x;
        this.posY           = y;

        let entityData = ENTITY_CFG[type.toUpperCase()];

        this.tileset        = entityData.tileset ? Utils.getTileset(entityData.tileset) : null;
        this.sx             = entityData.sx;
        this.sy             = entityData.sy;
        this.width          = entityData.w;
        this.height         = entityData.h;

        this.health         = 0;
        this.damage         = 0;

        this.isDestructible = false;
        this.isCollidable   = false;
        this.isVisible      = true;

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

    getX() {
        return this.getCenterPoint().x;
    },

    getY() {
        return this.getCenterPoint().y;
    },

    setX(x) {
        this.posX = x;
    },

    setY(y) {
        this.posY = y;
    },

    getCollisionRect() {
        return {
            x1: this.posX,
            y1: this.posY,
            x2: this.posX + this.width,
            y2: this.posY + this.height
        }
    },

    update() {
        //
    },

    render(context) {
        if( this.tileset !== null && this.isVisible ) {
            context.drawImage(this.tileset.img, this.sx, this.sy, this.width, this.height, this.posX, this.posY, this.width, this.height);
        }

        if (DEBUG) {
            if( this.tileset === null ) {
                context.fillStyle = '#f00';
                context.fillRect(this.posX, this.posY, this.width, 2);
            }
        }
    }

}
