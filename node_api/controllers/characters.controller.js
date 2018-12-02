const {Player} = require("../models/entity");
const {Character} = require('../models');
const characterService = require('../services/character.service');
const {to, ReE, ReS} = require('../services/util.service');

const fight = async function (req, res) {
    let player = new Player(await Character.findOne({_id: req.body._idPlayer}));
    let enemy = new Player(await Character.findOne({_id: req.body._idEnemy}));

    let logs = player.fight(enemy);

    return ReS(res, {player: player, enemy: enemy, logs: logs});
};
module.exports.fight = fight;

const get = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    let characters = await Character.find({}, {__v: false}, {level: 1});
    return ReS(res, {characters: characters, amount: characters.length});
};
module.exports.get = get;
