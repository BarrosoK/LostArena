import {Store} from '@ngxs/store';

declare var PIXI: any;
import 'pixi-spine';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {SocketService} from '../../services/socket.service';
import {IBonus} from './Item';
// @ts-ignore
import Container = PIXI.Container;
// @ts-ignore
import Graphics = PIXI.Graphics;

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
  exp: number;
}

/* GAME CONFIG */
export const DEFAULT_Y = 500;
export const SPAWN_PLAYER = 200;
export const SPAWN_ENEMY = 600;

/* SPEED CONFIG */
export const TIME_SCALE = 1.80; // ANIAMTION SPEED
export const FIGHT_SPEED = 8; // COMBAT SPEED
export const SPEED = 4; // CHATROOM SPEED

/* UI CONFIG */
export const NAME_UP = false;
export const PROGRESSBAR_OFFSET = 0;
export const PROGRESSBAR_HEALTH_WIDTH = 300;
export const PROGRESSBAR_HEALTH_HEIGHT = 30;
export const PROGRESSBAR_BORDER = 3.5;

export const EquipmentParts = [
  'head',
  'weapon',
  'chest'
];

export enum CharacterState {
  IDLE,
  RUN,
  ATTACK,
  RETREAT,
  DEAD,
  WON
}

export enum CharacterMoveDirection {
  RIGHT,
  LEFT,
  JUMP,
  FALLING,
  IDLE
}

export class CharacterChat {

  id: number;
  name: string;
  position: Object;
  oldPosition: Object;
  moveState: CharacterMoveDirection;
  faceState: CharacterMoveDirection;
  isMoving = false;
  isFalling = false;
  isJumping = false;
  socket: SocketService;

  /* PIXI */
  pApp: any;
  ticker: any;
  spine: any;
  date: number;

  /* UI */
  nameText;
  chatText;
  toDelete;

  constructor(pApp: any, name: string, position: Object = {x: 0, y: 0}, socket: SocketService = null) {
    this.pApp = pApp;
    this.name = name;
    this.position = position;
    this.oldPosition = {x: 0, y: 0};
    this.date = Date.now();
    if (socket) {
      this.socket = socket;
    }
    this.moveState = CharacterMoveDirection.IDLE;
    this.faceState = CharacterMoveDirection.IDLE;
    this.initPixi();
    this.nameText = new PIXI.Text('', {
      fill: '#555555',
      font: '48px Arial',
      wordWrap: true,
      wordWrapWidth: 700
    });
    this.pApp.stage.addChild(this.nameText);
    this.chatText =  new PIXI.Text('', {
      fill: '#555555',
      font: '48px Arial',
      wordWrap: true,
      wordWrapWidth: 700
    });
  }

  addChat(text) {
    this.chatText.text = text;
    this.chatText.x = this.spine.x;
    this.chatText.y = this.spine.y - this.spine.height - 50;
    this.pApp.stage.addChild(this.chatText);
    this.toDelete = Date.now() + 5000;
  }

  remove() {
    this.pApp.stage.removeChild(this.nameText);
    this.pApp.stage.removeChild(this.spine);
  }

  initPixi() {
    this.spine = new PIXI.spine.Spine(this.pApp.loader.resources.spineboy.spineData);

    this.spine.skeleton.setSkinByName('leather_armor');
    this.spine.skeleton.setAttachment('arm_sword', 'leather');

    this.spine.x = this.position['x'];
    this.spine.y = this.pApp.screen.height;

    this.spine.scale.set(0.5);

    this.spine.stateData.setMix('run', 'idle', 0.2);
    this.spine.stateData.setMix('idle', 'run', 0.2);

    this.spine.stateData.setMix('jump', 'run', 0.2);
    this.spine.stateData.setMix('run', 'jump', 0.4);

    this.spine.state.setAnimation(0, 'idle', true);
    this.pApp.stage.addChild(this.spine);


    /*
    this.pApp.stage.on('pointerdown', () => {

    });
    */


    this.ticker = new PIXI.ticker.Ticker()
      .add((delta) => {
        this.update(delta);
        this.updateUi(delta);
      })
      .start();
  }

