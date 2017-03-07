
// A set of useful functions.

let Utils = {

    getTilesetByName(name) {
        for(var tileset of Global.tilesetsArray) {
            if( tileset.name == name )
                return tileset;
        }
    }

}
