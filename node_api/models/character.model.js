const mongoose = require('mongoose');
const User = require('./user.model');

let CharacterSchema = mongoose.Schema({
    name: {type:String, index: true, unique: true},
    level: {type:Number},
    user_id:  {type : mongoose.Schema.ObjectId, ref : 'User'},
});

CharacterSchema.methods.toWeb = function(){
    let json = this.toJSON();
    return json;
};

CharacterSchema.virtual('users', {
    ref: 'User',
    localField: '_id',
    foreignField: 'characters.character',
    justOne: false,
});

CharacterSchema.methods.User = async function(){
    let err, user;
    [err, user] = await to(User.find({'characters.character': this._id}));
    if (err) TE('err getting user');
    return user;
}

let Character = module.exports = mongoose.model('Character', CharacterSchema);