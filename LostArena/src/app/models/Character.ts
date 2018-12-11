import {Store} from '@ngxs/store';

declare var PIXI: any;
import 'pixi-spine';
import {BehaviorSubject, Observable, Subject} from 'rxjs';

export interface ICharacter {
  _id: string;
  name: string;
  level: number;
  sta: number;
  str: number;
  con: number;
  dex: number;
  user_id: string;
  equipped: Object;
}

export const SPAWN_PLAYER = 150;
export const SPAWN_ENEMY = 650;
export const DEFAULT_Y = 500;

export const EquipmentParts = [
  'head',
  'weapon'
];


export enum CharacterState {
  IDLE,
  RUN,
  ATTACK,
  RETREAT,
  DEAD,
  WON
}

export class Character implements ICharacter {

  constructor(c: ICharacter, pApp = null, x = null, y = null) {
    this.setCharacter(c);
    if (!pApp) {
      return;
    }
    this.pApp = pApp;
    this.equipped = c.equipped;
    this.x = x === 0 ? 0 + 50 : x;
    this.y = y;
    this.inFight = new BehaviorSubject<boolean>(false);
    this.maximumHealth = 100;
    this.currentHealth = this.maximumHealth;
    this.healthText = new PIXI.Text(this.currentHealth + '/' + this.maximumHealth, {
      fill: '#555555',
      font: '48px Arial',
      wordWrap: true,
      wordWrapWidth: 700
    });
    this.pApp.stage.addChild(this.healthText);
    this.onAssetsLoaded();
  }

  /* CHARACTER */
  _id: string;
  name: string;
  user_id: string;

  /* BASE STATS */
  con: number;
  dex: number;
  level: number;
  sta: number;
  str: number;

  /* ITEM */
  equipped: Object;

  /* DERIVED STATS */
  currentHealth: number;
  maximumHealth: number;

  /* COMBAT VAR */
  target: Character;

  /* PIXI */
  sprite: any;
  ticker: any;
  pApp: any;
  spine: any;
  state: CharacterState;
  x: number;
  y: number;
  ready = false;
  queue = [];
  attacked = false;
  dirty = false;
  delta: number;
  inFight: BehaviorSubject<boolean>;

  /* UI */
  healthText;

  static intersect(a, b) {
    const ab = a.getBounds();
    const bb = b.getBounds();
    return ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + ab.height > bb.y && ab.y < bb.y + bb.height;
  }

   getStr() {
    let value = this.str;
    if (this.equipped) {
      EquipmentParts.forEach((p) => {
        const part = this.equipped[p];
        if (part && part['bonus']['STR']) {
          value += part['bonus']['STR'];
        }
      });
    }
    return value;
  }

  getSta() {
    let value = this.sta;
    if (this.equipped) {
      EquipmentParts.forEach((p) => {
        const part = this.equipped[p];
        if (part && part['bonus']['STA']) {
          value += part['bonus']['STA'];
        }
      });
    }
    return value;
  }

  getCon() {
    let value = this.con;
    if (this.equipped) {
      EquipmentParts.forEach((p) => {
        const part = this.equipped[p];
        if (part && part['bonus']['CON']) {
          value += part['bonus']['CON'];
        }
      });
    }
    return value;
  }

  setCharacter(c: ICharacter) {
    this.equipped = c.equipped;
    this._id = c._id;
    this.name = c.name;
    this.str = c.str;
    this.sta = c.sta;
    this.con = c.con;
    this.user_id = c.user_id;
    this.level = c.level;
  }

  setFightStatus(newValue: boolean): void {
    this.inFight.next(newValue);
  }

  getFightStatus(): Observable<boolean> {
    return this.inFight.asObservable();
  }

  onAssetsLoaded(res = null) {

    if (res) {
      this.spine = new PIXI.spine.Spine(res.spineboy.spineData);
    } else {
      this.spine = new PIXI.spine.Spine(this.pApp.loader.resources.spineboy.spineData);
    }

    this.spine.skeleton.setSkinByName('leather_armor');
    this.spine.skeleton.setAttachment('arm_sword', 'leather');

    this.spine.x = this.x;
    this.spine.y = DEFAULT_Y;

    this.spine.scale.set(0.5);
    this.flipX(true);

    this.spine.stateData.setMix('run', 'idle', 0.2);
    this.spine.stateData.setMix('idle', 'run', 0.2);

    this.spine.stateData.setMix('jump', 'run', 0.2);
    this.spine.stateData.setMix('run', 'jump', 0.4);

    this.spine.state.setAnimation(0, 'idle', true);

    this.pApp.stage.addChild(this.spine);


    /*
    this.pApp.stage.on('pointerdown', () => {
      if (this.spine.state.getCurrent(0).animation.name === 'jump'
        || this.spine.y < this.pApp.screen.height) {
        return;
      }
      this.spine.state.setAnimation(0, 'jump', false);
      this.spine.state.addAnimation(0, 'run', true, 0);
    });
    */

    this.state = CharacterState.IDLE;

    this.ticker = new PIXI.ticker.Ticker()
      .add((delta) => {
        if (!this.spine) {
          return;
        }
        this.checkCollisions();
        this.setAnimation();
        this.update(delta);
      })
      .start();
  }

  reset() {
    this.currentHealth = this.maximumHealth;
    this.state = CharacterState.IDLE;
  }

