const {Entity, Monster, Player} = require("../models/entity");
const {Character} = require('../models');
const characterService = require('../services/character.service');
const {to, ReE, ReS} = require('../services/util.service');
const socketio = require('../socket/socket');
const fs = require('fs');

const fight = async function (req, res) {
    let player = new Player(await Character.findOne({_id: req.body._idPlayer}));
    let enemy = new Player(await Character.findOne({_id: req.body._idEnemy}));

    let logs = await player.fight(enemy);
    if (logs.result.win) {
        // player.sendMessage('combat', 'You won your fight against ' + enemy.name);
    } else {
        // player.sendMessage('combat', 'You lost your fight against ' + enemy.name);
    }
    return ReS(res, {player: player, enemy: enemy, logs: logs});
};
module.exports.fight = fight;

export let rawMonsters = fs.readFileSync('./models/monsters/monsters.json');

const pve = async function (req, res)  {
    let player = new Player(await Character.findOne({_id: req.body.id_player}));
    let monsterRef = new Monster(JSON.parse(rawMonsters)[req.body.id_monster]);
    let logs = await player.fight(monsterRef);
    return ReS(res, {logs: logs, player: player, monster: monsterRef});
};
module.exports.pve = pve;

const get = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    let characters = await Character.find({}, {__v: false}, {level: 1});
    return ReS(res, {characters: characters, amount: characters.length});
};
module.exports.get = get;
