import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import {map, switchMap, tap} from 'rxjs/operators';
import {Store} from '@ngxs/store';
import {AddMessageSystem} from '../app/stores/actions/socket.actions';
import {merge, Observable} from 'rxjs';
import {SocketState} from '../app/stores/states/socket.state';
import {CharacterChat} from '../app/models/Character';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  messagesSystem$: Observable<string[]>;
  messagesCombat$: Observable<string[]>;
  messagesAll$: Observable<string[]>;
  clients$: Observable<number>;

  constructor(private socket: Socket, private store: Store) {
    this.messagesSystem$ = this.store.select(SocketState.sysMessages);
    this.messagesCombat$ = this.store.select(SocketState.cmbMessages);
    this.clients$ = this.socket.fromEvent('clients');
  }

  login(user) {
    console.log('oui');
    this.socket.emit('login', user);
  }

  disconnect() {
    this.socket.emit('disconnect', '');
  }

  sendMessage(msg: string) {
    this.socket.emit('message', msg);
  }

  getMessageSystem() {
    return this.socket.fromEvent('msg_sys');
  }

  getMessageCombat() {
    return this.socket.fromEvent('combat');
  }

  getAllMessage() {
    return merge(this.socket.fromEvent('msg_sys'), this.socket.fromEvent('combat'));
  }

  onChatRoomJoin() {
    return this.socket.fromEvent('chatroom join');
  }

  onChatRoomList() {
    return this.socket.fromEvent('chatroom list');
  }

  addChatRoom(character: CharacterChat) {
    this.socket.emit('chatroom join',
      {
        id: character.id,
        name: character.name,
        position: character.position
    });
  }

  removeChatRoom(characterId: number) {

  }

  onChatRoomLeave() {
    return this.socket.fromEvent('chatroom leave');
  }

  chatRoomLeave() {
    this.socket.emit('chatroom leave', '');
    console.log('emited');
  }

  onChatRoomMove() {
    return this.socket.fromEvent('chatroom move');
  }

  onChatRoomState() {
    return this.socket.fromEvent('chatroom state');
  }

  onChatRoomChat() {
    return this.socket.fromEvent('chatroom chat');
  }

  sendChat(text) {
    this.socket.emit('chatroom chat', {type: 'general', text: text});
  }

  sendState(state, loop = true, index = 0) {
    this.socket.emit('chatroom state', {state: state, loop: loop, index: index});
  }

  move(position: any, face: boolean) {
    this.socket.emit('chatroom move', {position: position, face: face});
  }
}
