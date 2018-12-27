const { Item, Character } = require('../models');
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
        return ReS(res, {message:'Successfully created a new character', item: character.toJSON()});
    }
};
module.exports.create = create;

/* GET */
export const get = async function(req, res){
    let rawdata = fs.readFileSync('./models/items/items.json');
    let items = JSON.parse(rawdata);
    return ReS(res, {items: items});
};

const isMyCharItem = function(req, charId, itemId) {
    let character = req.user.characters.filter((char) => {
        return char._id.toString() === charId;
    });

    if (character.length <= 0) {
        return false;
    } else {
        character = character[0];
        let item = character.items.filter(i => {
            return i._id.toString() === itemId;
        });
        return item;
    }
}

export const deleteItem =  async (req, res) => {
    const character_id = req.body.characterId;
    const item_id = req.body.itemId;

    if (!isMyCharItem(req, character_id, item_id)) {
        return ReE(res, {message: 'Not authorized'});
    }
    let err, r, c;
    [err, r] = await to(Item.deleteOne({_id: item_id}));
    [err, c] = await to(Character.findOne({_id: character_id}));
    return ReS(res, {message: 'Deleted', character: c});
};
