const mongoose = require('mongoose');



let SkillSchema = mongoose.Schema({
    id: Number,
    character_id: {type: mongoose.Schema.ObjectId, ref: 'Character'},
    skill_id: Number,
    level: Number
}, {toJSON: {virtuals: true}});

module.exports = mongoose.model('Skill', SkillSchema);
