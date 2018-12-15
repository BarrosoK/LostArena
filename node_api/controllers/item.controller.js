const { Item } = require('../models');
const characterService = require('../services/character.service');
const { to, ReE, ReS } = require('../services/util.service');
const fs = require('fs');

/* POST */
const create = async function(req, res){
    res.setHeader('Content-Type', 'application/json');
    return ReS(res, {message:'fdp'});
    const body = req.body;
    if (!body.itemId) {
        return ReE(res, 'Pleaser enter a item id');
    } else {
        let err, character;

        [err, character] = await to (characterService.addItemToCharacter(body.characterId, body.itemId));

        if (err) return ReE(res, err, 422);
        return ReS(res, {message:'Successfully created a new character', character: character.toJSON()});
    }
};
module.exports.create = create;

/* GET */
export const get = async function(req, res){
    let rawdata = fs.readFileSync('./models/items/items.json');
    let items = JSON.parse(rawdata);
    return ReS(res, {items: items});
};
