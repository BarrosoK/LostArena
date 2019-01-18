import {Component, OnInit} from '@angular/core';
import {Select, Store} from '@ngxs/store';
import {SocketService} from '../../services/socket.service';
import {UserState} from '../stores/states/user.state';
import {Observable} from 'rxjs';
import {Character, CharacterChat} from '../models/Character';
import {filter, first} from 'rxjs/operators';
import {CharacterService} from '../../services/character.service';
import {AddChatRoom} from "../stores/actions/socket.actions";

@Component({
  selector: 'app-pvp',
  templateUrl: './pvp.component.html',
  styleUrls: ['./pvp.component.scss']
})
export class PvpComponent implements OnInit {

  @Select(UserState.selectedCharacter) character$: Observable<Character>;
  lobby = new Map();

  constructor(private store: Store, private socket: SocketService, private characterService: CharacterService) {
  }

  ngOnInit() {
    this.character$.subscribe((c) => {
      if (!c) {
        return;
      }
      this.socket.joinPvp(c);
    });
    this.socket.onJoinList().subscribe((cl: Map<string, string>) => {
      cl.forEach((value, key) => {
        console.log(key, value);
        this.lobby.set(value[0], value[1]);
      });
      console.log('pvp list', cl, this.lobby);
      this.socket.onJoinPvp().subscribe(c => {
        if (this.lobby.has(c[0])) {
          console.log('fdp');
        }
        console.log('pvp join', c);
        this.lobby.set(c[0], c[1]);
      });
    });


  }

}
