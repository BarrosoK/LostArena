const mongoose 			= require('mongoose');
const bcrypt 			= require('bcrypt');
const bcrypt_p 			= require('bcrypt-promise');
const jwt           	= require('jsonwebtoken');
const Character         = require('./character.model');
const validate          = require('mongoose-validator');
const {TE, to}          = require('../services/util.service');
const CONFIG            = require('../config/config');

let UserSchema = mongoose.Schema({
    username: {type:String, index: true, unique: true},
    email: {type:String, lowercase:true, trim: true, index: true, unique: true,
            validate:[validate({
                validator: 'isEmail',
                message: 'Not a valid email.',
            }),]
    },
    password:   {type:String},
}, {timestamps: true, toJSON: {virtuals: true}});

UserSchema.virtual('characters', {
    ref: 'Character',
    localField: '_id',
    foreignField: 'user_id',
});

UserSchema.post('save', function(doc, next) {
    doc.populate('characters').execPopulate().then(function() {
      next();
    });
  });

UserSchema.pre('findOne', function() {
    this.populate({
        path: 'characters',
    });
});

UserSchema.pre('findById', function() {
    this.populate('characters');
});

UserSchema.pre('save', async function(next){

    if(this.isModified('password') || this.isNew){

        let err, salt, hash;
        [err, salt] = await to(bcrypt.genSalt(10));
        if(err) TE(err.message, true);

        [err, hash] = await to(bcrypt.hash(this.password, salt));
        if(err) TE(err.message, true);

        this.password = hash;

    } else{
        return next();
    }
});

UserSchema.methods.comparePassword = async function(pw){
    let err, pass;
    if(!this.password) TE('password not set');

    [err, pass] = await to(bcrypt_p.compare(pw, this.password));
    if(err) TE(err);

    if(!pass) TE('invalid password');

    return this;
}

UserSchema.methods.Characters = async function() {
    let err, characters;
    console.log();
    [err, charactes] = await to (Character.find({'users.user': this._id}));
    if (err) TE('err getting characters');
    return characters;
};

UserSchema.methods.getJWT = function(){
    let expiration_time = parseInt(CONFIG.jwt_expiration);
    return "Bearer "+jwt.sign({user_id:this._id}, CONFIG.jwt_encryption, {expiresIn: expiration_time});
};

UserSchema.methods.toWeb = function(){
    let json = this.toJSON();
    return json;
};

let User = module.exports = mongoose.model('User', UserSchema);


