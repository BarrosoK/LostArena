const { Character, Item } = require('../models');
const characterService = require('../services/character.service');
const { to, ReE, ReS } = require('../services/util.service');


const isMyChar = function(req, charId) {
    let character = req.user.characters.filter((char) => {
        return char._id.toString() === charId;
    });

    if (character.length <= 0) {
        return false;
    } else {
        character = character[0];
        return character;
    }
}
module.exports.isMyChar = isMyChar;

/* POST */
const create = async function(req, res){
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if (!body.name) {
        return ReE(res, 'Pleaser en a name to register.');
    } else {
        let err, item;

        [err, item] = await to (characterService.createCharacter(body, req.user));

        if (err) return ReE(res, err, 422);
        return ReS(res, {message:'Successfully bought a item !', item: item.toWeb()});
    }
};
module.exports.create = create;

/* GET */
const get = async function(req, res){
    res.setHeader('Content-Type', 'application/json');
    let characters = req.user.characters;
    return ReS(res, {characters:characters, amount:characters.length});
};
module.exports.get = get;

/* PUT */
const update = async function(req, res){
    let err, character, character_id, result;

    character_id = req.body._id;

    character = req.user.characters.filter((char) => {
        return char._id.toString() === character_id;
    });

    if (character.length <= 0) {
        return ReE(res, {message: 'Not authorized'});
    } else {
        character = character[0];
    }
    character.set(req.body);

    [err, result] = await to(Character.updateOne({_id:character_id}, character));
    if(err){
        return ReE(res, err);
    }
    return ReS(res, {updated: result.n, character: character});
};
module.exports.update = update;

/* DELETE */
const remove = async function(req, res){
    let err, character, character_id, result;

    character_id = req.body._id;

    if (!isMyChar(req, character_id)) {
        return ReE(res, {message: 'Not authorized'});
    }

    [err, result] = await to(Character.deleteOne({_id:character_id}));
    if(err){
        return ReE(res, err);
    }
    return ReS(res);
};
module.exports.remove = remove;

export const getItem = async (req, res) => {
    let items, err;

    [err, items] = await to(Item.find({character_id: req.params.id}));
    return ReS(res, {items:items});

};

/* POST */
/*
 *  itemId: id of the item to add
 *  characterId: id of the character to add the item
 */
const addItem = async function(req, res){
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if (!Object.keys('itemId')) {
        return ReE(res, 'Pleaser enter a item id');
    } else {
        let err, item;

        if (!isMyChar(req, body.characterId)) {
            return ReE(res, {message: 'Not authorized'});
        }

        [err, item] = await to (characterService.addItemToCharacter(body.characterId, body.itemId));

        if (err) return ReE(res, err, 422);
        return ReS(res, {message:'Successfully created a new character', item: item.toJSON()});
    }
}
module.exports.addItem = addItem;

/* EQUIP ITEM */
const equipItem = async function(req, res){
    const body = req.body;
    const charId = body.characterId;
    let itemId = body.itemId;

    let err, result, item;

    if (!isMyChar(req, charId)) {
        return ReE(res, {message: 'Not authorized'});
    }

    [err, item] = await to(Item.findOne({_id: itemId}));
    if (err) {
        return ReE(res, err);
    }
    const path = 'equipped.' + item['part'];
    [err, result] = await to(Character.updateOne({_id:charId}, {
        $set: {
            [path]: item
        }
    }));
    if(err){
        return ReE(res, err);
    }
    let char = await Character.findOne({_id: charId});
    return ReS(res, {character: char});
};
module.exports.equipItem = equipItem;