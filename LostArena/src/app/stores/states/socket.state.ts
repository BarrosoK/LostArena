import {Action, Select, Selector, State, StateContext} from '@ngxs/store';
import {
  AddChatRoom,
  AddMessageCombat,
  AddMessageSystem, RemoveChatRoom,
  RemoveMessageCombat,
  RemoveMessageSystem
} from '../actions/socket.actions';
import {CharacterChat} from '../../models/Character';
import {st} from "@angular/core/src/render3";

export interface SocketStateModel {
  sysMessages: string[];
  cmbMessages: string[];
  chatRoom: CharacterChat[];
}​

@State<SocketStateModel>({
  name: 'socket',
  defaults: {
    sysMessages: [],
    cmbMessages: [],
    chatRoom: []
  }
})
export class SocketState {
  constructor() {}

  @Selector()
  static sysMessages(state: SocketStateModel) {
    return state.sysMessages;
  }

  @Selector()
  static cmbMessages(state: SocketStateModel) {
    return state.cmbMessages;
  }

  @Selector()
  static chatRoom(state: SocketStateModel) {
    return state.chatRoom;
  }

  @Action(RemoveMessageSystem)
  removeMessageSystem({getState, patchState}: StateContext<SocketStateModel>, {id}: RemoveMessageSystem) {
    const state = getState();
    patchState({
      sysMessages: state.sysMessages.filter((msg, i) => {
        return i !== +id;
      })
    });
  }

  @Action(AddMessageSystem)
  addMessageSystem({getState, patchState}: StateContext<SocketStateModel>, {message}: AddMessageSystem) {
    const state = getState();
    patchState({
      sysMessages: [message, ...state.sysMessages]
    });
  }


  @Action(RemoveMessageCombat)
  removeMessageCombat({getState, patchState}: StateContext<SocketStateModel>, {id}: RemoveMessageCombat) {
    const state = getState();
    patchState({
      cmbMessages: state.cmbMessages.filter((msg, i) => {
        return i !== +id;
      })
    });
  }

  @Action(AddMessageCombat)
  addMessageCombat({getState, patchState}: StateContext<SocketStateModel>, {message}: AddMessageCombat) {
    const state = getState();
    patchState({
      cmbMessages: [message, ...state.cmbMessages]
    });
  }

  @Action(AddChatRoom)
  addChatRoom({getState, patchState}: StateContext<SocketStateModel>, {payload}: AddChatRoom) {
    const state = getState();
    payload.id = state.chatRoom.length;
    patchState({
      chatRoom: [payload, ...state.chatRoom]
    });
  }

  @Action(RemoveChatRoom)
  removeChatRoom({getState, patchState}: StateContext<SocketStateModel>, {payload}: RemoveChatRoom) {
    const state = getState();
    const c = state.chatRoom.filter(c => c.name === payload);
    c[0].remove();
    patchState({
      chatRoom: state.chatRoom.filter((i) => {
        return i.name !== payload;
      })
    });
  }
}


