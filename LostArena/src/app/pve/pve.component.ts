import {Component, OnInit, ViewChild} from '@angular/core';
import {MonsterService} from "../../services/monster.service";
import {Observable} from "rxjs";
import {Duel, DuelLog, IMonster} from "../../classes/duel";
import {UserState} from "../stores/states/user.state";
import {Character, ICharacter} from "../models/Character";
import {SetCharacters} from "../stores/actions/character.actions";
import {Select, Store} from "@ngxs/store";
import {CharacterService} from "../../services/character.service";
import {SocketService} from "../../services/socket.service";
import {first} from "rxjs/operators";

declare var PIXI: any;


@Component({
  selector: 'app-pve',
  templateUrl: './pve.component.html',
  styleUrls: ['./pve.component.scss']
})
export class PveComponent implements OnInit {

  public pApp: any;
  selectedCharacter: ICharacter;
  @ViewChild('pixiContainer') pixiContainer;
  duel: Duel;
  @Select(UserState.selectedCharacter) selectedCharacter$: Observable<ICharacter>;
  monsters: Observable<IMonster[]>;

  constructor(private monsterService: MonsterService, private store: Store, private characterService: CharacterService, private socket: SocketService) { }

  ngOnInit() {
    this.selectedCharacter = this.store.selectSnapshot(UserState.selectedCharacter);
    this.monsters = this.monsterService.getMonsters();
      this.pApp = new PIXI.Application({
        resolution: window.devicePixelRatio || 1,
        height: 600,
        width: 1000,
        backgroundColor: 0x1099bb,
        antialias: true,
      });
      this.pixiContainer.nativeElement.appendChild(this.pApp.view);
      this.pApp.stage.interactive = true;
      this.pApp.resolution = 0.1;

      const text = new PIXI.Text('Loading assets', {
        fill: '#555555',
        font: '48px Arial',
        wordWrap: true,
        wordWrapWidth: 700
      });
      text.x = this.pApp.screen.width / 2 - text.width / 2;
      text.y = this.pApp.screen.height / 2;
      this.pApp.stage.addChild(text);

      // add all the assets that you want to load
    this.pApp.loader.add('spineboy', '/assets/spine/warrior/warrior.json');
    this.pApp.loader.add('chicken', '/assets/spine/monsters/spine_data/Chicken.json');
    this.pApp.loader.add('yeti', '/assets/spine/monsters/spine_data/yeti.json');
    this.pApp.loader.add('tree', '/assets/spine/monsters/spine_data/tree.json');
    this.pApp.loader.add('bat', '/assets/spine/monsters/spine_data/bat.json');
    this.pApp.loader.add('ginseng', '/assets/spine/monsters/spine_data/ginseng.json');
    this.pApp.loader.add('mummy', '/assets/spine/monsters/spine_data/mummy.json');
      this.pApp.loader.add('bg-1', '/assets/backgrounds/bg-.png');

      const baseTexture = new PIXI.BaseTexture.fromImage('/assets/backgrounds/bg-1.png', false, PIXI.SCALE_MODES.NEAREST);
      const size = new PIXI.Rectangle(16, 32, 16, 16);
      const texture = new PIXI.Texture(baseTexture, size);

      const hawaii = PIXI.Sprite.fromImage('/assets/backgrounds/bg-1.png');
      // center the sprite anchor point
      hawaii.anchor.x = 0;
      hawaii.anchor.y = 0;

      // move the sprite to the center of the canvas
      hawaii.position.x = 0;
      hawaii.position.y = 0;

      hawaii.scale.x = 0.27;
      hawaii.scale.y = 0.27;
      console.log(hawaii);

      this.pApp.stage.addChild(hawaii);

      // listen to fzefze progress event
      this.pApp.loader.on('progress', (l, res) => {
        text.text = l.progress;
        text.x = this.pApp.screen.width / 2 - text.width / 2;
      });
      // listen to the complete event, it will be fired when everything is loaded
      this.pApp.loader.on('complete', (l, res) => {
        text.destroy();
        // this.duel = new Duel();
        /*this.selectedCharacter$.subscribe((c) => {
          this.player = new Character(c, this.pApp, SPAWN_PLAYER, this.pApp.screen.height);
          this.enemy = new Character(c, this.pApp, SPAWN_ENEMY, this.pApp.screen.height);
          this.enemy.flipX(false);
        });*/
      });
      // start loading
      this.pApp.loader.load();
      this.adjustCanvasSize();
    }


  adjustCanvasSize() {
    const scaleFactor = Math.min(
      window.innerWidth / 1200,
      window.innerHeight / 1100
    );
    const newWidth = Math.ceil(1000 * scaleFactor);
    const newHeight = Math.ceil(600 * scaleFactor);

    this.pApp.renderer.view.style.width = `${newWidth}px`;
    this.pApp.renderer.view.style.height = `${newHeight}px`;

    this.pApp.renderer.resize(newWidth, newHeight);
    this.pApp.stage.scale.set(scaleFactor);
  }

  async startFight(enemyId) {
    const character = await this.store.selectOnce(UserState.selectedCharacter).toPromise();


    const duel: DuelLog = await this.characterService.startPveFight(character._id, enemyId).toPromise();
    if (this.duel) {
      this.duel.delete();
    }
    console.log(duel);
    this.duel = new Duel(this.pApp, duel, this.store, true);
    this.characterService.getMyCharacters().subscribe((characters: Character[]) => {
    });
  }
}
