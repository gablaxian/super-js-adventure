
'use strict';

/**
 * Assets
 */
const ASSETS = {

    images: [
        { id: 'link', url: 'images/link.png' },
    ],

    audio: [
        // { id: '', url: '' },
    ]
};

/*
 * Text
 */
const MESSAGES = {
    wise_man:       'It’s dangerous to go alone! Take this.',
    shopkeeper:     '',
};

/*
 * Entity definitions
 */
const ENTITY_CFG = {
    ENTRANCE:       {                               sx: 0,  sy: 0,  w: 16, h: 1  }, // entrances are just triggers. They just link up to tiles already placed via the editor.
    BUSH1:          { tileset: 'overworld-terrain', sx: 48, sy: 48, w: 16, h: 16 },
    GRASS:          { tileset: 'overworld-terrain', sx: 16, sy: 64, w: 16, h: 16 },
    TREE:           { tileset: 'overworld-flora',   sx: 0,  sy: 80, w: 40, h: 40 },
};

/*
 * Entities
 */
const ENTITIES = [
    { id: 'entrance1', type: 'entrance', mapID: 'overworld', roomID: [7,7], x: 80, y: 24, visible: false },
    { id: 'entrance2', type: 'entrance', mapID: 'cave1',     roomID: [0,0], x: (ROOM_WIDTH/2)-8, y: ROOM_HEIGHT-10, visible: false },
];
