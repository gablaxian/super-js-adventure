
'use strict';

let Viewport = {

    init(maps) {

        // elements
        this._viewport      = _('.Viewport');

        //
        this.width          = 0;
        this.height         = 0;

        // maps
        this.currentMap     = null;

        // grids
        this.grids          = [];

        // states
        this.mouseX         = 0;
        this.mouseY         = 0;
        this.isDragging     = false;

        // setup grids
        for(var gridConfig of config.grids) {
            let grid = Object.create(Grid);
            grid.init(0, 0, gridConfig[0], gridConfig[1]);

            this.grids.push(grid);
        }


        // set the current map to the first map
        // setup the map's visual properties
        let mapIdx = localStorage.getItem('selectedMap') || 0;
        this.setupMap(Global.world.maps[mapIdx]);


        // add layers
        for (var layer of this.currentMap.layers) {
            this._viewport.appendChild(layer.canvas);
        }

        for (var grid of this.grids) {
            this._viewport.appendChild(grid.canvas);
        }

        // ghost tile
        this.createGhostTile();

        // events
        this.setupEvents();

        return Promise.resolve();
    },

    setupMap(map) {
        this.currentMap = map;
        this.currentMap.setup();

        for(var grid of this.grids) {
            grid.resize(this.currentMap.getWidthInPx(), this.currentMap.getHeightInPx());
        }

        this.scale(Global.scale);
        this.center();
        this.render();
    },

    setupEvents() {
        this._viewport.addEventListener('mouseup',   e => {
            this.isDragging = false;
        });

        this._viewport.addEventListener('mousedown', e => {
            this.isDragging = true;

            if( UI.deleteMode ) {
                this.deleteTile();
                return;
            }

            if( UI.toPlace == 'tile' ) {
                this.placeTile();
            }
            else if( UI.toPlace == 'pattern' ) {
                this.placePattern();
            }
            else if( UI.toPlace == 'collision' ) {
                this.placeCollision();
            }
            else if( UI.toPlace == 'entity' ) {
                this.placeEntity();
            }
        });

        this._viewport.addEventListener('mousemove', e => {
            this.mouseX = e.offsetX;
            this.mouseY = e.offsetY;

            this.moveGhostTile();

            if( this.isDragging ) {

                if( UI.deleteMode ) {
                    this.deleteTile();
                    return;
                }

                if( UI.toPlace == 'tile' ) {
                    this.placeTile();
                }
                else if( UI.toPlace == 'pattern' ) {
                    this.placePattern();
                }
                else if( UI.toPlace == 'collision' ) {
                    this.placeCollision();
                }
                else if( UI.toPlace == 'entity' ) {
                    this.placeEntity();
                }
            }
        });

        Eventer.on('selectMap',     idx => { this.setupMap(Global.world.maps[idx]); });
        Eventer.on('selectLayer',   () => this.currentMap.selectedLayer = UI.selectedLayer );
        Eventer.on('toggleLayer',   (idx, checked) => {
            if( checked ) {
                this.currentMap.layers[idx].show();
            }
            else {
                this.currentMap.layers[idx].hide();
            }
        });
    },

    scale(scale) {
        this._scale = scale;

        this.currentMap.scale(scale);
        for (var grid of this.grids) {
            grid.scale(scale);
            grid.render();
        }

        this._viewport.style['width']    = (this.currentMap.getWidthInPx() * scale) + 'px';
        this._viewport.style['height']   = (this.currentMap.getHeightInPx() * scale) + 'px';
    },

    center() {
        let top         = '';
        let left        = '';
        let transform   = '';
        let _screen     = _('.Screen');

        const containerWidth  = parseInt(window.getComputedStyle( _screen ).width);
        const containerHeight = parseInt(window.getComputedStyle( _screen ).height);

        if( (this.currentMap.getWidthInPx() * this._scale) < containerWidth ) {
            left        = '50%';
            transform   += 'translateX(-50%)';
        }

        if( (this.currentMap.getHeightInPx() * this._scale) < containerHeight ) {
            top         = '50%';
            transform   += 'translateY(-50%)';
        }

        this._viewport.style['top']         = top;
        this._viewport.style['left']        = left;
        this._viewport.style['transform']   = transform;
    },

    deleteTile() {
        const clickedX  = (this.mouseX / this._scale);
        const clickedY  = (this.mouseY / this._scale);
        const cell      = this.currentMap.pxToCell(clickedX, clickedY);

        this.currentMap.addTile(cell, null);
        this.currentMap.renderTile(cell);

        Eventer.dispatch('addTile');
    },

    placeTile() {
        const clickedX  = (this.mouseX / this._scale);
        const clickedY  = (this.mouseY / this._scale);
        const cell      = this.currentMap.pxToCell(clickedX, clickedY);

        this.currentMap.addTile(cell, UI.selectedTile);
        this.currentMap.renderTile(cell);

        Eventer.dispatch('addTile');
    },

    placePattern(pattern) {
        const clickedX  = (this.mouseX / this._scale);
        const clickedY  = (this.mouseY / this._scale);
        const cell      = this.currentMap.pxToCell(clickedX, clickedY);

        this.currentMap.addPattern(cell, UI.selectedPattern);

        Eventer.dispatch('addPattern');
    },

    placeCollision() {
        // too much code repetition.
        const clickedX  = (this.mouseX / this._scale);
        const clickedY  = (this.mouseY / this._scale);
        const cell      = this.currentMap.pxToCell(clickedX, clickedY);

        this.currentMap.addCollision(cell, UI.selectedCollision);
        this.currentMap.renderCollisionTile(cell);

        Eventer.dispatch('addCollision');
    },

    placeEntity() {
        // too much code repetition.
        const clickedX  = (this.mouseX / this._scale);
        const clickedY  = (this.mouseY / this._scale);
        const cell      = this.currentMap.pxToCell(clickedX, clickedY);

        let {x, y} = this.currentMap.cellToPx(cell);

        // clone the entity
        let newEntity = Object.create(UI.selectedEntity);
        newEntity.x = x;
        newEntity.y = y;

        console.log(newEntity.x, newEntity.y);

        this.currentMap.addEntity(x, y, newEntity);
        this.currentMap.renderEntity(newEntity);

        Eventer.dispatch('addEntity');
    },

    createGhostTile() {
        this.ghostTile  = document.createElement('canvas');
        let context     = this.ghostTile.getContext('2d');

        this.ghostTile.width    = 8 * Global.scale;
        this.ghostTile.height   = 8 * Global.scale;

        this.ghostTile.style.opacity        = '0.6';
        this.ghostTile.style.pointerEvents  = 'none';

        // context.fillStyle = 'rgba(30,30,30)';
        // context.fillRect(0, 0, 8 * Global.scale, 8 * Global.scale);

        console.log('ghost tile created');

        this._viewport.appendChild(this.ghostTile);
    },

    updateGhostTile(atlas, tiles) {
        let newPattern  = Object.create(Pattern);

        console.log(atlas, tiles);
        newPattern.init(atlas, tiles);
        newPattern.render();

        let context = this.ghostTile.getContext('2d');

        this.ghostTile.width    = newPattern.WIDTH * Global.scale;
        this.ghostTile.height   = newPattern.HEIGHT * Global.scale;

        context.clearRect(0, 0, this.ghostTile.width, this.ghostTile.height)
        context.drawImage(newPattern.canvas, 0, 0, newPattern.WIDTH * Global.scale, newPattern.HEIGHT * Global.scale);
    },

    moveGhostTile() {
        // console.log(this.mouseX);
        let tile_size = (Global.TILE_SIZE * Global.scale);
        let x = Math.floor( this.mouseX / tile_size ) * tile_size;
        let y = Math.floor( this.mouseY / tile_size ) * tile_size;

        this.ghostTile.style.transform = 'translate3d('+x+'px, '+y+'px, 0)';
    },

    render() {
        let startTime = window.performance.now();

        this.currentMap.render();
        for (var grid of this.grids) {
            grid.render();
        }

        let endTime = window.performance.now();

        console.log( 'map render time: ' + (endTime - startTime) + 'ms' );
    }

}
