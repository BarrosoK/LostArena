import {Component, OnInit, ViewChild} from '@angular/core';
import {Character, ICharacter, SPAWN_ENEMY, SPAWN_PLAYER} from '../models/Character';
import {BreakpointObserver} from '@angular/cdk/layout';
import {Select, Store} from '@ngxs/store';
import {CharacterService} from '../../services/character.service';
import {SocketService} from '../../services/socket.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {UserState} from '../stores/states/user.state';
import {Duel, DuelLog} from '../../classes/duel';
import {SetCharacters} from "../stores/actions/character.actions";
import {first} from "rxjs/operators";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
declare var PIXI: any;


@Component({
  selector: 'app-fight',
  templateUrl: './fight.component.html',
  styleUrls: ['./fight.component.scss']
})
export class FightComponent implements OnInit {

  public pApp: any;
  selectedCharacter: ICharacter;
  @ViewChild('pixiContainer') pixiContainer;
  duel: Duel;
  @Select(UserState.selectedCharacter) selectedCharacter$: Observable<ICharacter>;
  characters: Observable<ICharacter[]>;
  last;
  step = 0;
  extendProfile = false;

  setStep(index: number) {
    this.step = index;
  }

  nextStep(step) {
    this.step = step;
  }

  prevStep() {
    this.step--;
  }

  constructor(private store: Store, private characterService: CharacterService, private socket: SocketService) {
    this.selectedCharacter = this.store.selectSnapshot(UserState.selectedCharacter);
    this.characters = this.characterService.getCharacters();
  }

  ngOnInit() {

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

  extend() {
    this.extendProfile = !this.extendProfile;
  }

  async startFight(enemy) {
    const character = await this.store.selectOnce(UserState.selectedCharacter).toPromise();
    if (character._id === enemy._id) {
      return;
    }
    this.selectedCharacter = enemy;
    const duel: DuelLog = await this.characterService.startFight(character._id, enemy._id).toPromise();
    if (this.duel) {
      this.duel.delete();
    }
    this.duel = new Duel(this.pApp, duel, this.store);
    this.characterService.getMyCharacters().subscribe((characters: Character[]) => {
      this.store.dispatch(new SetCharacters(characters));
    });
  }

  drop(event: CdkDragDrop<any>) {
    const t = [];
    moveItemInArray(t, event.previousIndex, event.currentIndex);
  }

  noReturnPredicate() {
    return true;
  }
}
