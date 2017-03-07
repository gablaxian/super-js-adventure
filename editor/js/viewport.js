
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
        for(var gridConfig of CONFIG.grids) {
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
        this._viewport.addEventListener('mouseup', e => {
            this.isDragging = false;
        });

        this._viewport.addEventListener('mousedown', e => {
            this.isDragging = true;

            if( UI.deleteMode ) {
                this.deleteTile();
                return;
            }

            switch (UI.toPlace) {
                case 'pattern':
                    this.placePattern();
                    break;
                case 'collision':
                    this.placeCollision();
                    break;
                case 'entity':
                    this.placeEntity();
                    break;
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

                switch (UI.toPlace) {
                    case 'pattern':
                        this.placePattern();
                        break;
                    case 'collision':
                        this.placeCollision();
                        break;
                    case 'entity':
                        this.placeEntity();
                        break;
                }
            }
        });

        Eventer.on('selectMap', idx => {
            this.setupMap(Global.world.maps[idx]);
        });
        Eventer.on('selectLayer', idx => {
            this.currentMap.selectedLayer = UI.selectedLayer;
        });
        Eventer.on('toggleLayer', (idx, checked) => {
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
        for(var grid of this.grids) {
            grid.scale(scale);
            grid.render();
        }

        this._viewport.style['width'] = (this.currentMap.getWidthInPx() * scale) + 'px';
        this._viewport.style['height'] = (this.currentMap.getHeightInPx() * scale) + 'px';
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

    //--------------------------------------------------------------------

    deleteTile() {
        const clickedX  = (this.mouseX / this._scale);
        const clickedY  = (this.mouseY / this._scale);
        const cell      = this.currentMap.pxToCell(clickedX, clickedY);

        if( this.currentMap.layers[UI.selectedLayer].name == 'entities' ) {
            this.currentMap.layers[UI.selectedLayer].deleteEntityByPosition(clickedX, clickedY);
            this.currentMap.layers[UI.selectedLayer].render();
        } else {
            this.currentMap.addTile(cell, null);
            this.currentMap.renderTile(cell);
        }


        Eventer.dispatch('deleteTile');
    },

    //--------------------------------------------------------------------

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

        this.currentMap.addEntity(UI.selectedEntity, x, y);
        this.currentMap.renderEntity();

        Eventer.dispatch('addEntity');
    },

    //--------------------------------------------------------------------

    createGhostTile() {
        this.ghostTile  = document.createElement('canvas');
        let context     = this.ghostTile.getContext('2d');

        this.ghostTile.width    = 8 * Global.scale;
        this.ghostTile.height   = 8 * Global.scale;

        this.ghostTile.style.opacity        = '0.6';
        this.ghostTile.style.pointerEvents  = 'none';

        console.log('ghost tile created');

        this._viewport.appendChild(this.ghostTile);
    },

    updateGhostTile(tileset, tiles) {
        let context = this.ghostTile.getContext('2d');

        if( UI.toPlace == 'collision' ) {
            let cTile = Global.collisionTiles[UI.selectedCollision];

            this.ghostTile.width    = cTile.width * Global.scale;
            this.ghostTile.height   = cTile.height * Global.scale;

            context.clearRect(0, 0, this.ghostTile.width, this.ghostTile.height)
            context.drawImage(cTile, 0, 0, cTile.width * Global.scale, cTile.height * Global.scale);
        }
        else {
            let newPattern  = Object.create(Pattern);

            newPattern.init(tileset, tiles);
            newPattern.render();

            this.ghostTile.width    = newPattern.WIDTH * Global.scale;
            this.ghostTile.height   = newPattern.HEIGHT * Global.scale;

            context.clearRect(0, 0, this.ghostTile.width, this.ghostTile.height)
            context.drawImage(newPattern.canvas, 0, 0, newPattern.WIDTH * Global.scale, newPattern.HEIGHT * Global.scale);
        }

        this.ghostTile.style.display = 'block';
    },

    moveGhostTile() {
        // console.log(this.mouseX);
        let tile_size = (Global.TILE_SIZE * Global.scale);
        let x = Math.floor( this.mouseX / tile_size ) * tile_size;
        let y = Math.floor( this.mouseY / tile_size ) * tile_size;

        this.ghostTile.style.transform = 'translate3d('+x+'px, '+y+'px, 0)';
    },

    //--------------------------------------------------------------------

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
