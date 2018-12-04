import {Store} from '@ngxs/store';

declare var PIXI: any;
import 'pixi-spine';

export interface ICharacter {
  _id: string;
  name: string;
  level: number;
  sta: number;
  str: number;
  con: number;
  dex: number;
  user_id: string;
}

export enum CharacterState {
  IDLE,
  RUN,
  ATTACK,
  RETREAT
}

export class Character implements ICharacter {

  constructor(c: ICharacter, pApp, x, y) {
    this.pApp = pApp;
    this.x = x === 0 ? 0 + 50 : x;
    this.y = y;

    this.setCharacter(c);

    if (!PIXI.loader.resources.spineboy) {
      PIXI.loader.add('spineboy', '/assets/spine/warrior/warrior.json')
        .load((loader, res) => this.onAssetsLoaded(res));
      return;
    }
    this.onAssetsLoaded();
  }
  /* CHARACTER */
  _id: string;
  name: string;
  con: number;
  dex: number;
  level: number;
  sta: number;
  str: number;
  user_id: string;

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

  static intersect(a, b) {
    const ab = a.getBounds();
    const bb = b.getBounds();
    return ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + ab.height > bb.y && ab.y < bb.y + bb.height;
  }

  setCharacter(c: ICharacter) {
    this._id = c._id;
    this.name = c.name;
  }

  onAssetsLoaded(res = null) {

    if (res) {
      this.spine = new PIXI.spine.Spine(res.spineboy.spineData);
    } else {
      this.spine = new PIXI.spine.Spine(PIXI.loader.resources.spineboy.spineData);
    }

    this.spine.skeleton.setSkinByName('leather_armor');
    this.spine.skeleton.setAttachment('arm_sword', 'leather');

    this.spine.x = this.x;
    this.spine.y = this.y;

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
        this.checkCollisions();
        this.setAnimation();
        this.update(delta);
      })
      .start();
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
        this.spine.state.setAnimation(0, 'idle', true);
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
    }, wait);
    this.queue.shift();
    this.target.queue.shift();
    this.state = CharacterState.RETREAT;
    this.spine.state.addAnimation(0, 'run', true);
  }

  update(delta) {

    if (!this.target || !this.ready) {
      return;
    }

    if (!this.attacked && this.ready && this.queue.length > 0) {
      this.attack();
    }

    if (this.spine.state.getCurrent(0).animation.name === 'jump') {
      this.spine.y -= 3 * delta;
    } else if (this.spine.y < this.pApp.screen.height) {
      this.spine.y += 7 * delta;
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
