const { Character, User } 	    = require('../models');
const  db  = require('../models/index');
const validator     = require('validator');
const { to, TE }    = require('../services/util.service');

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

const createCharacter = async function(characterInfo, user){
    let unique_key, auth_info, err;

    auth_info = {};
    auth_info.status = 'create';

    unique_key = getUniqueKeyFromBody(characterInfo);
    if (!unique_key) TE('An name was not entetred.');

    auth_info.method = 'name';

    characterInfo.user_id = user._id;

    // GENERAL
    characterInfo.name = unique_key;
    characterInfo.level = 1;
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