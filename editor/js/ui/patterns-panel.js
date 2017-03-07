
'use strict';

UI.PatternsPanel = {

    init(patterns) {
        this.container  = _('.Patterns');
        this.marker     = Object.create(Marker).init();

        this.groups     = [];
        this.patterns   = [];

        // add marker
        this.container.appendChild(this.marker.elm);

        for(var item of patterns) {

            // create the pattern
            let pattern = Object.create(Pattern).init(item.tileset, item.data);
            pattern.render();

            this.patterns.push(pattern);

            // add the pattern to its tileset group
            if( !this.groups[item.tileset] ) {
                this.groups[item.tileset] = [];
            }
            this.groups[item.tileset].push(pattern);
        }

        for(var group in this.groups) {
            if( !group ) {
                continue;
            }

            let _div = document.createElement('div');

            for(var pattern of this.groups[group]) {
                _div.appendChild(pattern.canvas);
            }

            this.container.appendChild(_div);
        }

        this.container.addEventListener('mousedown', this.selectPattern.bind(this));
    },

    selectPattern(e) {
        let clicked = e.target;
        let idx     = 0;

        if( clicked.nodeName == 'CANVAS' ) {
            for (var node of this.patterns) {
                if( node.canvas === clicked ) {
                    break;
                }
                idx++;
            }
        }

        let pattern = this.patterns[idx];

        UI.toPlace          = 'pattern';
        UI.selectedPattern  = pattern;

        Viewport.updateGhostTile(pattern.sprite.name, pattern.data);

        UI.deselectAll();

        this.marker.render(clicked.offsetTop, clicked.offsetLeft, pattern.WIDTH, pattern.HEIGHT);
        this.marker.show();

        Eventer.dispatch('patternSelected');
    },

    deselect() {
        this.marker.hide();
    }
}
