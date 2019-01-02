const { Item, Character, Skill } = require('../models');
const characterService = require('../services/character.service');
const { to, ReE, ReS } = require('../services/util.service');
const fs = require('fs');

/* POST */
export const add = async function(req, res){
    const body = req.body;
    if (!body.id_player || body.id_skill === undefined) {
        return ReE(res, 'Pleaser enter a skill id and player id');
    } else {
        let err, s;

        [err, s] = await to(Skill.findOne({skill_id: body.id_skill, character_id: body.id_player}));
        if (s) {
            return ReS(res, {message: 'You already have this skill !'});
        }
        [err, s] = await to(Character.findOne({_id: body.id_player}));
        if (!s) {
            return ReS(res, {message: 'This player does not exist !'});
        }
        [err, s] = await to (characterService.addSkillToCharacter(body.id_player, body.id_skill));
        if (err) return ReE(res, err, 422);
        return ReS(res, {message:'Successfully created a new skill', skill: s.toJSON()});
    }
};

export let rawSkills = fs.readFileSync('./models/skills/skills.json');
export let JsonSkills = JSON.parse(fs.readFileSync('./models/skills/skills.json'));

/* GET */
export const get = async function(req, res){
    let skills = JSON.parse(rawSkills);
    return ReS(res, {skills: skills});
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

export const deleteSkill =  async (req, res) => {
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
