import {Action, Select, Selector, State, StateContext} from '@ngxs/store';
import {AddMessageCombat, AddMessageSystem, RemoveMessageCombat, RemoveMessageSystem} from '../actions/socket.actions';

export interface SocketStateModel {
  sysMessages: string[];
  cmbMessages: string[];
}​

@State<SocketStateModel>({
  name: 'socket',
  defaults: {
    sysMessages: [],
    cmbMessages: []
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
}


