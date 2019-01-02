const mongoose = require('mongoose');
const User = require('./user.model');
import {equippmentParts} from './item.enum';
const { to } = require('../services/util.service');

let CharacterSchema = mongoose.Schema({
    name: {type:String, index: true, unique: true},
    level: {type:Number},
    user_id:  {type : mongoose.Schema.ObjectId, ref : 'User'},
    sta: Number,
    con: Number,
    dex: Number,
    str: Number,
    exp: Number,
    equipped: {
        weapon: {type: mongoose.Schema.ObjectId, ref: 'Item'},
        head: {type: mongoose.Schema.ObjectId, ref: 'Item'},
        chest: {type: mongoose.Schema.ObjectId, ref: 'Item'},
    }
},  {toJSON: {virtuals: true}});

CharacterSchema.methods.toWeb = function(){
    let json = this.toJSON();
    return json;
};

CharacterSchema.virtual('items', {
    ref: 'Item',
    localField: '_id',
    foreignField: 'character_id',
});

CharacterSchema.virtual('skills', {
    ref: 'Skill',
    localField: '_id',
    foreignField: 'character_id',
});

CharacterSchema.pre('findOne', function() {
    this.populate('user');
    this.populate('items');
    this.populate('skills');
    equippmentParts.forEach((part) => {
        this.populate('equipped.' + part);
    });
});


CharacterSchema.pre('find', function() {
    this.populate('user');
    this.populate('items');
    this.populate('skills');
    equippmentParts.forEach((part) => {
        this.populate('equipped.' + part);
    });
});

CharacterSchema.methods.update = async function(character){
    let err, result;
    [err, result] = await to(Character.updateOne({_id:character._id}, character));
    const c =  await to(Character.findOne({_id:character._id}));
    return c;
};
let Character = module.exports = mongoose.model('Character', CharacterSchema);