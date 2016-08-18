
'use strict';

UI.EntitiesPanel = {
    init(entities) {
        this._entities  = _('.EntitiesPanel-container');
        this._marker    = _('.EntitiesPanel .marker');
        this.entities   = [];
        this.scaleValue = Global.scale;

        for (var obj of entities) {

            // create the entity
            let entity = Object.create(Entity);
            entity.init(obj.id, obj.atlus, obj.data);

            // setup a canvas per entity to display it in the sidebar
            let canvas      = document.createElement('canvas');
            let context     = canvas.getContext('2d');

            canvas.width    = entity.WIDTH;
            canvas.height   = entity.HEIGHT;

            canvas.style['width']  = entity.WIDTH * this.scaleValue + 'px';
            canvas.style['height'] = entity.HEIGHT * this.scaleValue + 'px';

            entity.render(context);

            this.entities.push(entity);
            this._entities.appendChild(canvas);
        }

        this._entities.addEventListener('mousedown', this.selectEntity.bind(this));
    },

    selectEntity(e) {
        let clicked     = e.target;
        let idx         = 0;
        let entities    = this._entities.querySelectorAll('canvas');

        if( clicked.nodeName == 'CANVAS' ) {
            for (var canvas of entities) {
                if( canvas === clicked ) {
                    break;
                }
                idx++;
            }
        }

        console.log(idx);

        let entity = this.entities[idx];

        UI.toPlace          = 'entity';
        UI.selectedEntity   = entity;

        this._marker.style.display   = 'block';
        this._marker.style.top       = clicked.offsetTop + 'px';
        this._marker.style.left      = clicked.offsetLeft + 'px';
        this._marker.style.width     = entity.WIDTH * this.scaleValue + 'px';
        this._marker.style.height    = entity.HEIGHT * this.scaleValue + 'px';
    }
}