  setMovingDirection(state: CharacterMoveDirection) {

    if (state === CharacterMoveDirection.RIGHT || state === CharacterMoveDirection.LEFT) {
      this.isMoving = true;
    } else {
      this.isMoving = false;
    }

    if (state === CharacterMoveDirection.RIGHT && this.faceState !== state) {
      this.faceState = CharacterMoveDirection.RIGHT;
      this.flipX(true);
    } else if (state === CharacterMoveDirection.LEFT && this.faceState !== state) {
      this.faceState = CharacterMoveDirection.LEFT;
      this.flipX(false);
    }
    if (state === CharacterMoveDirection.FALLING) {
      this.isFalling = true;
    }
    this.moveState = state;

    if (this.isMoving && this.getCurrentAnimationName() !== 'run' && (this.moveState === CharacterMoveDirection.RIGHT || this.moveState === CharacterMoveDirection.LEFT)) {
      this.spine.state.setAnimation(0, 'run', true);
      this.socket.sendState('run');
    } else if (!this.isMoving && !this.isFalling) {
      this.spine.state.setAnimation(0, 'idle', true);
      this.socket.sendState('idle');
    }
  }

  updateUi(delta) {
    this.nameText.text = this.name;
    this.nameText.x = this.spine.x - (this.nameText.width / 2);
    this.nameText.y = this.spine.y - this.spine.height -  50;
    if (this.chatText.text.length > 0) {
      this.chatText.x = this.spine.x - (this.chatText.width / 2);
      this.chatText.y = this.spine.y - this.spine.height - 100;
      if (Date.now() > this.toDelete) {
        this.chatText.text = '';
        this.pApp.stage.removeChild(this.chatText);
      }
    }
  }

  update(delta) {

    if (this.isJumping && this.spine.y < this.pApp.screen.height - 150) {
      this.isFalling = true;
      console.log('changed');
    }
    if (this.isFalling && this.spine.y >= this.pApp.screen.height) {
      this.isFalling = false;
      this.isJumping = false;
      this.spine.state.clearTrack(1);
      this.setMovingDirection(CharacterMoveDirection.IDLE);
    }

    if (this.isFalling) {
      if (this.spine.y >= this.pApp.screen.height) {
        this.spine.y = this.pApp.screen.height;
        this.isFalling = false;
        this.socket.sendState('idle');
        this.spine.state.clearTrack(1);
        this.setMovingDirection(CharacterMoveDirection.IDLE);
        return;
      }
        this.spine.y += SPEED * delta;
    } else if (this.isJumping) {
      this.spine.y -= SPEED / 1.5 * delta;
    }

    switch (this.moveState) {
      case CharacterMoveDirection.RIGHT: {
        this.spine.x += SPEED * delta;
        break;
      }
      case CharacterMoveDirection.LEFT: {
        this.spine.x -= SPEED * delta;
        break;
      }
      case CharacterMoveDirection.IDLE: {
        this.isMoving = false;
        break;
      }
    }
    this.position['x'] = this.spine.x;
    this.position['y'] = this.spine.y;

    this.nameText.x = this.spine.x - this.nameText.width / 2;
    this.nameText.y = DEFAULT_Y - this.spine.height - 50;

    if (this.socket && (this.isMoving || this.isJumping || this.isFalling) &&
      (this.position['x'] !== this.oldPosition['x'] || this.position['y'] !== this.oldPosition['y'])) {
      // MY CHARACTER
      this.socket.move(this.position, this.spine.skeleton.flipX);
      this.oldPosition['x'] = this.position['x'];
    }
    if (this.socket && !this.isMoving && Date.now() > this.date + 5000) {
      this.date = Date.now();
      this.socket.sendState('idle');
    }
  }

  jump() {
    if (this.isJumping || this.isFalling) {
      return;
    }
    this.isJumping = true;
    this.spine.state.setAnimation(1, 'jump', true);
    this.socket.sendState('jump', true, 0);
  }

