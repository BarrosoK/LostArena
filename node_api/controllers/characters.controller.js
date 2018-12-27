const {Player} = require("../models/entity");
const {Character} = require('../models');
const characterService = require('../services/character.service');
const {to, ReE, ReS} = require('../services/util.service');
const socketio = require('../socket/socket');

const fight = async function (req, res) {
    let player = new Player(await Character.findOne({_id: req.body._idPlayer}));
    let enemy = new Player(await Character.findOne({_id: req.body._idEnemy}));

    let logs = player.fight(enemy);
    if (logs.result.win) {
        player.sendMessage('combat', 'You won your fight against ' + enemy.name);
    } else {
        player.sendMessage('combat', 'You lost your fight against ' + enemy.name);
    }
    console.log(logs.result);
    return ReS(res, {player: player, enemy: enemy, logs: logs});
};
module.exports.fight = fight;

const get = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    let characters = await Character.find({}, {__v: false}, {level: 1});
    return ReS(res, {characters: characters, amount: characters.length});
};
module.exports.get = get;
