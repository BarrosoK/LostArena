const { Character } = require('../models');
const characterService = require('../services/character.service');
const { to, ReE, ReS } = require('../services/util.service');


const get = async function(req, res){
    res.setHeader('Content-Type', 'application/json');
    let characters = await Character.find({}, {__v: false}, {sort: level});
    return ReS(res, {characters:characters, amount:characters.length});
};
module.exports.get = get;
