const mongoose = require('mongoose');
const User = require('./user.model');

let CharacterSchema = mongoose.Schema({
    name: {type:String, index: true, unique: true},
    level: {type:Number},
    user_id:  {type : mongoose.Schema.ObjectId, ref : 'User'},
    sta: Number,
    con: Number,
    dex: Number,
    str: Number,
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

CharacterSchema.pre('findOne', function() {
    this.populate('user');
    this.populate('items');
});


CharacterSchema.pre('find', function() {
    this.populate('user');
    this.populate('items');
});

CharacterSchema.methods.fight = function(target) {
    console.log('bonjour');
};
let Character = module.exports = mongoose.model('Character', CharacterSchema);
