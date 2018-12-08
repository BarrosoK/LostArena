const mongoose = require('mongoose');



let ItemSchema = mongoose.Schema({
    id: Number,
    character_id: {type: mongoose.Schema.ObjectId, ref: 'Character'},
    type: Number,
    name: String,
    bonus: {}
}, {toJSON: {virtuals: true}});

module.exports = mongoose.model('Item', ItemSchema);
