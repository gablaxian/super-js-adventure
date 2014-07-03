
function _(elm) { return document.querySelector(elm); }

(function() {
    function __(elm) {
        var elms    = document.querySelectorAll(elm),
            nodes   = Array.prototype.slice.call(elms);

        this.css = function() {
            if(arguments.length == 2) {
                for (var i = 0; i < elms.length; i++) {
                    elms[i].style[arguments[0]] = arguments[1];
                };
            }
            else if(typeof arguments == 'object') {
                var obj = arguments[0];
                for (var i = 0; i < elms.length; i++) {
                    for(var a in obj) {
                        elms[i].style[a] = obj[a];
                    } 
                };
            }
        }

        this.each = function(callback) {
            for(var i = elms.length; i--;) {
                callback.call(elms[i]);
            }
        }

        return this;
    }
    
    window.__ = __;    
})();