import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Select, Store} from '@ngxs/store';
import {CharacterService} from '../../services/character.service';
import {SocketService} from '../../services/socket.service';
import {Observable, of} from 'rxjs';
import {flatMap, map, switchMap} from 'rxjs/operators';
import {CharacterChat, CharacterMoveDirection} from '../models/Character';
import {UserState} from '../stores/states/user.state';
import {AddChatRoom, AddChatRoomMessage, ClearChatRoom, RemoveChatRoom} from '../stores/actions/socket.actions';
import {LEFT_ARROW, RIGHT_ARROW, SPACE} from '@angular/cdk/keycodes';
import {SocketState} from '../stores/states/socket.state';
import {FormBuilder, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';

declare var PIXI: any;

@Component({
  selector: 'app-chatroom',
  templateUrl: './chatroom.component.html',
  styleUrls: ['./chatroom.component.scss']
})
export class ChatroomComponent implements OnInit, OnDestroy {

  constructor(private fb: FormBuilder, private breakpointObserver: BreakpointObserver, private store: Store,
              private characterService: CharacterService, private socket: SocketService) {
  }

  @Select(SocketState.chatRoom) characters$: Observable<CharacterChat[]>;
  @Select(SocketState.chatRoomMessages) messages$: Observable<{id, type, text}[]>;

  isMobile = false;
  @ViewChild('pixiContainer') pixiContainer;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  player: CharacterChat;
  /* PIXI */
  public pApp: any;
  width = 800;
  height = 600;

  chatForm = this.fb.group({
    text: [null, Validators.required],
  });

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode === RIGHT_ARROW) {
      this.player.setMovingDirection(CharacterMoveDirection.RIGHT);
    }

    if (event.keyCode === LEFT_ARROW) {
      this.player.setMovingDirection(CharacterMoveDirection.LEFT);
    }

    if (event.keyCode === SPACE) {
      this.player.jump();
    }
  }

  @HostListener('window:keyup', ['$event'])
  keyEventDown(event: KeyboardEvent) {
    if (event.keyCode === 39) {
      this.player.setMovingDirection(CharacterMoveDirection.IDLE);
    }

    if (event.keyCode === 37) {
      this.player.setMovingDirection(CharacterMoveDirection.IDLE);
    }
  }


  @HostListener('window:unload')
  onUnload() {
    this.socket.chatRoomLeave();
    this.store.dispatch(new ClearChatRoom());
  }


  ngOnDestroy() {
    console.log('ealving');
    this.socket.chatRoomLeave();
  }


  onSubmit() {
    console.log(this.chatForm.getRawValue().text);
    this.socket.sendChat(this.chatForm.getRawValue().text);
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
    this.store.dispatch(new ClearChatRoom());
    // listen to fzefze progress event
    this.pApp.loader.on('progress', (l, res) => {
      text.text = l.progress;
      text.x = this.pApp.screen.width / 2 - text.width / 2;
    });
    // listen to the complete event, it will be fired when everything is loaded
    this.pApp.loader.on('complete', (l, res) => {
      text.destroy();
      this.store.selectOnce(UserState.selectedCharacter).subscribe((c) => {
        if (!c) {
          return;
        }
        this.player = new CharacterChat(this.pApp, c.name, {x: 100, y: 100}, this.socket);
        this.store.dispatch(new AddChatRoom(this.player));
        this.socket.addChatRoom(this.player);

        /* PLAYER JOINED */
        this.socket.onChatRoomJoin().subscribe((j) => {
          console.log('JOINED', j, j['name']);
          this.socket.onChatRoomList().subscribe((cl: any[]) => {
            console.log('JOINED', cl);
          });
          const cc = new CharacterChat(this.pApp, j['name'], j['position']);
          this.store.dispatch(new AddChatRoom(cc));
        });

        /* ON CHAT */
        this.socket.onChatRoomChat().subscribe((chat) => {
          this.store.dispatch(new AddChatRoomMessage(chat['id'], chat['type'], chat['text']));
            const t =    this.store.selectSnapshot(SocketState.chatRoom).filter((o) => o.name === chat['id']);
            if (t.length === 0) {
              return;
            }
            console.log('CHAT', chat);
            t[0].addChat(chat['text']);
        });
    

        /* ON CONNECT */
        this.socket.onChatRoomList().subscribe((cl: any[]) => {
          console.log('list', cl);
          cl.forEach((p) => {
            if (p[1]['name'] !== c.name) {
              const cc = new CharacterChat(this.pApp, p[1]['name'], p[1]['position']);
              this.store.dispatch(new AddChatRoom(cc));
            }
          });
        });

        /* PLAYER STATE */
        this.socket.onChatRoomState().subscribe(({id, state, loop, index}) => {
          console.log(id, state);
          if (!state) {
            return;
          }
          this.characters$.subscribe((characters) => {
            const t = characters.filter((o) => o.name === id);
            if (t.length === 0) {
              return;
            }
            if (t[0].getCurrentAnimationName() !== state) {
              if ((state === 'run' || state === 'idle') && (t[0].isFalling || t[0].isJumping) && t[0].getCurrentAnimationName() === 'jump') {
                return;
              }
              t[0].spine.state.setAnimation(index, state, loop);
            }
          });
        });

        /* PLAYER MOVE */
        this.socket.onChatRoomMove().subscribe(({id, position, face}) => {
          this.characters$.subscribe((characters) => {
            const t = characters.filter((o) => o.name === id);
            if (t.length === 0) {
              return;
            }
            t[0].flipX(face);
            t[0].spine.x = position.x;
            t[0].spine.y = position.y;
          });
        });

        /* PLAYER LEFT */
        this.socket.onChatRoomLeave().subscribe(id => {
          console.log('leave', id);
          this.store.dispatch(new RemoveChatRoom(id));
        });

      });
    });
    // start loading
    this.pApp.loader.load();
  }

}
