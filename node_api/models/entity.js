import {JsonSkills, rawSkills} from "../controllers/skill.controller";

const {Character} = require('../models');
const {to, ReE, ReS} = require('../services/util.service');

var socketio = require('../socket/socket');
import {equippmentParts} from './item.enum';

export class Skill {
    constructor(skill_id, level) {
        let s = JsonSkills[skill_id];
        this.name = s.name;
        this.type = s.type;
        this.effect = s.effect;
        this.effect.forEach(effect => {
            for (let e in effect) {
                console.log(e, Array.isArray(effect[e]));
                if (Array.isArray(effect[e])) {
                    effect[e] = effect[e][level - 1];
                }
            }
        });
        console.log(this.effect);
        Array.isArray(s.cooldown) ? this.cooldown = s.cooldown[level - 1] : this.cooldown = s.cooldown;
        this.wait = this.cooldown;
    }

    getEffect() {
        const effects = {
            damages: 0
        };

        this.effect.forEach(e => {
            switch (e['type']) {
                case 'dmg': {
                    effects.damages += e['amount'];
                    break;
                }
            }
        });
        return effects;
    }

    use() {
        this.wait = this.cooldown;
    }

    isReady() {
        return this.wait <= 0;
    }

    decreaseWait() {
        if (this.wait > 0) {
            this.wait -= 1;
        }
    }
}

export class Entity {


    constructor(character) {
        this.name = character.name;
        this.character = character;
        this.level = character.level;
        this.str = character.str;
        this.dex = character.dex;
        this.sta = character.sta;
        this.con = character.con;
        this.equipped = character.equipped;
        this.maxHealth = this.getMaxHealth();
        this.currentHealth = this.maxHealth;
        this.exp = character.exp;
        this.skills = [];
        if (character.skills) {
            character.skills.forEach(skill => {
                this.skills.push(new Skill(skill.skill_id, skill.level));
            });
        }
    }

    getStr() {
        let value = this.str;
        if (this.equipped) {
            equippmentParts.forEach((p) => {
                const part = this.equipped[p];
                if (part && part.bonus) {
                    part.bonus.forEach((b) => {
                        if (b.stat === 'STR') {
                            value += b.value;
                        }
                    });
                }
            });
        }
        return value;
    }

    getMaxHealth() {
        const max = Math.round(Math.pow(this.getCon(), (1.2)) + Math.pow(this.getSta(), (1.6)) + 60 + (5 * this.level));
        return max;
    }

    getCon() {
        let value = this.con;
        if (this.equipped) {
            equippmentParts.forEach((p) => {
                const part = this.equipped[p];
                if (part && part.bonus) {
                    part.bonus.forEach((b) => {
                        if (b.stat === 'CON') {
                            value += b.value;
                        }
                    });
                }
            });
        }
        return value;
    }

    getSta() {
        let value = this.sta;
        if (this.equipped) {
            equippmentParts.forEach((p) => {
                const part = this.equipped[p];
                if (part && part.bonus) {
                    part.bonus.forEach((b) => {
                        if (b.stat === 'STA') {
                            value += b.value;
                        }
                    });
                }
            });
        }
        return value;
    }

    getDex() {
        let value = this.dex;
        if (this.equipped) {
            equippmentParts.forEach((p) => {
                const part = this.equipped[p];
                if (part && part.bonus) {
                    part.bonus.forEach((b) => {
                        if (b.stat === 'DEX') {
                            value += b.value;
                        }
                    });
                }
            });
        }
        return value;
    }

    randomFloat(min, max, decimalPlaces) {
        var rand = Math.random() * (max - min) + min;
        var power = Math.pow(10, decimalPlaces);
        return Math.floor(rand * power) / power;
    }

    isDead() {
        return this.currentHealth <= 0;
    }

    getAttackPower() {
        return Math.round(Math.pow(this.getStr(), (1.1)));
    }

