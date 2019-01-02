import {rawSkills} from "../controllers/skill.controller";

const { Character, User, Item, Skill } 	    = require('../models');
const  db  = require('../models/index');
const validator     = require('validator');
const { to, TE }    = require('../services/util.service');
const fs = require('fs');

const getUniqueKeyFromBody = function(body){// this is so they can send in 3 options unique_key, email, or phone and it will work
    let unique_key = body.unique_key;
    if(typeof unique_key==='undefined') {
        if (typeof body.name != 'undefined') {
            unique_key = body.name
        }else{
            unique_key = null;
        }
    }

    return unique_key;
}
module.exports.getUniqueKeyFromBody = getUniqueKeyFromBody;

const ItemType = Object.freeze({
    EQUIPMENT:   1,
    POTION:  2,
});


let rawItems = fs.readFileSync('./models/items/items.json');

const addItemToCharacter = async function(characterId, itemId) {
    let err, item;

        //TODO: Read the file at the server start !!!!!
        let itemRef = JSON.parse(rawItems)[itemId];
        itemRef.character_id = characterId;
        let b = [];

        if (itemRef.type == ItemType.EQUIPMENT) {
        itemRef['bonus'].forEach(bonus => {
            let stat = bonus['stat'];
            let value = bonus['default'];
            let variance = bonus['variance'];
            if (variance) {
                var num = Math.floor(Math.random()*variance) + 1; 
                num *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
                value =  value * (1 + (num / 100));
            }
            b.push({stat: stat, value: value});
        }); 
        itemRef.bonus = b;
    } else {
        delete itemRef['bonus'];
    }
    [err, item] = await to(Item.create(itemRef));
    if (err) {
        TE(err);
    }
    return item;
}
module.exports.addItemToCharacter = addItemToCharacter;

export const addSkillToCharacter = async function(characterId, skillId) {
    let err, r;
    let skill = {};

    // let skillRef = JSON.parse(rawSkills)[skillId];
    skill.character_id = characterId;
    skill.skill_id = skillId;
    skill.level = 1;
    [err, r] = await to(Skill.create(skill));
    if (err) {
        TE(err);
    }
    return r;
};

const createCharacter = async function(characterInfo, user){
    let unique_key, auth_info, err, character;

    auth_info = {};
    auth_info.status = 'create';

    unique_key = getUniqueKeyFromBody(characterInfo);
    if (!unique_key) TE('An name was not entetred.');

    auth_info.method = 'name';

    characterInfo.user_id = user._id;

    // GENERAL
    characterInfo.name = unique_key;
    characterInfo.level = 1;
    characterInfo.exp = 0;
    // STATS
    characterInfo.sta = 5;
    characterInfo.dex = 5;
    characterInfo.str = 5;
    characterInfo.con = 5;

    [err, character] = await to(Character.create(characterInfo));
    if(err) {
        if(err.message.includes('E11000')){
            if(err.message.includes('name')){
                err = 'This name is already in use';
            } else {
                err = 'Invalid format';
            }
        } else {
            err = 'Invalid format';
        }

        TE(err);
    }
    return character;
};
module.exports.createCharacter = createCharacter;