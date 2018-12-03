import {Store} from "@ngxs/store";

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
  ATTACK,
  RETREAT
}

export class Character implements ICharacter {
  /* CHARACTER */
  _id: string;
  con: number;
  dex: number;
  level: number;
  name: string;
  sta: number;
  str: number;
  user_id: string;

  /* PIXI */
  sprite: any;
  ticker: any;
  pApp: any;
  spine: any;
  state: CharacterState;
  x: number;
  y: number;

  constructor(pApp, x, y) {
    this.pApp = pApp;
    this.x = x;
    this.y = y;

    if (!PIXI.loader.resources.spineboy) {
      PIXI.loader.add('spineboy', '/assets/spine/warrior/warrior.json')
        .load((loader, res) => this.onAssetsLoaded(res));
      return;
    }
    this.onAssetsLoaded();
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

    this.spine.stateData.setMix('run', 'jump', 0.2);
    this.spine.stateData.setMix('jump', 'run', 0.4);

    this.spine.state.setAnimation(0, 'run', true);

    this.pApp.stage.addChild(this.spine);

    this.pApp.stage.on('pointerdown', () => {
      if (this.spine.state.getCurrent(0).animation.name === 'jump'
      || this.spine.y < this.pApp.screen.height) {
        return;
      }
      this.spine.state.setAnimation(0, 'jump', false);
      this.spine.state.addAnimation(0, 'run', true, 0);
    });

    this.state = CharacterState.ATTACK;

    this.ticker = new PIXI.ticker.Ticker()
      .add((delta) => this.update(delta))
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

  setAttachment(slotName: string, attachmentName: string) {
    this.spine.skeleton.setAttachment(slotName, attachmentName);
  }

  update(delta) {


    if (this.spine.x >= this.pApp.screen.width) {
      this.flipX(false);
      this.state = CharacterState.RETREAT;
      this.hitWall();
    } else if (this.spine.x <= 0) {
      this.flipX(true);
      this.state = CharacterState.ATTACK;
      this.hitWall();
    }

    if (this.spine.state.getCurrent(0).animation.name === 'jump') {
      this.spine.y -= 3 * delta;
    } else if (this.spine.y < this.pApp.screen.height) {
      this.spine.y += 7 * delta;
    }

    switch (this.state) {
      case CharacterState.ATTACK: {
        this.spine.x += 4 * delta;
        break;
      }
      case CharacterState.RETREAT: {
        this.spine.x -= 4 * delta;
        break;
      }
    }
  }

}
