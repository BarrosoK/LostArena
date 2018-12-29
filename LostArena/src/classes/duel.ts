import {
  DEFAULT_Y,
  FIGHT_SPEED,
  ICharacter, NAME_UP, PROGRESSBAR_BORDER, PROGRESSBAR_HEALTH_HEIGHT, PROGRESSBAR_HEALTH_WIDTH, PROGRESSBAR_OFFSET,
  SPAWN_ENEMY,
  SPAWN_PLAYER,
  TIME_SCALE
} from '../app/models/Character';
import {BehaviorSubject, iif, Subject} from 'rxjs';
import {first, mergeMap, skipWhile} from 'rxjs/operators';
import {environment} from '../environments/environment';
import Container = PIXI.Container;
import Graphics = PIXI.Graphics;
import {Injectable} from "@angular/core";
import {Store} from "@ngxs/store";
import {UserState} from "../app/stores/states/user.state";

export interface Attack {
  damages: number;
  isCrit: boolean;
  isMiss: boolean;
  isSkill: boolean;
  target: { id: string, name: string };
}

export interface DuelLog {
  player: ICharacter;
  enemy: ICharacter;
  logs: {
    result: {
      win: boolean;
      exp?: number;
      gold?: number;
    };
    turns: [{
      attack: Attack;
      attacker: { id: string, name: string };
      turn: number;
    }];
  };
}

/* DUEL */
export class Duel {

  duelLog: DuelLog; // Store the turns from the server
  player: Fighter = undefined;
  enemy: Fighter = undefined;
  isStarted = false;
  isOver = false;
  pApp: any;
  nextTurn: BehaviorSubject<boolean>;

  constructor(pApp: any, turns: DuelLog, private store: Store) {
    this.nextTurn = new BehaviorSubject<boolean>(false);
    this.pApp = pApp;
    this.duelLog = turns;
    this.addPlayer(this.duelLog.player);
    this.addEnemy(this.duelLog.enemy);
    this.start();
  }

  delete() {
    if (this.player) {
      this.player.delete();
    }
    if (this.enemy) {
      this.enemy.delete();
    }
  }

  getAttackerFromTurn(turn) {
    if (turn > this.duelLog.logs.turns.length) {
      return null;
    }
    if (this.duelLog.logs.turns[turn].attacker.name === this.player.character.name) {
      return this.player;
    } else {
      return this.enemy;
    }
  }

  getTargetFromTurn(turn) {
    if (turn > this.duelLog.logs.turns.length) {
      return null;
    }
    if (this.duelLog.logs.turns[turn].attack.target.name === this.player.character.name) {
      return this.player;
    } else {
      return this.enemy;
    }
  }

  async start() {
    let turn = 0;
    this.isStarted = true;
    const next = this.nextTurn;
    console.log(this.duelLog.logs.turns);
    next.subscribe(async (n: boolean) => {
      if (turn >= this.duelLog.logs.turns.length) {
        // END
        if (this.duelLog.logs.result.win) {
          // WIN
          this.player.spine.state.timeScale = 0.5;
          this.player.spine.state.setAnimation(0, 'jump', true);
          const c = await this.store.selectOnce(UserState.selectedCharacter).toPromise();
          c.exp += this.duelLog.logs.result.exp; // ADD EXP
        } else {
          // LOOSE
          this.enemy.spine.state.timeScale = 0.5;
          this.enemy.spine.state.setAnimation(0, 'jump', true);
        }
        this.isOver = true;
        return;
      }
      this.getAttackerFromTurn(turn).attack(this.getTargetFromTurn(turn), this.duelLog.logs.turns[turn].attack);
      turn++;
    });
  }

  addPlayer(character: ICharacter) {
    this.player = new Fighter(this.duelLog.player, this, 0);
  }

  addEnemy(character: ICharacter) {
    this.enemy = new Fighter(this.duelLog.enemy, this, 1);
  }

}

/* FIGHTER */
export class Fighter {

  character: ICharacter;
  duel: Duel;
  spine: any;
  side: number;
  target: Fighter;
  currentHealth: number;

  hit: Attack;
  attacking = false;
  isMyTurn = false;
  attacked = false;
  turnEnd: BehaviorSubject<boolean>;
  uiText = [];
  healthPb;
  healthPbPercent;
  nameText;
  scaleFactor;

  constructor(character: ICharacter, duel: Duel, side: number) {
    this.scaleFactor = Math.min(
      window.innerWidth / 1200,
      window.innerHeight / 1100
    );
    this.character = character;
    this.duel = duel;
    this.side = side;
    this.turnEnd = new BehaviorSubject<boolean>(false);
    this.currentHealth = 100;
    this.loadPixi();
  }

