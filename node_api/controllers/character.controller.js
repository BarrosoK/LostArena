const { Character } = require('../models');
const characterService = require('../services/character.service');
const { to, ReE, ReS } = require('../services/util.service');

const get = async function(req, res){
    res.setHeader('Content-Type', 'application/json');
    let characters = req.user.characters;
    return ReS(res, {characters:characters, amount:characters.length});
};
module.exports.get = get;

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