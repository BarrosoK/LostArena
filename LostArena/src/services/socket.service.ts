import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import {map, tap} from 'rxjs/operators';
import {Store} from '@ngxs/store';
import {AddMessageSystem} from '../app/stores/actions/socket.actions';
import {Observable} from 'rxjs';
import {SocketState} from '../app/stores/states/socket.state';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  messagesSystem$: Observable<string[]>;
  clients$: Observable<number>;

  constructor(private socket: Socket, private store: Store) {
    this.getMessageSystem().subscribe((msg: string) => {
      this.store.dispatch(new AddMessageSystem(msg));
    });
    this.messagesSystem$ = this.store.select(SocketState.sysMessages);
    this.clients$ = this.socket.fromEvent('clients');
  }

  sendMessage(msg: string) {
    this.socket.emit('message', msg);
  }

  getMessageSystem() {
    return this.socket.fromEvent('msg_sys');
  }
}
