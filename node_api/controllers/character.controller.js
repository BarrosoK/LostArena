const { Character } = require('../models');
const characterService = require('../services/character.service');
const { to, ReE, ReS } = require('../services/util.service');

const create = async function(req, res){
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if (!body.name) {
        return ReE(res, 'Pleaser en a name to register.');
    } else {
        let err, character;

        [err, character] = await to (characterService.createCharacter(body, req.user));

        if (err) return ReE(res, err, 422);
        return ReS(res, {message:'Successfully created a new character', character: character.toWeb()});
    }
};
module.exports.create = create;

const get = async function(req, res){
    res.setHeader('Content-Type', 'application/json');
    let characters = req.user.characters;
    return ReS(res, {characters:characters, amount:characters.length});
};
module.exports.get = get;

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

const remove = async function(req, res){
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

    [err, result] = await to(Character.deleteOne({_id:character_id}));
    if(err){
        return ReE(res, err);
    }
    return ReS(res);
};
module.exports.remove = remove;