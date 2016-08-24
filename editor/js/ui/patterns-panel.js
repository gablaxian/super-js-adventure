
'use strict';

UI.PatternsPanel = {
    init(patterns) {
        this._patterns  = _('.Patterns');
        this._marker    = _('.Patterns .marker');
        this.patterns   = [];

        for(var obj of patterns) {

            let pattern = Object.create(Pattern);
            let _div    = document.createElement('div');

            pattern.init(obj.atlus, obj.data);
            pattern.render();

            this.patterns.push(pattern);
            _div.appendChild(pattern.canvas);
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

        this._marker.style.display   = 'block';
        this._marker.style.top       = clicked.offsetTop + 'px';
        this._marker.style.left      = clicked.offsetLeft + 'px';
        this._marker.style.width     = pattern.SCALED_WIDTH + 'px';
        this._marker.style.height    = pattern.SCALED_HEIGHT + 'px';
    }
}