  flipX(value: boolean) {
    this.spine.skeleton.flipX = value;
  }

  rotate(value) {
    this.sprite.rotation += value;
  }

  hitWall() {
  }

  getCurrentAnimationName(index = 0) {
    return this.spine.state.getCurrent(index).animation.name;
  }

  setAnimation() {
    switch (this.state) {
      case CharacterState.ATTACK: {

        break;
      }
      case CharacterState.RETREAT: {
        if (this.spine.state.getCurrent(0).animation.name === 'run') {
          return;
        }
        if (this.getCurrentAnimationName() === 'attack_01') {
          this.spine.state.addAnimation(0, 'run', true);
        } else {
          this.spine.state.setAnimation(0, 'run', true);
        }
        break;
      }
      case CharacterState.RUN: {
        if (this.spine.state.getCurrent(0).animation.name === 'run') {
          return;
        }
        this.spine.state.setAnimation(0, 'run', true);
        break;
      }
      case CharacterState.IDLE: {
        if (this.spine.state.getCurrent(0).animation.name === 'idle') {
          return;
        }
        this.spine.state.addAnimation(0, 'idle', true);
        break;
      }
    }

  }

  checkCollisions() {
    if (this.getCurrentAnimationName() !== 'idle') {

      // Target
      if (!this.attacked && Character.intersect(this.spine, this.target.spine)) {
        this.attacked = true;
        this.onAttack();
      }


      // WALL
      if (this.spine.x >= this.pApp.screen.width) {
        this.flipX(false);

        this.state = CharacterState.RETREAT;
        this.hitWall();
      } else if (this.spine.x <= 0) {
        this.flipX(true);

        this.state = CharacterState.ATTACK;
        this.hitWall();
      }


    }
  }

  setAttachment(slotName: string, attachmentName: string) {
    this.spine.skeleton.setAttachment(slotName, attachmentName);
  }

  startFight(target: Character) {
    this.target = target;
    target.startFight(this);
  }

  setTarget(target: Character) {
    this.target = target;
    if (this.target.spine.x < this.spine.x) {
      this.flipX(false);
    } else {
      this.flipX(true);
    }
  }

  doAttack(target: Character) {
    this.pApp.ticker.add((delta) => {
      this.spine.x += 1 * delta;
      if (this.spine.x > 300) {
      }
    }).start();
  }

  attack(target: Character = null) {
    const toAttack = target ? target : this.target;
    this.target = toAttack;
    this.ready = true;
    this.attacked = false;
    this.state = CharacterState.RUN;
    this.dirty = false;
  }

  onAttack() {
    this.state = CharacterState.ATTACK;
    const wait = this.spine.state.setAnimation(0, 'attack_01', false).animationEnd * 1000;
    setTimeout(() => {
      // OnComplete broken as fck
      this.flipX(!this.spine.skeleton.flipX);
      this.target.currentHealth -= +this.queue[0]['attack']['damages'];
      console.log(this.queue[0]);
      this.queue.shift();
      this.target.queue.shift();
      this.state = CharacterState.RETREAT;
      this.spine.state.addAnimation(0, 'run', true);
      if (this.target.currentHealth <= 0) {
        this.end();
        this.target.doDie();
        this.win();
      } else {
        this.target.hit();
      }
    }, wait);
  }

  end() {
    this.target.setFightStatus(false);
    this.setFightStatus(false);
  }

  hit() {
    this.spine.state.setAnimation(0, 'hit', false);
  }

  win() {
    this.state = CharacterState.WON;
    this.spine.state.setAnimation(0, 'jump', true);
  }

  doDie() {
    this.state = CharacterState.DEAD;
    this.spine.state.setAnimation(0, 'dying', false);
  }

  update(delta) {

    if (this.currentHealth <= 0) {
      this.currentHealth = 0;
      this.healthText.text = this.currentHealth + '/' + this.maximumHealth;
      return;
    }
    this.healthText.text = Math.floor(this.currentHealth) + '/' + this.maximumHealth;
    this.healthText.x = this.spine.x - this.healthText.width / 2;
    this.healthText.y = DEFAULT_Y - this.spine.height - 50;

    if (!this.target || !this.ready) {
      return;
    }

    if (!this.attacked && this.ready && this.queue.length > 0) {
      this.attack();
    }


    switch (this.state) {
      case CharacterState.RUN: {
        if (this.spine.x < this.target.x) {
          this.spine.x += 4 * delta;
        } else {
          this.spine.x -= 4 * delta;
        }
        break;
      }
      case CharacterState.RETREAT: {
        if (this.getCurrentAnimationName() === 'attack_01') {
          return;
        }
        if (this.attacked && (this.spine.x <= (0 + 150) || this.spine.x >= (this.pApp.screen.width - 150))) {
          this.state = CharacterState.IDLE;
          this.ready = false;
          if (this.queue.length === 0) {
            console.log('END');
            return;
          }
          if (this.queue[0]['attacker']['id'] === this._id) {
            this.attack();
          } else {
            this.target.attack();
          }
          this.flipX(!this.spine.skeleton.flipX);
          return;
        }
        if (this.spine.x < this.target.x) {
          this.spine.x -= 4 * delta;
        } else {
          this.spine.x += 4 * delta;
        }
        break;
      }
    }
  }

}