  createUi() {
    // Create health percentage text
    this.healthPbPercent = new PIXI.Text('100%', environment.pixi.textStyles.healthPercent);
    // Create the health bar
    this.healthPb = new Container();
    this.healthPb.position.set(!this.side ?
      PROGRESSBAR_BORDER / 2 :
      800 - PROGRESSBAR_HEALTH_WIDTH - PROGRESSBAR_BORDER / 2, NAME_UP  ? 40 : PROGRESSBAR_OFFSET);
    this.duel.pApp.stage.addChild(this.healthPb);
    console.log(this.duel.pApp.screen.width, this.scaleFactor, PROGRESSBAR_HEALTH_WIDTH);
    // Create the black background rectangle
    const innerBar = new Graphics();
    innerBar.beginFill(0x000000);
    innerBar.lineStyle(PROGRESSBAR_BORDER, 0x137c28, 1);
    innerBar.drawRect(0, 0, PROGRESSBAR_HEALTH_WIDTH, PROGRESSBAR_HEALTH_HEIGHT);
    innerBar.endFill();
    this.healthPb.addChild(innerBar);
    // Create the front red rectangle
    const outerBar = new Graphics();
    outerBar.beginFill(0xFF3300, 0.7);
    outerBar.drawRect(PROGRESSBAR_BORDER / 2, PROGRESSBAR_BORDER / 2, PROGRESSBAR_HEALTH_WIDTH, PROGRESSBAR_HEALTH_HEIGHT - (PROGRESSBAR_BORDER));
    outerBar.endFill();
    this.healthPb.addChild(outerBar);
    this.healthPbPercent.y = (PROGRESSBAR_HEALTH_HEIGHT / 2) - (this.healthPbPercent.height / 2);
    this.healthPb.addChild(this.healthPbPercent);
    this.nameText = new PIXI.Text('', environment.pixi.textStyles.name);
    this.nameText.text = this.character.name;
    this.nameText.x = !this.side ? PROGRESSBAR_HEALTH_WIDTH - this.nameText.width : 0;
    this.nameText.x = !this.side ? PROGRESSBAR_HEALTH_WIDTH - this.nameText.width : 0;
    this.nameText.y = NAME_UP ? -PROGRESSBAR_HEALTH_HEIGHT : PROGRESSBAR_HEALTH_HEIGHT;
    this.healthPb.addChild(this.nameText);
    this.healthPb.outer = outerBar;
  }

  loadPixi() {
    this.spine = new PIXI.spine.Spine(this.duel.pApp.loader.resources.spineboy.spineData);
    this.spine.skeleton.setSkinByName('leather_armor');
    console.log(this.character.equipped);
    let weapon = null;

    if (this.character.equipped['weapon'] && this.character.equipped['weapon']['img']) {
      weapon = this.character.equipped['weapon']['img'];
    }

    this.spine.skeleton.setAttachment('arm_sword', weapon);
    this.spine.x = this.side === 0 ? SPAWN_PLAYER : SPAWN_ENEMY;
    this.spine.y = DEFAULT_Y;
    this.spine.scale.set(0.5);
    if (this.side === 0) { this.spine.skeleton.flipX = true; }
    this.spine.stateData.setMix('run', 'idle', 0.2);
    this.spine.stateData.setMix('idle', 'run', 0.2);
    this.spine.stateData.setMix('attack_01', 'run', 0.2);
    this.spine.stateData.setMix('run', 'attack_01', 0.4);
    this.spine.state.setAnimation(0, 'idle', true);
    this.spine.state.timeScale = TIME_SCALE;
    this.createUi();
    this.duel.pApp.stage.addChild(this.spine);
    new PIXI.ticker.Ticker()
      .add((delta) => {
        this.updateUi(delta);
        this.update(delta);
      }).start();
  }

  async attack(target: Fighter, hit: Attack) {
    this.isMyTurn = true;
    this.target = target;

    this.hit = hit;
    this.spine.state.setAnimation(0, 'run', true);
    return new Promise(resolve => {
      setInterval(() => {
        if (this.turnEnd.getValue()) {
          resolve(true);
        }
      }, 1000);
    });
  }

  delete() {
    this.duel.pApp.stage.removeChild(this.spine);
    this.duel.pApp.stage.removeChild(this.nameText);
    this.duel.pApp.stage.removeChild(this.healthPb);
    this.duel.pApp.stage.removeChild(this.healthPbPercent);
  }