    attack(target) {
        if (this.isDead()) {
            console.log(this.character.name + ': dead');
            return;
        }
        let attack = {};
        let skill;

        attack.isSkill = false;

        this.skills.forEach(s => {
            if (s.isReady()) {
                s.use();
                if (!skill) {
                    attack.isSkill = true;
                    skill = s;
                }
            } else {
                s.decreaseWait();
            }
        });

        console.log(attack.isSkill, skill);
        if (attack.isSkill && skill) {
            attack.skill = skill;
            console.log('lA', skill.getEffect().damages);
            if (skill.type === 'melee') {
                attack.damages = skill.getEffect().damages;
            } else {
                attack.damages = skill.getEffect().damages;
            }
        } else {
            attack.damages = this.getAttackPower();
        }
        attack.isMiss = false;
        if ((Math.floor(Math.random() * 10) + 1) > 9) {
            attack.isMiss = true;
            attack.damages *= 1.5;
        }


        attack.isCrit = false;
        if ((Math.floor(Math.random() * 5) + 1) === 4) {
            attack.isCrit = true;
            attack.damages *= this.randomFloat(1.50, 2.20, 2);
        }

        attack.damages *= this.randomFloat(0.95, 1.05, 2);

        attack.damages = Math.floor(attack.damages * (700 / (700 + target.getDefense())));

        attack.target = {id: target.getId(), name: target.getName()};
        return target.receiveDamage(attack);
    }

    getDefense() {
        let value = Math.round(Math.pow(this.getCon(), (1.4)));
        if (this.equipped) {
            equippmentParts.forEach((p) => {
                const part = this.equipped[p];
                if (part && part.bonus) {
                    part.bonus.forEach((b) => {
                        if (b.stat === 'PDEF') {
                            value += b.value;
                        }
                    });
                }
            });
        }
        return value;
    }

    receiveDamage(attack) {
        if (attack.isMiss) {
            return attack;
        }
        if (attack.damages < 0) {
            attack.damages = 0;
        }
        this.currentHealth -= +attack.damages;
        return attack;
    }

    sendSystemMessage(msg) {
        socketio.emit(this.userId, 'msg_sys', msg);
    }

    sendMessage(event, msg) {
        socketio.emit(this.userId, event, msg);
    }

    getAtkspeed() {
        return (200 / (200 + this.getDex()) * 20)
    }

    async fight(target) {

        let logs = [];
        this.atkSpeed = 1;
        target.atkSpeed = 1;

        this.turnToWait = this.getAtkspeed();
        target.turnToWait = target.getAtkspeed();

        let turn = 1;
        let result = {};
        let atkLog = {};

        let warriors = [this, target];
        if (this.getAtkspeed() > target.getAtkspeed()) {
            warriors = [target, this];
        }

        while (!this.isDead() && !target.isDead()) {

            warriors.forEach((c) => {
                c.turnToWait -= 1;
                if (c.currentHealth >= 0 && c.turnToWait <= 0) {
                    // Time to attack !
                    if (c.character && c.getId() === this.getId()) {
                        // Player Turn
                        atkLog = this.attack(target);
                    } else {
                        // Enemy Turn
                        atkLog = target.attack(this);
                    }
                    logs.push({attack: atkLog, attacker: {id: c.character._uid, name: c.getName()}, turn: turn});
                    c.turnToWait = c.getAtkspeed();
                    turn += 1;
                }
            });
        }

        if (this.isDead()) {
            // LOST
            result.win = false;
            result.exp = 0;
            result.gold = 0;
        } else if (target.isDead()) {
            // WON
            result.win = true;
            result.exp = target.getExpDie();
            result.gold = 2;
            result.char = await this.addExperience(result.exp);
        } else {
            // WTF ??
            console.log('IT HAPPENED');
        }
        return {result, turns: logs};
    }

    getExpDie() {
        return Math.round(+this.character.level * +this.character.level * 25) * (1 + Math.log10(+this.character.level))
    }

    async addExperience(amount) {
        this.exp += amount;
        this.character.exp += amount;
        if (this.character.exp >= Math.round(this.level * this.level * this.level)) {
            this.character.level += 1;
            this.character.exp = 0;
            this.character.sta += Math.floor(Math.random() * 2);
            this.character.con += Math.floor(Math.random() * 2);
            this.character.str += Math.floor(Math.random() * 2);
            this.character.dex += Math.floor(Math.random() * 2);
            this.sendMessage('msg_sys', 'Level up ! (' + this.character.level + ')');
        }
        let err, c;
        [err, c] = await to(this.character.update(this.character));
        this.character = c[1];
        return this.character;
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getLoot() {

    }

}

export class Player extends Entity {
    constructor(entity) {
        super(entity);
        this.userId = entity.user_id;
        this.character = entity;
    }

    getId() {
        return this.character._id;
    }

    getName() {
        return this.character.name;
    }
}

export class Monster extends Entity {
    constructor(entity) {
        super(entity);
        this.loot = entity.loot;
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getExpDie() {
        return this.exp ? this.exp : super.getExpDie();
    }

    getLoot() {
        return this.loot;
    }
}
