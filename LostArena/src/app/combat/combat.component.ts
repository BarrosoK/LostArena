import {Component, OnInit, ViewChild} from '@angular/core';
import {ICharacter, Character} from '../models/Character';
import {Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {UserState} from '../stores/states/user.state';
import {map} from 'rxjs/operators';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';

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

  constructor(private breakpointObserver: BreakpointObserver, private store: Store) {
    this.selectedCharacter$ = this.store.select(UserState.selectedCharacter);
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
        this.player = new Character(this.pApp, 0, this.pApp.screen.height);
        this.enemy = new Character(this.pApp, this.pApp.screen.width - 50, this.pApp.screen.height);
      });

  }

  changeWeapon(sword: string) {
    this.player.setAttachment('arm_sword', sword);
  }

}
