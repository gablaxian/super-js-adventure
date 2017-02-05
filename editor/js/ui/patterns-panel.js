
'use strict';

UI.PatternsPanel = {
    init(patterns) {
        this._patterns  = _('.Patterns');
        this._marker    = _('.Patterns .marker');
        this.groups     = [];
        this.patterns   = [];

        for(var obj of patterns) {

            // create the pattern
            let pattern = Object.create(Pattern);
            pattern.init(obj.atlas, obj.data);
            pattern.render();

            this.patterns.push(pattern);

            // add the pattern to its atlas group
            if( !this.groups[obj.atlas] ) {
                this.groups[obj.atlas] = [];
            }
            this.groups[obj.atlas].push(pattern);
        }

        for(var group of this.groups) {
            if( !group ) {
                continue;
            }

            let _div = document.createElement('div');

            for(var pattern of group) {
                _div.appendChild(pattern.canvas);
            }

            this._patterns.appendChild(_div);
        }

        this._patterns.addEventListener('mousedown', this.selectPattern.bind(this));
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

        Viewport.updateGhostTile(pattern.atlas, pattern.data);

        this._marker.style.display   = 'block';
        this._marker.style.top       = clicked.offsetTop + 'px';
        this._marker.style.left      = clicked.offsetLeft + 'px';
        this._marker.style.width     = pattern.SCALED_WIDTH + 'px';
        this._marker.style.height    = pattern.SCALED_HEIGHT + 'px';
    }
}