  flipX(value: boolean) {
    this.spine.skeleton.flipX = value;
  }
  getCurrentAnimationName(index = 0) {
    return this.spine.state.getCurrent(index).animation.name;
  }


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

    // Create health percentage text
    this.nameText = new PIXI.Text('', {
      fill: [
        '#4163ec',
        '#5267bb',
        '#08195f'
      ],
      fontFamily: 'Arial Black',
      fontStyle: 'italic',
      fontWeight: 'bold',
      strokeThickness: 1
    });

    // Create health percentage text
    this.healthPbPercent = new PIXI.Text('100%', {
      fill: [
        '#63e882',
        '#41a746',
        '#137c28'
      ],
      fontFamily: 'Arial Black',
      fontStyle: 'italic',
      fontWeight: 'bold',
      strokeThickness: 1
    });

    // Create the health bar
    this.healthPb = new Container();
    this.healthPb.position.set(x === SPAWN_PLAYER ?
      PROGRESSBAR_BORDER / 2 :
      this.pApp.screen.width - PROGRESSBAR_HEALTH_WIDTH - PROGRESSBAR_BORDER / 2, NAME_UP ? 40 : PROGRESSBAR_OFFSET);
    this.pApp.stage.addChild(this.healthPb);
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

    this.nameText.x = x === SPAWN_PLAYER ? PROGRESSBAR_HEALTH_WIDTH - this.nameText.width : 0;
    this.nameText.y = NAME_UP ? -PROGRESSBAR_HEALTH_HEIGHT : PROGRESSBAR_HEALTH_HEIGHT;

    this.healthPb.addChild(this.nameText);

