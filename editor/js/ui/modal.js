
'use strict';

UI.Modal = {
    _overlay        : _('.Overlay'),
    _modal          : _('.Modal'),
    _modalContent   : _('.Modal-content'),
    _modalFooter    : _('.Modal-footer'),
    _close          : _('.Modal-close'),

    show(content) {
        this._overlay.style.display     = 'block';
        this._modal.style.display       = 'block';
        this._modalContent.innerHTML    = '<pre><code>' + content + '</code></pre>';

        this._close.addEventListener('click', () => this.hide());
    },

    hide() {
        this._overlay.style.display     = 'none';
        this._modal.style.display       = 'none';
    }
}
