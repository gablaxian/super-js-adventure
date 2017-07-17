
'use strict';

/**
 * game constants
 */
const DEBUG             = true;

const SCREEN_WIDTH      = 256;
const SCREEN_HEIGHT     = 224;

const ROOM_WIDTH        = 256;
const ROOM_HEIGHT       = 176;

const TILE_SIZE         = 8;
const TILE_FPS          = 7;
const TILE_UPDATE_TIME  = 1000 / TILE_FPS;

const NUM_TILES_WIDE    = ROOM_WIDTH    / TILE_SIZE;
const NUM_TILES_HIGH    = ROOM_HEIGHT   / TILE_SIZE; // we want the HUD space at the top
const HUD_HEIGHT        = 6 * TILE_SIZE;

//
const DIR = {
    UP:         0,
    UPRIGHT:    1,
    RIGHT:      2,
    DOWNRIGHT:  3,
    DOWN:       4,
    DOWNLEFT:   5,
    LEFT:       6,
    UPLEFT:     7
};
const GAME_STATE = {
    PAUSED:     1,
    BOOTING:    2,
    START:      3,
    LOADING:    4,
    PLAYING:    5,
    LOSING:     6,
    QUITTING:   7,
    WINNING:    8
};
const ENEMY_STATE = {
    THINKING:   1,
    TRAVELLING: 2,
    ATTACKING:  3,
    HURT:       4,
    DYING:      5,
    DEAD:       6
};
const KEYS = {
    LEFT:       'LEFT',
    UP:         'UP',
    DOWN:       'DOWN',
    RIGHT:      'RIGHT',
    START:      'ENTER',
    SELECT:     'SHIFT',
    ATTACK:     'A',
    ITEM:       'S'
};
