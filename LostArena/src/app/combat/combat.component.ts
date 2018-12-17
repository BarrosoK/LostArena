import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ICharacter, Character, SPAWN_PLAYER, SPAWN_ENEMY} from '../models/Character';
import {Store} from '@ngxs/store';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {UserState} from '../stores/states/user.state';
import {map} from 'rxjs/operators';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {CharacterService} from '../../services/character.service';
import {SocketService} from '../../services/socket.service';
import {AddMessageCombat} from '../stores/actions/socket.actions';

declare var PIXI: any;

@Component({
  selector: 'app-combat',
  templateUrl: './combat.component.html',
  styleUrls: ['./combat.component.scss']
})
export class CombatComponent implements OnInit, OnDestroy {

  constructor(private breakpointObserver: BreakpointObserver, private store: Store,
              private characterService: CharacterService, private socket: SocketService) {
    CombatComponent.inFight = new BehaviorSubject<boolean>(false);
    this.subject.subscribe(n => console.log(n));
    this.selectedCharacter$ = this.store.select(UserState.selectedCharacter);
    this.characters = this.characterService.getCharacters();
  }


  static inFight: BehaviorSubject<boolean>;
  isMobile = false;

  @ViewChild('pixiContainer') pixiContainer;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  public pApp: any;
  sprites: Map<string, any> = new Map();
  selectedCharacter$: Observable<ICharacter>;
  player: Character;
  enemy: Character;

  characters: Observable<ICharacter[]>;
  subject = new Subject();

  width = 800;
  height = 600;

  static setTheBoolean(newValue: boolean): void {
    CombatComponent.inFight.next(newValue);
  }

  getFightStatus(): Observable<boolean> {
    return CombatComponent.inFight.asObservable();
  }

  ngOnDestroy() {
    this.pApp.stage.destroy();
    this.pApp.renderer.destroy();
    this.pApp.loader.destroy();
    console.log('destroyed', this.pApp);
  }

  ngOnInit() {
    this.isHandset$.subscribe((onMobile) => {
      this.isMobile = onMobile;
    });

    this.pApp = new PIXI.Application({
      resolution: this.isMobile ? 0.45 : 1,
      height: this.height,
      width: this.width,
      backgroundColor: 0x1099bb,
      antialias: true
    });
    this.pixiContainer.nativeElement.appendChild(this.pApp.view);
    this.pApp.stage.interactive = true;
    this.pApp.resolution = 0.1;
    window.addEventListener('resize', () => {
      this.pApp.resolution = 0.45;
    });

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
      this.selectedCharacter$.subscribe((c) => {
        this.player = new Character(c, this.pApp, SPAWN_PLAYER, this.pApp.screen.height);
        this.enemy = new Character(c, this.pApp, SPAWN_ENEMY, this.pApp.screen.height);
        this.enemy.flipX(false);
      });
    });
    // start loading
    this.pApp.loader.load();
  }

  changeWeapon(sword: string) {
    this.player.changeSkin(sword);
    // this.player.setAttachment('body', sword);
  }

  async fight(target: Character) {

    this.subject.next(true);

    const enemyId = target._id;

    this.player.setTarget(this.enemy);
    this.enemy.setTarget(this.player);
    this.enemy.setCharacter(target);

    this.player.reset();
    this.player.spine.x = SPAWN_PLAYER;
    this.enemy.reset();
    this.enemy.spine.x = SPAWN_ENEMY;

    this.player.setFightStatus(true);
    this.selectedCharacter$.subscribe((c: ICharacter) => {
      const playerId = c._id;
      this.characterService.startFight(playerId, enemyId).subscribe((logs) => {
        logs['logs']['turns'].forEach((turn) => {
          this.player.queue.push(turn);
          this.enemy.queue.push(turn);
        });
        if (logs['logs']['turns'][0]['attacker']['id'] === playerId) {
          this.player.attack();
        } else {
          this.enemy.attack();
        }
      });
    });
    let waitingResult = '';
    this.socket.getMessageCombat().then((m) => {
      console.log(m.toString());
      waitingResult = m.toString();
    });
    const tst = this.player.getFightStatus().subscribe((inFight) => {
      if (!inFight) {
        console.log('add', waitingResult);
        this.store.dispatch(new AddMessageCombat(waitingResult));
        tst.unsubscribe();
      }
    });
  }
}
