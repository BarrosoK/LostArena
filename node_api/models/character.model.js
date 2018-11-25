const mongoose = require('mongoose');
const User = require('./user.model');

let CharacterSchema = mongoose.Schema({
    name: {type:String, index: true, unique: true},
    level: {type:Number},
    user_id:  {type : mongoose.Schema.ObjectId, ref : 'User'},
    sta: Number,
    con: Number,
    dex: Number,
    str: Number
},  {toJSON: {virtuals: true}});

CharacterSchema.methods.toWeb = function(){
    let json = this.toJSON();
    return json;
};

CharacterSchema.pre('findOne', function() {
    this.populate('user');
});

let Character = module.exports = mongoose.model('Character', CharacterSchema);