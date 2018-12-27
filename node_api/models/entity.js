const {Character} = require('../models');
const { to, ReE, ReS } = require('../services/util.service');

var socketio = require('../socket/socket');
import {equippmentParts} from './item.enum';

module.exports.Player = class {


    constructor(character) {
        this.name = character.name;
        this.userId = character.user_id;
        this.character = character;
        this.str = character.str;
        this.equipped = character.equipped;
        this.maxHealth = 100;
        this.currentHealth = this.maxHealth;
        this.exp = character.exp;
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
    
    

    isDead() {
        return this.currentHealth <= 0;
    }

    attack(target) {
        if (this.isDead()) {
            console.log(this.character.name + ': dead');
            return;
        }
        let attack = {};


        attack.damages = Math.round(this.getStr()) + Math.floor(Math.random() * 5) + 1;

        attack.isMiss = false;
        if ((Math.floor(Math.random() * 5) + 1) === 5) {
            attack.isMiss = true;
            attack.damages *= 1.5;
        }


        attack.isCrit = false;
        if ((Math.floor(Math.random() * 5) + 1) === 4) {
            attack.isCrit = true;
            attack.damages *= 1.5;
        }

        attack.isSkill = false;
        attack.target = {id: target.character._id, name: target.character.name};
        return target.receiveDamage(attack);
    }

    receiveDamage(attack) {
        if (attack.isMiss) {
            return attack;
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

    fight(target) {

        let logs = [];
        this.atkSpeed = 1;
        target.atkSpeed = 1;

        this.turnToWait = 10 - this.atkSpeed * 2;
        target.turnToWait = 10 - target.atkSpeed * 2;

        let turn = 1;
        let result = {};
        let atkLog = {};

        let warriors = [this, target];
        if (this.atkSpeed < target.atkSpeed) {
            warriors = [target, this];
        }


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
            result.char = this.addExperience(result.exp);
        } else {
            // WTF ??
            console.log('IT HAPPENED');
        }
        return {result, turns:logs};
    }

    async addExperience(amount) {
        this.exp += amount;
        this.character.exp += amount;
        this.character = this.character.update(this.character);
    }

};