    this.healthPb.outer = outerBar;
    this.onAssetsLoaded();
  }

  /* CHARACTER */
  _id: string;
  name: string;
  user_id: string;
  exp: number;

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
  uiText = [];

  /* UI */
  healthText;
  healthPb;
  healthPbPercent;
  nameText;

  static intersect(a, b) {
    const ab = a.getBounds();
    const bb = b.getBounds();
    const myWeaponWidth = a.skeleton.slots[0].attachment ? a.skeleton.slots[0].attachment.width : 0;
    const ennWeaponWidth = b.skeleton.slots[0].attachment ? b.skeleton.slots[0].attachment.width : 0;
    return ab.x + ab.width - myWeaponWidth > bb.x + ennWeaponWidth
      && ab.x + myWeaponWidth < bb.x + bb.width - ennWeaponWidth
      && ab.y + ab.height > bb.y
      && ab.y < bb.y + bb.height;
  }


  getWeapon() {
    if (!this.equipped) {
      return null;
    }
    return this.equipped['weapon'];
  }

  getStr() {
    let value = this.str;
    if (this.equipped) {
      EquipmentParts.forEach((p) => {
        const part = this.equipped[p];
        if (part && part.bonus) {
          part.bonus.forEach((b: IBonus) => {
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
      EquipmentParts.forEach((p) => {
        const part = this.equipped[p];
        if (part && part.bonus) {
          part.bonus.forEach((b: IBonus) => {
            if (b.stat === 'STA') {
              value += b.value;
            }
          });
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
        if (part && part.bonus) {
          part.bonus.forEach((b: IBonus) => {
            if (b.stat === 'CON') {
              value += b.value;
            }
          });
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
    this.exp = c.exp;
  }

  changeSkin(skin) {
    this.spine.skeleton.setSkinByName(skin);
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
        this.handleUi(delta);
        this.update(delta);
      })
      .start();

    this.spine.state.timeScale = TIME_SCALE;

  }

  reset() {
    this.currentHealth = this.maximumHealth;
    this.state = CharacterState.IDLE;
    this.nameText.text = this.name;
    this.nameText.x = this.x === SPAWN_PLAYER ? PROGRESSBAR_HEALTH_WIDTH - this.nameText.width : 0;
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
        if (this.getCurrentAnimationName().includes('attack_')) {
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
    this.spine.skeleton.setSkin(slotName, attachmentName);
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

    const isCrit = this.queue[0]['attack']['isCrit'];
    const isMiss = this.queue[0]['attack']['isMiss'];


    const wait = this.spine.state.setAnimation(0, 'attack_0' +  + (isCrit ? 3 : (Math.floor(Math.random() * (2) + 1))), false).animationEnd * 1000;
    const style = {
      'fontSize': 35,
      'dropShadow': true,
      'dropShadowAlpha': 0.4,
      'dropShadowAngle': 1,
      'dropShadowDistance': 4,
      'fill': [
        '#da4646',
        '#950909'
      ],
      'fontFamily': 'Arial Black',
      'fontStyle': 'italic',
      'fontWeight': 'bold',
      'strokeThickness': 1
    };
    setTimeout(() => {
      // OnComplete broken as fck
      let text = '';
      this.flipX(!this.spine.skeleton.flipX);
      if (isMiss) {
        text = 'MISS';
        style.fill = [
          '#4a72f6',
          '#3c5dca',
          '#193cad'
        ];
        style.fontSize = 40;
      } else {
        if (isCrit) {
          style.fontSize = 45;
          style.fill =  [
            '#ffcb0e',
            '#deb10d',
            '#ad9025'
          ];
        }
        this.target.currentHealth -= +this.queue[0]['attack']['damages'];
        text = this.queue[0]['attack']['damages'] + (isCrit ? '!!' : '');
      }
      console.log(this.queue[0]);
      const d = new PIXI.Text(text, style);

      d.direction = (Math.floor(Math.random() * 2) + 1);
      d.default = this.target.spine.x;
      d.x = this.target.spine.x;
      d.y = this.target.spine.y - this.target.spine.height;
      this.uiText.push(d);
      this.pApp.stage.addChild(d);
      this.state = CharacterState.RETREAT;
      this.spine.state.addAnimation(0, 'run', true);
      if (this.target.currentHealth <= 0) {
        this.end();
        this.target.doDie();
        this.win();
      } else {
        if (isMiss) {
          this.target.spine.state.setAnimation(0, ((Math.floor(Math.random() * 2) + 1) === 1) ? 'avoid' : 'defance', false);
        } else {
          this.target.hit();
        }
      }
      this.queue.shift();
      this.target.queue.shift();
    }, wait / TIME_SCALE);
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

  handleUi(delta) {
    let p = (this.currentHealth / this.maximumHealth  * PROGRESSBAR_HEALTH_WIDTH) - PROGRESSBAR_BORDER;
    if (p < 0) {
      p = 0;
    }
    this.healthPb.outer.width = p;
    this.healthPbPercent.text = Math.floor(this.currentHealth / this.maximumHealth * 100) + '%';
    this.healthPbPercent.x = (PROGRESSBAR_HEALTH_WIDTH / 2) - (this.healthPbPercent.width / 2);
    this.uiText.forEach((text) => {
      text.y -= 3 * delta;
      const s = ( (text.direction === 1 ? 1 : -1) * 25) * Math.sin(text.y / 60) + text.default;
      text.x = s;
      if (text.y <= 0) {
        this.pApp.stage.removeChild(text);
      }
    });
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

    // console.log(this.currentHealth / this.maximumHealth * 100);

    if (!this.target || !this.ready) {
      return;
    }

    if (!this.attacked && this.ready && this.queue.length > 0) {
      this.attack();
    }


    switch (this.state) {
      case CharacterState.RUN: {
        if (this.spine.x < this.target.x) {
          this.spine.x += FIGHT_SPEED * delta;
        } else {
          this.spine.x -= FIGHT_SPEED * delta;
        }
        break;
      }
      case CharacterState.RETREAT: {
        if (this.getCurrentAnimationName().includes('attack_')) {
          return;
        }
        if (this.attacked && (this.spine.x <= SPAWN_PLAYER || this.spine.x >= (SPAWN_ENEMY))) {
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
          this.spine.x -= FIGHT_SPEED * delta;
        } else {
          this.spine.x += FIGHT_SPEED * delta;
        }
        break;
      }
    }
  }

}
