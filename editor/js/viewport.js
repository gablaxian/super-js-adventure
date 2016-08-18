
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
        this.grid           = null;

        // states
        this.mouseX         = 0;
        this.mouseY         = 0;
        this.isDragging     = false;

        // setup grids
        this.grid = Object.create(Grid);
        this.grid.init(0, 0, 8, 8);


        // set the current map to the first map
        // setup the map's visual properties
        this.setupMap(Global.world.maps[0]);


        // add layers
        for (var layer of this.currentMap.layers) {
            this._viewport.appendChild(layer.canvas);
        }

        this._viewport.appendChild(this.grid.canvas);

        // events
        this.setupEvents();

        return Promise.resolve();
    },

    setupMap(map) {
        this.currentMap = map;
        this.currentMap.setup();

        this.grid.resize(this.currentMap.getWidthInPx(), this.currentMap.getHeightInPx());

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

            if( this.isDragging ) {
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

        Eventer.on('selectMap', (idx) => {
            this.setupMap(Global.world.maps[idx]);
        });
        Eventer.on('selectLayer', () => this.currentMap.selectedLayer = UI.selectedLayer );
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
        this.grid.scale(scale);

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

    placeTile() {
        // let gridCell = pxToCell( (e.clientX + _('.Screen').scrollLeft), (e.clientY + _('.Screen').scrollTop) );
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
        // this.currentMap.renderPattern(cell);

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

    render() {
        let startTime = window.performance.now();

        this.currentMap.render();
        this.grid.render();

        let endTime = window.performance.now();

        console.log( 'map render time: ' + (endTime - startTime) + 'ms' );
    }
}
