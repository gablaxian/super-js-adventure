
'use strict';

UI.EntitiesPanel = {

    init(entities) {
        this.container  = _('.EntitiesPanel-container');
        this.marker     = Object.create(Marker).init();
        this.scaleValue = Global.scale;

        for(var entity of Global.entityArray) {
            this.container.appendChild(entity.canvas);
        }

        // add marker
        this.container.appendChild(this.marker.elm);

        // events
        this.container.addEventListener('mousedown', e => this.selectEntity(e));
        this.container.addEventListener('mouseup', e => {
            Viewport.updateGhostTile(UI.selectedEntity.tilesetName, [UI.selectedEntity.startTileIdx, UI.selectedEntity.endTileIdx]);
        });
    },

    selectEntity(e) {
        let idx = UI.getIndex(this.container.querySelectorAll('canvas'), e.target);

        if( idx >= 0 ) {
            let entity  = Global.entityArray[idx];

            UI.toPlace          = 'entity';
            UI.selectedEntity   = entity;

            UI.deselectAll();

            this.marker.render(entity.canvas.offsetTop, entity.canvas.offsetLeft, entity.WIDTH, entity.HEIGHT);
            this.marker.show();
            Eventer.dispatch('patternSelected');
        }
        else {
            this.marker.hide();
        }
    },

    deselect() {
        this.marker.hide();
    }
}
