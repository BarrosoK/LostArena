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

  constructor(pApp) {
    this.pApp = pApp;

    if (!PIXI.loader.resources.spineboy) {
      PIXI.loader.add('spineboy', '/assets/spine/human/human.json').load((loader, res) => this.onAssetsLoaded(res));
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

    this.spine.x = this.pApp.screen.width / 2;
    this.spine.y = this.pApp.screen.height;

    this.spine.scale.set(0.5);

    this.spine.stateData.setMix('walk', 'jump', 0.2);
    this.spine.stateData.setMix('jump', 'walk', 0.4);

    this.spine.state.setAnimation(0, 'walk', true);

    this.pApp.stage.addChild(this.spine);

    this.pApp.stage.on('pointerdown', () => {
      console.log('oui');
      if (this.spine.state.getCurrent(0).animation.name === 'jump') {
        return;
      }
      this.spine.state.setAnimation(0, 'jump', false);
      this.spine.state.addAnimation(0, 'walk', true, 0);
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

  update(delta) {


    if (this.spine.x >= this.pApp.screen.width) {
      this.flipX(true);
      this.state = CharacterState.RETREAT;
    } else if (this.spine.x <= 0) {
      this.flipX(false);
      this.state = CharacterState.ATTACK;
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