  endTurn() {
    this.spine.skeleton.flipX = !this.side;
    this.spine.state.setAnimation(0, 'idle', true);
    this.isMyTurn = false;
    this.attacked = false;
    this.turnEnd.next(true);
    this.duel.nextTurn.next(true);
  }


  receiveDamages(hit: Attack) {
    if (!hit.isMiss) {
      this.currentHealth -= hit.damages;
    }
    if (this.currentHealth <= 0) {
      this.currentHealth = 0;
      this.spine.state.setAnimation(0, 'dying');
    } else if (hit.isMiss) {
      this.spine.state.setAnimation(0, ((Math.floor(Math.random() * 2) + 1) === 1) ? 'avoid' : 'defance', false);
    } else {
      this.spine.state.setAnimation(0, 'hit');
    }
  }

  intersect(b) {
    const a = this.spine;
    const ab = a.getBounds();
    const bb = b.getBounds();
    const myWidth =  a.skeleton.skin.attachments[4].body.width;
    const ennWidth =  b.skeleton.skin.attachments[4].body.width;
    const myWeaponWidth = a.skeleton.slots[0].attachment ? a.skeleton.slots[0].attachment.width : 0;
    const ennWeaponWidth = b.skeleton.slots[0].attachment ? b.skeleton.slots[0].attachment.width : 0;


    if (this.side === 0) {
      return ab.x + ab.width >= (bb.x + bb.width - ennWidth * this.scaleFactor);
    } else {
      return ab.x  <= (bb.x + ennWidth * this.scaleFactor);
    }

    console.log(a.skeleton.slots[0].attachment);
    return ab.x + myWidth - (myWeaponWidth - 100) > bb.x + ennWeaponWidth
      && ab.x  < bb.x + ennWidth;
  }

  addHitEffect() {
    let style;
    let text = this.hit.damages.toString();

    if (this.hit.isMiss) {
      text = 'MISS';
      style = environment.pixi.textStyles.hitMiss;
    } else if (this.hit.isCrit) {
      text += '!!';
      style = environment.pixi.textStyles.hitCrit;
    } else {
      style = environment.pixi.textStyles.hitDefault;
    }
    const d: any = new PIXI.Text(text, style);

    d.direction = (Math.floor(Math.random() * 2) + 1);
    d.default = this.target.spine.x;
    d.x = this.target.spine.x;
    d.y = this.target.spine.y - this.target.spine.height;
    this.uiText.push(d);
    this.duel.pApp.stage.addChild(d);
  }

  onAttack() {
    const wait = this.spine.state.setAnimation(0, 'attack_0' + (this.hit.isCrit ? '3' : '1'), false).animationEnd * 1000;
    setTimeout(() => {
      this.target.receiveDamages(this.hit);
      this.addHitEffect();
      this.attacking = false;
      this.attacked = true;
      this.returnToPosition();
    }, wait / TIME_SCALE);
  }

  returnToPosition() {
    this.spine.state.setAnimation(0, 'run', true);
    this.spine.skeleton.flipX = this.side;
  }

  updateUi(delta) {
    // Update health bar
    let p = (this.currentHealth / 100  * PROGRESSBAR_HEALTH_WIDTH) - PROGRESSBAR_BORDER;
    if (p < 0) {
      p = 0;
    }
    this.healthPb.outer.width = p;
    this.healthPbPercent.text = Math.floor(this.currentHealth / 100 * 100) + '%';
    this.healthPbPercent.x = (PROGRESSBAR_HEALTH_WIDTH / 2) - (this.healthPbPercent.width / 2);
    // Hit float effect
    this.uiText.forEach((text) => {
      text.y -= 3 * delta;
      const s = ( (text.direction === 1 ? 1 : -1) * 25) * Math.sin(text.y / 60) + text.default;
      text.x = s;
      if (text.y <= 0) {
        this.duel.pApp.stage.removeChild(text);
      }
    });
  }


  update(delta) {
    if (!this.duel.isStarted || !this.isMyTurn || !this.target) {
      return;
    }
    if (!this.attacking && !this.attacked && !this.intersect(this.target.spine)) {
      (!this.side) ? this.spine.x += FIGHT_SPEED * delta : this.spine.x -= FIGHT_SPEED * delta;
    } else if (!this.attacked && !this.attacking) {
      this.attacking = true;
      this.onAttack();
    }
    if (this.attacked) {
      (!this.side) ? this.spine.x -= FIGHT_SPEED * delta : this.spine.x += FIGHT_SPEED * delta;
    }
    if (this.isMyTurn && this.attacked && (!this.side && this.spine.x <= SPAWN_PLAYER) || (this.side && this.spine.x >= SPAWN_ENEMY)) {
      this.endTurn();
    }
  }

}
