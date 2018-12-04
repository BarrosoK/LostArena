import {Component, OnInit, ViewChild} from '@angular/core';
import {ICharacter, Character} from '../models/Character';
import {Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {UserState} from '../stores/states/user.state';
import {map} from 'rxjs/operators';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {CharacterService} from '../../services/character.service';

declare var PIXI: any;

@Component({
  selector: 'app-combat',
  templateUrl: './combat.component.html',
  styleUrls: ['./combat.component.scss']
})
export class CombatComponent implements OnInit {

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

  constructor(private breakpointObserver: BreakpointObserver, private store: Store,
              private characterService: CharacterService) {
    this.selectedCharacter$ = this.store.select(UserState.selectedCharacter);
    this.characters = this.characterService.getCharacters();
  }

  width = 800;
  height = 600;

  ngOnInit() {
    this.isHandset$.subscribe((onMobile) => {
      this.isMobile = onMobile;
    });

    this.pApp = new PIXI.Application({
      resolution: this.isMobile ? 0.45 : 1,
      height: this.height,
      width: this.width,
      backgroundColor : 0x1099bb,
      antialias: true
    });
    this.pixiContainer.nativeElement.appendChild(this.pApp.view);
    this.pApp.stage.interactive = true;
    this.pApp.resolution = 0.1;
    window.addEventListener('resize', () => {
      this.pApp.resolution = 0.45;
    });

    PIXI.loader.add('spineboy', '/assets/spine/warrior/warrior.json')
      .load((loader, res) => {

        this.selectedCharacter$.subscribe((c) => {
          this.player = new Character(c, this.pApp, 0, this.pApp.screen.height);
          this.enemy = new Character(c, this.pApp, this.pApp.screen.width - 50, this.pApp.screen.height);
          this.enemy.flipX(false);
        });
      });

  }

  changeWeapon(sword: string) {
    this.player.setAttachment('arm_sword', sword);
  }

  async fight(target: Character) {
    const enemyId = target._id;

    this.player.setTarget(this.enemy);
    this.enemy.setTarget(this.player);
    this.enemy.setCharacter(target);

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
  }
}
