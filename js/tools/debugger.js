
'use strict';

const Debugger = {

    init() {
        this.elm = document.querySelector('#debugger');
        this.elm.style.display = 'block';

        this.watchers = [];

        this.addWatcher('playerX1');
        this.addWatcher('playerX2');
        this.addWatcher('playerY1');
        this.addWatcher('playerY2');
        this.addBreak();
        // this.addListener('Collision bounds');

        setInterval(this.update.bind(this), 40); // 25fps
    },

    addListener(name) {
        let div     = document.createElement('div');
        let label   = document.createElement('label');
        let input   = document.createElement('input');

        label.appendChild( document.createTextNode(name.toUpperCase()) );
        input.setAttribute('type', 'checkbox');
        input.setAttribute('class', name.toLowerCase().replace(' ', '-'));

        div.appendChild(label);
        div.appendChild(input);

        input.addEventListener('click', e => this.handle(e));

        this.elm.appendChild(div);
    },

    addWatcher(name) {
        let div     = document.createElement('div');
        let label   = document.createElement('label');
        let span    = document.createElement('span');

        label.appendChild( document.createTextNode(name.toUpperCase()) );

        div.appendChild(label);
        div.appendChild(span);

        this.elm.appendChild(div);

        this.watchers[name] = span;
    },

    addBreak() {
        let hr = document.createElement('hr');
        this.elm.appendChild(hr);
    },

    //
    handle(e) {
        // if( e.target.getAttribute('class') == 'collision-bounds') {}
    },

    //
    update() {
        this.watchers['playerX1'].innerHTML = Link.getCollisionRect().x1;
        this.watchers['playerX2'].innerHTML = Link.getCollisionRect().x2;
        this.watchers['playerY1'].innerHTML = Link.getCollisionRect().y1;
        this.watchers['playerY2'].innerHTML = Link.getCollisionRect().y2;
    }

};

if( DEBUG ) Debugger.init();
