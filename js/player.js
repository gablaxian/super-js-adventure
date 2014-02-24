
var Player = {

    init: function(x, y) {
        this.image      = new Image();
        this.image.src  = 'images/link.png';

        this.x = 100;
        this.y = 100;

        this.facing = 2; // 0=up,1=right,2=down,3=left

        this.sequences = {

        }
    },

    render: function() {
        //
    }
}