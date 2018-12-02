module.exports.Player = class  {


    constructor(character) {
        this.character = character;
        this.maxHealth = 40;
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

        attack.damages = Math.floor(Math.random() * 10) + 5;
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

    fight(target) {

        let logs = [];
        this.atkSpeed = 2;
        target.atkSpeed = 1;

        let next = this.atkSpeed > target.atkSpeed ? this : target;
        let turns = [];
        let turn = 1;
        let result = {};
        let atkLog = {};

        turns.push({id: next.character._id, turn: 0});
        while (!this.isDead() && !target.isDead()) {

            if (turns[0].id === this.character._id) {
                // Player Turn
                atkLog = this.attack(target);
                turns.push({id: target.character._id});
            } else {
                // Enemy Turn
                atkLog = target.attack(this);
                turns.push({id: this.character._id});
            }
            logs.push({attack: atkLog, attacker: turns[0].id, turn: turn});
            turns.shift();
            turn += 1;
        }

        if (this.isDead()) {
            // LOST
            result.win = true;
            result.exp = 0;
            resutl.gold = 0;
        } else if (target.isDead()) {
            // WON
            result.win = false;
            result.exp = 5;
            result.gold = 2;
        } else {
            // WTF ??
            console.log('IT HAPPENED');
        }
        return {result, ...logs};
    }

};
