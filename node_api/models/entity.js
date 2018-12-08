var socketio = require('../socket/socket');
module.exports.Player = class {


    constructor(character) {
        console.log(character);
        this.name = character.name;
        this.userId = character.user_id;
        this.character = character;
        this.maxHealth = 100;
        this.currentHealth = this.maxHealth;
    }

    isDead() {
        return this.currentHealth <= 0;
    }

    attack(target) {
        if (this.isDead()) {
            console.log(this.character.name + ': dead');
            return;
        }
        let attack = {};

        attack.damages = Math.floor(Math.random() * 100) + 5;
        attack.isCrit = false;
        attack.isMiss = false;
        attack.isSkill = false;
        attack.target = {id: target.character._id, name: target.character.name};
        return target.receiveDamage(attack);
    }

    receiveDamage(attack) {
        this.currentHealth -= +attack.damages;
        return attack;
    }

    sendSystemMessage(msg) {
        socketio.emit(this.userId, 'msg_sys', msg);
    }

    sendMessage(event, msg) {
        socketio.emit(this.userId, event, msg);
    }

    fight(target) {

        let logs = [];
        this.atkSpeed = 2;
        target.atkSpeed = 1;

        this.turnToWait = 10 - this.atkSpeed * 2;
        target.turnToWait = 10 - target.atkSpeed * 2;

        let turn = 1;
        let result = {};
        let atkLog = {};

        let warriors = [this, target];

        while (!this.isDead() && !target.isDead()) {

            warriors.forEach((c) => {
                c.turnToWait -= 1;
                if (c.currentHealth >= 0 && c.turnToWait <= 0) {
                    // Time to attack !
                    if (c.character._id === this.character._id) {
                        // Player Turn
                        atkLog = this.attack(target);
                    } else {
                        // Enemy Turn
                        atkLog = target.attack(this);
                    }
                    logs.push({attack: atkLog, attacker: {id: c.character._id, name: c.character.name}, turn: turn});
                    c.turnToWait = 10 - c.atkSpeed * 2;
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
            result.exp = 5;
            result.gold = 2;
        } else {
            // WTF ??
            console.log('IT HAPPENED');
        }
        return {result, turns:logs};
    }

};
