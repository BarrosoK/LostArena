import {rawMonsters} from "./characters.controller";
const { Item, Character } = require('../models');
const characterService = require('../services/character.service');
const { to, ReE, ReS } = require('../services/util.service');
const fs = require('fs');

/* GET */
export const get = async function(req, res){
    let monsters = JSON.parse(rawMonsters);
    return ReS(res, {monsters});
};
